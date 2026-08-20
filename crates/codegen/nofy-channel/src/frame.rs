//! Length-prefixed JSON framing.
//!
//! Wire format: `u32` big-endian byte length followed by that many UTF-8 JSON
//! bytes. The reader tolerates arbitrary partial reads (TCP/WS chunking) and
//! rejects frames above [`MAX_FRAME_BYTES`] before allocating, so a corrupted
//! or hostile length cannot OOM the daemon.

use std::io::{self, Read, Write};

/// 16 MiB: control-plane messages are small; anything larger is a bug or an
/// attack, not a legitimate payload.
pub const MAX_FRAME_BYTES: u32 = 16 * 1024 * 1024;

#[derive(Debug)]
pub enum FrameError {
    Oversized { len: u32 },
    Io(io::Error),
}

impl std::fmt::Display for FrameError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Oversized { len } => {
                write!(f, "frame length {len} exceeds cap {MAX_FRAME_BYTES}")
            }
            Self::Io(e) => write!(f, "io: {e}"),
        }
    }
}

impl std::error::Error for FrameError {}

impl From<io::Error> for FrameError {
    fn from(e: io::Error) -> Self {
        FrameError::Io(e)
    }
}

/// Write one frame. Payload must already be validated JSON (caller contract:
/// "validate then encode").
pub fn write_frame<W: Write>(writer: &mut W, payload: &[u8]) -> io::Result<()> {
    let len = u32::try_from(payload.len())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "payload too large"))?;
    if len > MAX_FRAME_BYTES {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "payload exceeds frame cap",
        ));
    }
    writer.write_all(&len.to_be_bytes())?;
    writer.write_all(payload)?;
    writer.flush()
}

/// Blocking reader that reassembles frames across partial reads.
pub struct FrameReader<R: Read> {
    reader: R,
}

impl<R: Read> FrameReader<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    /// Read exactly one frame payload, or None at clean EOF (no bytes at all).
    pub fn read_frame(&mut self) -> Result<Option<Vec<u8>>, FrameError> {
        let mut hdr = [0u8; 4];
        match read_exact_or_eof(&mut self.reader, &mut hdr)? {
            false => return Ok(None),
            true => {}
        }
        let len = u32::from_be_bytes(hdr);
        if len > MAX_FRAME_BYTES {
            return Err(FrameError::Oversized { len });
        }
        let mut buf = vec![0u8; len as usize];
        self.reader.read_exact(&mut buf)?;
        Ok(Some(buf))
    }
}

/// read_exact that treats "no bytes at all" as EOF but partial-header as an
/// error (a torn length prefix is corruption, not clean shutdown).
fn read_exact_or_eof<R: Read>(r: &mut R, buf: &mut [u8]) -> io::Result<bool> {
    let mut filled = 0;
    while filled < buf.len() {
        match r.read(&mut buf[filled..])? {
            0 => {
                if filled == 0 {
                    return Ok(false);
                }
                return Err(io::Error::new(
                    io::ErrorKind::UnexpectedEof,
                    "torn frame header",
                ));
            }
            n => filled += n,
        }
    }
    Ok(true)
}

/// Borrowing convenience over [`FrameReader`] for one-shot readers.
pub fn read_frame_from<R: Read>(r: &mut R) -> Result<Option<Vec<u8>>, FrameError> {
    FrameReader::new(r).read_frame()
}

impl From<serde_json::Error> for FrameError {
    fn from(e: serde_json::Error) -> Self {
        FrameError::Io(io::Error::new(
            io::ErrorKind::InvalidData,
            format!("json: {e}"),
        ))
    }
}

