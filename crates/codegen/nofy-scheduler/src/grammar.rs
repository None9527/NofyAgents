//! Cron grammar (FR3.5, HM-F10 half): strict 5-field parsing and
//! next-fire computation.
//!
//! Fields: `minute hour day-of-month month day-of-week`, each a comma
//! list of `*`, `N`, `A-B`, `*/S`, `A-B/S` (and `N/S` = `N-max/S`, Vixie
//! semantics). Ranges: minute 0-59, hour 0-23, dom 1-31, month 1-12,
//! dow 0-6 (0 = Sunday). Standard dom/dow rule: when BOTH are restricted,
//! a day matching EITHER fires.
//!
//! Pure: parsing and [`CronExpr::next_after`] are deterministic functions
//! with no clock access — the engine supplies "now".

use std::collections::BTreeSet;

use chrono::{Datelike, Duration, NaiveDate, NaiveDateTime, Timelike};

/// Days scanned before giving up on finding the next fire (~5 years).
const MAX_SCAN_DAYS: u32 = 366 * 5;

/// A parsed cron expression: sorted allowed values per field.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CronExpr {
    pub minute: Vec<u8>,
    pub hour: Vec<u8>,
    pub dom: Vec<u8>,
    pub month: Vec<u8>,
    pub dow: Vec<u8>,
    /// Whether dom/dow were `*` — drives the either-or day rule.
    dom_wild: bool,
    dow_wild: bool,
}

/// Parse a 5-field cron expression. Errors carry a human-readable reason.
pub fn parse(expr: &str) -> Result<CronExpr, String> {
    let fields: Vec<&str> = expr.split_whitespace().collect();
    if fields.len() != 5 {
        return Err(format!("expected 5 fields, got {}", fields.len()));
    }
    let (minute, _) = parse_field(fields[0], 0, 59, "minute")?;
    let (hour, _) = parse_field(fields[1], 0, 23, "hour")?;
    let (dom, dom_wild) = parse_field(fields[2], 1, 31, "day-of-month")?;
    let (month, _) = parse_field(fields[3], 1, 12, "month")?;
    let (dow, dow_wild) = parse_field(fields[4], 0, 6, "day-of-week")?;
    Ok(CronExpr {
        minute,
        hour,
        dom,
        month,
        dow,
        dom_wild,
        dow_wild,
    })
}

/// Parse one field into sorted unique values + a wildcard flag.
fn parse_field(field: &str, min: u8, max: u8, name: &str) -> Result<(Vec<u8>, bool), String> {
    if field.is_empty() {
        return Err(format!("{name}: empty field"));
    }
    let wild = field == "*";
    let mut values = BTreeSet::new();
    for part in field.split(',') {
        if part.is_empty() {
            return Err(format!("{name}: empty list item"));
        }
        let (range_part, step) = match part.split_once('/') {
            Some((range, step_str)) => {
                let step: u32 = step_str
                    .parse()
                    .map_err(|_| format!("{name}: bad step '{step_str}'"))?;
                if step == 0 {
                    return Err(format!("{name}: step must be > 0"));
                }
                (range, step as u8)
            }
            None => (part, 1),
        };
        let (lo, hi) = if range_part == "*" {
            (min, max)
        } else if let Some((a, b)) = range_part.split_once('-') {
            let lo = parse_value(a, min, max, name)?;
            let hi = parse_value(b, min, max, name)?;
            if lo > hi {
                return Err(format!("{name}: range {lo}-{hi} is backwards"));
            }
            (lo, hi)
        } else {
            let v = parse_value(range_part, min, max, name)?;
            // Vixie: `N/S` means N..=max with step S; plain `N` is just N.
            if step > 1 || part.contains('/') {
                (v, max)
            } else {
                (v, v)
            }
        };
        let mut value = lo;
        while value <= hi {
            values.insert(value);
            value = match value.checked_add(step) {
                Some(v) => v,
                None => break,
            };
        }
    }
    Ok((values.into_iter().collect(), wild))
}

fn parse_value(text: &str, min: u8, max: u8, name: &str) -> Result<u8, String> {
    let value: u16 = text
        .parse()
        .map_err(|_| format!("{name}: bad value '{text}'"))?;
    if value < min as u16 || value > max as u16 {
        return Err(format!("{name}: value {value} out of range {min}-{max}"));
    }
    Ok(value as u8)
}

impl CronExpr {
    /// Day rule: both restricted → either matches; one wild → the other
    /// must match; both wild → every day.
    fn day_matches(&self, date: NaiveDate) -> bool {
        let dom_ok = self.dom.contains(&(date.day() as u8));
        let dow_ok = self
            .dow
            .contains(&(date.weekday().num_days_from_sunday() as u8));
        match (self.dom_wild, self.dow_wild) {
            (true, true) => true,
            (true, false) => dow_ok,
            (false, true) => dom_ok,
            (false, false) => dom_ok || dow_ok,
        }
    }

    /// The first fire strictly after `from`, or `None` within ~5 years.
    /// Deterministic: pure function of the expression and `from`.
    pub fn next_after(&self, from: NaiveDateTime) -> Option<NaiveDateTime> {
        // Start at the next whole minute.
        let mut cursor =
            from.with_second(0).and_then(|t| t.with_nanosecond(0))? + Duration::minutes(1);
        let mut days_scanned = 0u32;
        while days_scanned < MAX_SCAN_DAYS {
            let date = cursor.date();
            if !self.month.contains(&(date.month() as u8)) {
                // Skip to the first day of the next month.
                let (year, month) = if date.month() == 12 {
                    (date.year() + 1, 1)
                } else {
                    (date.year(), date.month() + 1)
                };
                cursor = NaiveDate::from_ymd_opt(year, month, 1)?.and_hms_opt(0, 0, 0)?;
                continue;
            }
            if !self.day_matches(date) {
                cursor = date.succ_opt()?.and_hms_opt(0, 0, 0)?;
                days_scanned += 1;
                continue;
            }
            if let Some(hit) = self.first_time_on_or_after(cursor) {
                return Some(hit);
            }
            cursor = date.succ_opt()?.and_hms_opt(0, 0, 0)?;
            days_scanned += 1;
        }
        None
    }

