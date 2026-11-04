use crate::failure;
use nofy_agent_runtime::Error;
use serde::Serialize;

#[derive(Serialize)]
pub(crate) struct Frame {
    pub event: String,
    pub data: String,
}
/// Raw-byte framing keeps split UTF-8 and CRLF intact. Both the unfinished
/// line and all data belonging to an unfinished event count against one cap.
pub(crate) struct Decoder {
    line: Vec<u8>,
    data: Vec<u8>,
    event: String,
    first: bool,
    after_cr: bool,
    size: usize,
    cap: usize,
}
impl Decoder {
    pub fn new(cap: usize) -> Self {
        Self {
            line: Vec::new(),
            data: Vec::new(),
            event: String::new(),
            first: true,
            after_cr: false,
            size: 0,
            cap,
        }
    }
    pub fn byte(&mut self, byte: u8) -> Result<Option<Frame>, Error> {
        if self.after_cr {
            self.after_cr = false;
            if byte == b'\n' {
                return Ok(None);
            }
        }
        self.size = self
            .size
            .checked_add(1)
            .ok_or_else(|| failure("frame_limit"))?;
        if self.size > self.cap {
            return Err(failure("frame_limit"));
        }
        if byte == b'\r' || byte == b'\n' {
            self.after_cr = byte == b'\r';
            return self.line();
        }
        self.line.push(byte);
        Ok(None)
    }
    fn line(&mut self) -> Result<Option<Frame>, Error> {
        let bytes = std::mem::take(&mut self.line);
        let mut line = std::str::from_utf8(&bytes).map_err(|_| failure("invalid_utf8"))?;
        if self.first {
            self.first = false;
            line = line.strip_prefix('\u{feff}').unwrap_or(line);
        }
        if line.is_empty() {
            self.size = 0;
            if self.data.is_empty() {
                self.event.clear();
                return Ok(None);
            }
            self.data.pop();
            let data = String::from_utf8(std::mem::take(&mut self.data))
                .map_err(|_| failure("invalid_utf8"))?;
            return Ok(Some(Frame {
                event: std::mem::take(&mut self.event),
                data,
            }));
        }
        if line.starts_with(':') {
            return Ok(None);
        }
        let (name, value) = line.split_once(':').unwrap_or((line, ""));
        let value = value.strip_prefix(' ').unwrap_or(value);
        match name {
            "event" => self.event = value.to_owned(),
            "data" => {
                self.data.extend_from_slice(value.as_bytes());
                self.data.push(b'\n');
            }
            _ => {}
        }
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn unicode_bom_multiline_comments_and_all_newlines() {
        let mut decoder = Decoder::new(128);
        let frames = "\u{feff}: comment\r\nevent: text\rdata: 中\r\ndata: 文\n\rdata:\n\n"
            .as_bytes()
            .iter()
            .filter_map(|b| decoder.byte(*b).unwrap())
            .collect::<Vec<_>>();
        assert_eq!(frames.len(), 2);
        assert_eq!(frames[0].event, "text");
        assert_eq!(frames[0].data, "中\n文");
        assert_eq!(frames[1].data, "");
    }
    #[test]
    fn unfinished_lines_comments_and_whole_events_are_bounded() {
        for input in [
            "data: abcdefghijkl",
            ": comment comment",
            "data: a\ndata: b\ndata: c\n",
        ] {
            let mut decoder = Decoder::new(16);
            assert!(input.bytes().any(|b| decoder.byte(b).is_err()));
        }
    }
}
