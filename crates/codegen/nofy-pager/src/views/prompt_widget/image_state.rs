//! Re-binding of `[Image #N]` placeholder text to the image records held by the composer.

use std::collections::HashSet;

use nofy_ratatui_textarea::ElementId;

use super::{
    KIND_IMAGE, PROMPT_IMAGES_TRACING_TARGET, PromptWidget, chip_line, images_high_water,
    parse_image_display_number,
};

enum Record {
    Held(usize),
    Stashed(usize),
}

impl PromptWidget {
    /// Restore image-chip metadata over orphan placeholders backed by a held or stashed record.
    pub(super) fn rechip_orphan_image_placeholders(&mut self) -> Vec<usize> {
        let mut rechipped = Vec::new();
        if !self.textarea.text().contains("[Image #") {
            return rechipped;
        }

        let mut live = self.live_image_element_ids();
        let mut budget = Self::IMAGE_CAP.saturating_sub(live.len());
        let mut claimed: HashSet<usize> = self
            .textarea
            .elements()
            .iter()
            .filter(|element| element.kind == KIND_IMAGE)
            .filter_map(|element| {
                self.textarea
                    .text()
                    .get(element.range.clone())
                    .and_then(parse_image_display_number)
            })
            .collect();
        claimed.extend(self.attached_display_numbers(&live));

        let placeholders: Vec<(std::ops::Range<usize>, usize)> =
            canonical_image_placeholder_regex()
                .captures_iter(self.textarea.text())
                .filter_map(|captures| {
                    let number = captures.get(1)?.as_str().parse().ok()?;
                    Some((captures.get(0)?.range(), number))
                })
                .collect();

        for (range, number) in placeholders {
            if self
                .textarea
                .elements()
                .iter()
                .any(|element| element.range.start < range.end && range.start < element.range.end)
                || claimed.contains(&number)
            {
                continue;
            }

            let held = self.images.iter().position(|image| {
                image.display_number == number && !live.contains(&image.element_id)
            });
            let stashed = self
                .image_undo_stash
                .iter()
                .position(|image| image.display_number == number);
            let record = match (held, stashed) {
                (Some(position), _) => Record::Held(position),
                (None, Some(position)) => Record::Stashed(position),
                (None, None) => continue,
            };
            if budget == 0 {
                tracing::warn!(
                    target: PROMPT_IMAGES_TRACING_TARGET,
                    display_number = number,
                    cap = Self::IMAGE_CAP,
                    "image placeholder remains plain text because the image cap was reached",
                );
                break;
            }

            let position = match record {
                Record::Held(position) => position,
                Record::Stashed(stash_position) => {
                    let image = self.image_undo_stash.remove(stash_position);
                    self.images.push(image);
                    self.images.len() - 1
                }
            };
            let display = chip_line(format!("Image #{number}"));
            let Some(id) = self
                .textarea
                .restore_element(range, KIND_IMAGE, Some(display))
            else {
                continue;
            };
            if let Some(image) = self.images.get_mut(position) {
                image.element_id = id;
                image.display_number = number;
            }
            live.insert(id);
            claimed.insert(number);
            budget -= 1;
            rechipped.push(number);
        }

        self.image_counter = self.image_counter.max(images_high_water(&self.images));
        rechipped
    }

    /// Re-bind orphan placeholders before a send route or drain inspects image ownership.
    pub(crate) fn rebind_image_placeholders(&mut self) {
        self.rechip_orphan_image_placeholders();
    }

    /// Unique display numbers named by placeholders that have no image record.
    pub(crate) fn unbound_image_placeholders(&self) -> Vec<usize> {
        let text = self.textarea.text();
        if !text.contains("[Image #") {
            return Vec::new();
        }
        let elements = self.textarea.elements();
        let attached = self.attached_display_numbers(&self.live_image_element_ids());
        let mut seen = HashSet::new();
        canonical_image_placeholder_regex()
            .captures_iter(text)
            .filter_map(|captures| {
                let range = captures.get(0)?.range();
                let recordless = elements
                    .iter()
                    .filter(|element| {
                        element.range.start < range.end && range.start < element.range.end
                    })
                    .all(|element| {
                        element.kind == KIND_IMAGE
                            && !self
                                .images
                                .iter()
                                .any(|image| image.element_id == element.id)
                    });
                if !recordless {
                    return None;
                }
                let number = captures.get(1)?.as_str().parse().ok()?;
                (!attached.contains(&number) && seen.insert(number)).then_some(number)
            })
            .collect()
    }

    fn live_image_element_ids(&self) -> HashSet<ElementId> {
        self.textarea
            .elements()
            .iter()
            .filter(|element| element.kind == KIND_IMAGE)
            .map(|element| element.id)
            .collect()
    }

    fn attached_display_numbers(&self, live: &HashSet<ElementId>) -> HashSet<usize> {
        self.images
            .iter()
            .filter(|image| live.contains(&image.element_id))
            .map(|image| image.display_number)
            .collect()
    }
}

fn canonical_image_placeholder_regex() -> &'static regex::Regex {
    use std::sync::LazyLock;
    #[expect(clippy::unwrap_used, reason = "literal regex is valid")]
    static REGEX: LazyLock<regex::Regex> =
        LazyLock::new(|| regex::Regex::new(r"\[Image #(\d+)\]").unwrap());
    &REGEX
}