    /// First (hour, minute) combination at/after `cursor` within its day.
    fn first_time_on_or_after(&self, cursor: NaiveDateTime) -> Option<NaiveDateTime> {
        let date = cursor.date();
        for &hour in &self.hour {
            let min_minute = if hour as u32 > cursor.hour() {
                0u8
            } else if hour as u32 == cursor.hour() {
                cursor.minute() as u8
            } else {
                continue;
            };
            for &minute in &self.minute {
                if minute >= min_minute {
                    return date.and_hms_opt(hour as u32, minute as u32, 0);
                }
            }
        }
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dt(y: i32, m: u32, d: u32, h: u32, min: u32) -> NaiveDateTime {
        NaiveDate::from_ymd_opt(y, m, d)
            .unwrap()
            .and_hms_opt(h, min, 0)
            .unwrap()
    }

    #[test]
    fn parses_common_expressions() {
        let expr = parse("*/15 * * * *").unwrap();
        assert_eq!(expr.minute, vec![0, 15, 30, 45]);
        assert_eq!(expr.hour.len(), 24);

        let expr = parse("0 9 * * 1-5").unwrap();
        assert_eq!(expr.minute, vec![0]);
        assert_eq!(expr.hour, vec![9]);
        assert_eq!(expr.dow, vec![1, 2, 3, 4, 5]);

        let expr = parse("5,20 0 1 1 *").unwrap();
        assert_eq!(expr.minute, vec![5, 20]);
        assert_eq!(expr.dom, vec![1]);
        assert_eq!(expr.month, vec![1]);

        // Vixie `N/S`: start..=max with step.
        let expr = parse("10/20 * * * *").unwrap();
        assert_eq!(expr.minute, vec![10, 30, 50]);
    }

    #[test]
    fn rejects_invalid_expressions() {
        for bad in [
            "",             // empty
            "* * * *",      // 4 fields
            "* * * * * *",  // 6 fields
            "60 * * * *",   // minute out of range
            "* 24 * * *",   // hour out of range
            "* * 0 * *",    // dom out of range
            "* * * 13 *",   // month out of range
            "* * * * 7",    // dow out of range
            "5-1 * * * *",  // backwards range
            "*/0 * * * *",  // zero step
            "a * * * *",    // garbage
            "1,,2 * * * *", // empty list item
        ] {
            assert!(parse(bad).is_err(), "must reject: '{bad}'");
        }
    }

    #[test]
    fn next_fire_quarter_hourly() {
        let expr = parse("*/15 * * * *").unwrap();
        assert_eq!(
            expr.next_after(dt(2026, 8, 17, 10, 7)),
            Some(dt(2026, 8, 17, 10, 15))
        );
        // Exactly on a fire minute: the NEXT fire is strictly later.
        assert_eq!(
            expr.next_after(dt(2026, 8, 17, 10, 15)),
            Some(dt(2026, 8, 17, 10, 30))
        );
    }

    #[test]
    fn next_fire_weekday_wrap() {
        // 2026-08-14 is a Friday; weekdays-only 09:00 wraps to Monday.
        let expr = parse("0 9 * * 1-5").unwrap();
        assert_eq!(
            expr.next_after(dt(2026, 8, 14, 10, 0)),
            Some(dt(2026, 8, 17, 9, 0))
        );
        // Mid-week: next day.
        assert_eq!(
            expr.next_after(dt(2026, 8, 12, 10, 0)),
            Some(dt(2026, 8, 13, 9, 0))
        );
    }

    #[test]
    fn next_fire_leap_day() {
        let expr = parse("0 0 29 2 *").unwrap();
        // 2026 and 2027 have no Feb 29; 2028 does.
        assert_eq!(
            expr.next_after(dt(2026, 1, 1, 0, 0)),
            Some(dt(2028, 2, 29, 0, 0))
        );
    }

    #[test]
    fn dom_dow_either_or_when_both_restricted() {
        // The 13th OR a Friday.
        let expr = parse("0 0 13 * 5").unwrap();
        // 2026-08-17 is a Monday; next Friday is the 21st (before the 13th of Sept... wait: Aug 21 < Sept 13).
        assert_eq!(
            expr.next_after(dt(2026, 8, 17, 1, 0)),
            Some(dt(2026, 8, 21, 0, 0))
        );
        // From Aug 22, the Friday is the 28th.
        assert_eq!(
            expr.next_after(dt(2026, 8, 22, 0, 0)),
            Some(dt(2026, 8, 28, 0, 0))
        );
    }

    #[test]
    fn impossible_expression_returns_none() {
        // Weekday-only Feb 30 never exists... dom 30 in February: use a
        // truly impossible combo — Feb 30 is invalid dom for the month.
        let expr = parse("0 0 30 2 *").unwrap();
        assert_eq!(expr.next_after(dt(2026, 1, 1, 0, 0)), None);
    }

    #[test]
    fn next_fire_is_strictly_after_and_deterministic() {
        let expr = parse("5,20 * * * *").unwrap();
        let from = dt(2026, 8, 17, 23, 50);
        let first = expr.next_after(from).unwrap();
        assert!(first > from);
        assert_eq!(first, dt(2026, 8, 18, 0, 5), "wraps past midnight");
        assert_eq!(expr.next_after(from), Some(first), "pure = deterministic");
    }
}
