use super::*;

/// Byte-oriented line assembly preserves UTF-8 across arbitrary HTTP chunks.
/// The caller bounds all response bytes, including comments and ignored events.
#[derive(Default)]
pub(super) struct Decoder {
    line: Vec<u8>,
    data: Vec<u8>,
    event: String,
    skip_lf: bool,
    started: bool,
}
impl Decoder {
    pub(super) fn push(&mut self, bytes: &[u8]) -> Result<Vec<Value>, ToolError> {
        let mut messages = Vec::new();
        for &byte in bytes {
            if self.skip_lf {
                self.skip_lf = false;
                if byte == b'\n' {
                    continue;
                }
            }
            match byte {
                b'\r' | b'\n' => {
                    self.skip_lf = byte == b'\r';
                    if let Some(message) = self.finish_line()? {
                        messages.push(message);
                    }
                }
                _ => self.line.push(byte),
            }
        }
        Ok(messages)
    }
    fn finish_line(&mut self) -> Result<Option<Value>, ToolError> {
        let bytes = std::mem::take(&mut self.line);
        let mut line = std::str::from_utf8(&bytes).map_err(|_| protocol("MCP SSE is not UTF-8"))?;
        if !self.started {
            self.started = true;
            line = line.strip_prefix('\u{feff}').unwrap_or(line);
        }
        if line.is_empty() {
            let mut data = std::mem::take(&mut self.data);
            let event = std::mem::take(&mut self.event);
            if data.last() == Some(&b'\n') {
                data.pop();
            }
            if data.is_empty() || !(event.is_empty() || event == "message") {
                return Ok(None);
            }
            return serde_json::from_slice(&data)
                .map(Some)
                .map_err(|_| protocol("MCP SSE data is not a JSON-RPC message"));
        }
        let (field, value) = line.split_once(':').unwrap_or((line, ""));
        let value = value.strip_prefix(' ').unwrap_or(value);
        match field {
            "data" => {
                self.data.extend_from_slice(value.as_bytes());
                self.data.push(b'\n');
            }
            "event" => self.event = value.into(),
            _ => {}
        }
        Ok(None)
    }
}
