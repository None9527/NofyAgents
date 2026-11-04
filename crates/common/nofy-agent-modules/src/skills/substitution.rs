//! Bounded replacement primitive shared by all declared skill rendering.
#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct SubstitutionLimits {
    pub max_input_bytes: usize,
    pub max_output_bytes: usize,
    pub max_work_bytes: usize,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, thiserror::Error)]
pub enum SubstitutionError {
    #[error("skill substitution input exceeds byte limit")]
    InputLimit,
    #[error("skill substitution output exceeds byte limit")]
    OutputLimit,
    #[error("skill substitution work exceeds byte limit")]
    WorkLimit,
    #[error("skill substitution allocation failed")]
    Allocation,
}

pub(crate) struct Substitutions {
    text: String,
    limits: SubstitutionLimits,
    work: usize,
}

impl Substitutions {
    pub(crate) fn new(
        text: &str,
        limits: SubstitutionLimits,
        other_input: usize,
    ) -> Result<Self, SubstitutionError> {
        let input = text
            .len()
            .checked_add(other_input)
            .ok_or(SubstitutionError::InputLimit)?;
        if input > limits.max_input_bytes {
            return Err(SubstitutionError::InputLimit);
        }
        let mut out = Self {
            text: String::new(),
            limits,
            work: 0,
        };
        out.check_output(text.len())?;
        out.charge(input)?;
        out.text
            .try_reserve_exact(text.len())
            .map_err(|_| SubstitutionError::Allocation)?;
        out.text.push_str(text);
        Ok(out)
    }

    fn check_output(&self, size: usize) -> Result<(), SubstitutionError> {
        if size > self.limits.max_output_bytes {
            Err(SubstitutionError::OutputLimit)
        } else {
            Ok(())
        }
    }

    fn charge(&mut self, size: usize) -> Result<(), SubstitutionError> {
        self.work = self
            .work
            .checked_add(size)
            .filter(|work| *work <= self.limits.max_work_bytes)
            .ok_or(SubstitutionError::WorkLimit)?;
        Ok(())
    }

    fn scan(&mut self, passes: usize) -> Result<(), SubstitutionError> {
        let size = self
            .text
            .len()
            .checked_mul(passes)
            .ok_or(SubstitutionError::WorkLimit)?;
        self.charge(size)?;
        Ok(())
    }

    /// Original passes visit each index descending exactly once. Re-scan only
    /// after a replacement: lower references can be introduced by arguments or
    /// by concatenation, so collecting only the original references is unsound.
    pub(crate) fn next_index(
        &mut self,
        indexed: bool,
        ceiling: usize,
    ) -> Result<Option<usize>, SubstitutionError> {
        // Prefix search, digit-run recognition, then checked integer parsing.
        self.scan(3)?;
        let prefix = if indexed { "$ARGUMENTS[" } else { "$" };
        let mut highest = None;
        for (offset, _) in self.text.match_indices(prefix) {
            let tail = &self.text.as_bytes()[offset + prefix.len()..];
            let digits = tail.iter().take_while(|c| c.is_ascii_digit()).count();
            if digits == 0
                || digits > 1 && tail[0] == b'0'
                || indexed && tail.get(digits) != Some(&b']')
            {
                continue;
            }
            let index = tail[..digits].iter().try_fold(0usize, |n, byte| {
                n.checked_mul(10)?.checked_add(usize::from(byte - b'0'))
            });
            if let Some(index) = index.filter(|index| *index < ceiling) {
                highest = Some(highest.map_or(index, |old: usize| old.max(index)));
            }
        }
        Ok(highest)
    }

    pub(crate) fn replace(
        &mut self,
        pattern: &str,
        replacement: &str,
        digit_boundary: bool,
    ) -> Result<bool, SubstitutionError> {
        debug_assert!(!pattern.is_empty());
        // Both matching passes are charged before they run. Strings are never
        // grown speculatively: compute the exact final size first.
        self.scan(2)?;
        let accepts = |offset: usize| {
            !digit_boundary
                || !self
                    .text
                    .as_bytes()
                    .get(offset + pattern.len())
                    .is_some_and(u8::is_ascii_digit)
        };
        let count = self
            .text
            .match_indices(pattern)
            .filter(|(offset, _)| accepts(*offset))
            .count();
        if count == 0 {
            return Ok(false);
        }
        let size = self.text.len() - count * pattern.len();
        let size = replacement
            .len()
            .checked_mul(count)
            .and_then(|added| size.checked_add(added))
            .ok_or(SubstitutionError::OutputLimit)?;
        self.check_output(size)?;
        self.scan(2)?;
        self.charge(size)?;
        let mut out = String::new();
        out.try_reserve_exact(size)
            .map_err(|_| SubstitutionError::Allocation)?;
        let mut end = 0;
        for (offset, _) in self.text.match_indices(pattern) {
            if !digit_boundary
                || !self
                    .text
                    .as_bytes()
                    .get(offset + pattern.len())
                    .is_some_and(u8::is_ascii_digit)
            {
                out.push_str(&self.text[end..offset]);
                out.push_str(replacement);
                end = offset + pattern.len();
            }
        }
        out.push_str(&self.text[end..]);
        debug_assert_eq!(out.len(), size);
        self.text = out;
        Ok(true)
    }

    pub(crate) fn append(&mut self, text: &str) -> Result<(), SubstitutionError> {
        let size = self
            .text
            .len()
            .checked_add(text.len())
            .ok_or(SubstitutionError::OutputLimit)?;
        self.check_output(size)?;
        self.charge(text.len())?;
        self.text
            .try_reserve_exact(text.len())
            .map_err(|_| SubstitutionError::Allocation)?;
        self.text.push_str(text);
        Ok(())
    }

    pub(crate) fn finish(self) -> String {
        self.text
    }
}
