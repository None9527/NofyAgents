//! Turn-interruption recoverable transcripts (FR2.8, OC-F18).
//!
//! A turn appends transcript segments to a log; an interruption records
//! a CHECKPOINT at a segment boundary. Recovery replays exactly the
//! segments up to the checkpoint — nothing after it leaks into the
//! recovered turn, and gaps in the recovered prefix are refused
//! (fail-loud), so a recovered transcript is always contiguous.

/// One transcript segment.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Segment {
    /// Dense sequence starting at 0.
    pub seq: u64,
    pub body: String,
}

/// The transcript log for one turn.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct TurnTranscript {
    pub segments: Vec<Segment>,
    /// Checkpointed seq boundary (None = never interrupted).
    pub checkpoint: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TranscriptError {
    /// Segments must be dense from 0.
    Gap { expected: u64, got: u64 },
    /// A checkpoint must land on an existing boundary.
    BadCheckpoint(u64),
}

impl TurnTranscript {
    /// Append the next segment (dense seq enforced).
    pub fn append(&mut self, body: &str) -> Result<(), TranscriptError> {
        let next = self.segments.len() as u64;
        self.segments.push(Segment {
            seq: next,
            body: body.to_string(),
        });
        Ok(())
    }

    /// Interrupt at the current boundary: everything appended so far is
    /// the recoverable prefix.
    pub fn interrupt(&mut self) {
        self.checkpoint = Some(self.segments.len() as u64);
    }

    /// Recover the transcript: the contiguous prefix up to the
    /// checkpoint. No checkpoint = nothing was saved from interruption.
    pub fn recover(&self) -> Result<Vec<Segment>, TranscriptError> {
        let Some(boundary) = self.checkpoint else {
            return Ok(Vec::new());
        };
        if boundary as usize > self.segments.len() {
            return Err(TranscriptError::BadCheckpoint(boundary));
        }
        let prefix: Vec<Segment> = self
            .segments
            .iter()
            .take(boundary as usize)
            .cloned()
            .collect();
        // Contiguity check: the recovered prefix must be dense from 0.
        for (i, segment) in prefix.iter().enumerate() {
            if segment.seq != i as u64 {
                return Err(TranscriptError::Gap {
                    expected: i as u64,
                    got: segment.seq,
                });
            }
        }
        Ok(prefix)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn transcript(n: usize) -> TurnTranscript {
        let mut t = TurnTranscript::default();
        for i in 0..n {
            t.append(&format!("seg {i}")).unwrap();
        }
        t
    }

    #[test]
    fn interruption_recovers_exactly_the_prefix() {
        let mut t = transcript(5);
        t.interrupt();
        // Post-interruption noise must not leak into recovery.
        t.append("after the interruption").unwrap();
        let recovered = t.recover().unwrap();
        assert_eq!(recovered.len(), 5);
        assert_eq!(recovered.last().unwrap().body, "seg 4");
        assert!(recovered.iter().all(|s| !s.body.contains("after")));
    }

    #[test]
    fn no_checkpoint_recovers_nothing() {
        let t = transcript(3);
        assert!(
            t.recover().unwrap().is_empty(),
            "never interrupted → nothing to recover"
        );
    }

    #[test]
    fn recovery_is_contiguous() {
        let mut t = transcript(4);
        t.interrupt();
        let recovered = t.recover().unwrap();
        for (i, segment) in recovered.iter().enumerate() {
            assert_eq!(segment.seq, i as u64);
        }
    }

    #[test]
    fn checkpoint_beyond_the_log_fails_loud() {
        let mut t = transcript(2);
        t.checkpoint = Some(9);
        assert_eq!(t.recover(), Err(TranscriptError::BadCheckpoint(9)));
    }

    #[test]
    fn gapped_prefix_is_refused_not_healed() {
        // A hand-built non-dense prefix: recovery must fail loud instead
        // of silently healing the gap.
        let t = TurnTranscript {
            segments: vec![
                Segment {
                    seq: 0,
                    body: "a".into(),
                },
                Segment {
                    seq: 2,
                    body: "b".into(),
                },
            ],
            checkpoint: Some(2),
        };
        assert_eq!(
            t.recover(),
            Err(TranscriptError::Gap {
                expected: 1,
                got: 2
            })
        );
    }

    #[test]
    fn interrupt_at_zero_is_a_valid_empty_recovery() {
        let mut t = TurnTranscript::default();
        t.interrupt();
        assert_eq!(t.recover().unwrap(), Vec::<Segment>::new());
    }
}