/// Parse a frame payload as JSON (the receive-side "validate" half).
pub fn decode_json(payload: &[u8]) -> Result<serde_json::Value, FrameError> {
    serde_json::from_slice(payload).map_err(|e| {
        FrameError::Io(io::Error::new(
            io::ErrorKind::InvalidData,
            format!("frame payload is not valid JSON: {e}"),
        ))
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    #[test]
    fn roundtrip_across_partial_reads() {
        let mut wire = Vec::new();
        write_frame(&mut wire, b"{\"a\":1}").unwrap();
        write_frame(&mut wire, b"[1,2,3]").unwrap();

        // Feed byte-by-byte through a chaining reader to prove partial-read
        // tolerance.
        struct SlowReader<'a> {
            inner: &'a [u8],
            pos: usize,
        }
        impl Read for SlowReader<'_> {
            fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
                if self.pos >= self.inner.len() || buf.is_empty() {
                    return Ok(0);
                }
                buf[0] = self.inner[self.pos];
                self.pos += 1;
                Ok(1)
            }
        }

        let mut fr = FrameReader::new(SlowReader {
            inner: &wire,
            pos: 0,
        });
        let f1 = fr.read_frame().unwrap().unwrap();
        assert_eq!(decode_json(&f1).unwrap()["a"], 1);
        let f2 = fr.read_frame().unwrap().unwrap();
        assert_eq!(decode_json(&f2).unwrap()[1], 2);
        assert!(fr.read_frame().unwrap().is_none(), "clean EOF");
    }

    #[test]
    fn oversized_length_rejected_before_alloc() {
        let mut wire = Vec::new();
        wire.extend_from_slice(&(MAX_FRAME_BYTES + 1).to_be_bytes());
        let mut fr = FrameReader::new(Cursor::new(wire));
        assert!(matches!(
            fr.read_frame(),
            Err(FrameError::Oversized { len }) if len == MAX_FRAME_BYTES + 1
        ));
    }

    #[test]
    fn torn_header_is_error_not_eof() {
        let wire = [0u8, 0, 2]; // 2 of 4 header bytes then EOF
        let mut fr = FrameReader::new(Cursor::new(wire.to_vec()));
        assert!(matches!(
            fr.read_frame(),
            Err(FrameError::Io(e)) if e.kind() == io::ErrorKind::UnexpectedEof
        ));
    }

    #[test]
    fn invalid_json_payload_rejected() {
        let mut wire = Vec::new();
        write_frame(&mut wire, b"{not json").unwrap();
        let mut fr = FrameReader::new(Cursor::new(wire));
        let payload = fr.read_frame().unwrap().unwrap();
        assert!(decode_json(&payload).is_err());
    }

    #[test]
    fn display_renders_both_variants() {
        let oversized = FrameError::Oversized {
            len: MAX_FRAME_BYTES + 1,
        };
        assert_eq!(
            oversized.to_string(),
            format!(
                "frame length {} exceeds cap {MAX_FRAME_BYTES}",
                MAX_FRAME_BYTES + 1
            )
        );
        let wrapped = FrameError::Io(io::Error::new(io::ErrorKind::Other, "boom"));
        assert_eq!(wrapped.to_string(), "io: boom");
    }

    #[test]
    fn write_frame_refuses_payload_above_cap() {
        let payload = vec![0u8; MAX_FRAME_BYTES as usize + 1];
        let mut wire = Vec::new();
        let err = write_frame(&mut wire, &payload).unwrap_err();
        assert_eq!(err.kind(), io::ErrorKind::InvalidInput);
        assert!(wire.is_empty(), "refusal writes nothing");
    }

    #[test]
    fn write_frame_refuses_payload_beyond_u32_len() {
        // The u32 length guard fires only above u32::MAX bytes. A zero vec of
        // that size is lazily allocated and never written here, so it costs
        // virtual address space, not 4 GiB of resident RAM; write_frame reads
        // only the length before refusing.
        let payload = vec![0u8; u32::MAX as usize + 1];
        let mut wire = Vec::new();
        let err = write_frame(&mut wire, &payload).unwrap_err();
        assert_eq!(err.kind(), io::ErrorKind::InvalidInput);
        assert!(wire.is_empty(), "refusal writes nothing");
    }

    #[test]
    fn clean_eof_on_empty_cursor_is_none() {
        let mut fr = FrameReader::new(Cursor::new(Vec::new()));
        assert!(fr.read_frame().unwrap().is_none(), "no bytes = clean EOF");
    }

    #[test]
    fn read_frame_from_one_shot_helper() {
        let mut wire = Vec::new();
        write_frame(&mut wire, b"{\"ok\":true}").unwrap();
        let mut r = Cursor::new(wire);
        let payload = read_frame_from(&mut r).unwrap().unwrap();
        assert_eq!(decode_json(&payload).unwrap()["ok"], true);
        assert!(read_frame_from(&mut r).unwrap().is_none(), "clean EOF");
    }

    #[test]
    fn serde_json_error_converts_to_invalid_data() {
        let json_err = serde_json::from_slice::<serde_json::Value>(b"{oops").unwrap_err();
        let fe = FrameError::from(json_err);
        assert!(matches!(
            &fe,
            FrameError::Io(e) if e.kind() == io::ErrorKind::InvalidData
        ));
        assert!(fe.to_string().contains("json:"), "source error named");
    }
}
