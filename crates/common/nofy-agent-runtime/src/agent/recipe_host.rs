use super::*;
use crate::recipe::*;

impl Agent {
    pub fn with_recipe(mut self, recipe: Arc<RuntimeRecipe>) -> Result<Self, Error> {
        if self.recipe.is_some() {
            return Err(Error::Composition(
                "an agent may only install one runtime recipe".into(),
            ));
        }
        self.composition = serde_json::to_string(&(&self.composition, "recipe", recipe.identity()))
            .map_err(|e| Error::Composition(e.to_string()))?;
        self.recipe = Some(recipe);
        Ok(self)
    }
}
impl AgentHost<'_> {
    fn recipe_key(&self, boundary: Boundary, call: Option<&ToolCall>) -> Result<String, Error> {
        serde_json::to_string(&(
            &self.context.run_id,
            self.state.model_sequence,
            boundary,
            call.map(|call| &call.id),
        ))
        .map_err(|e| Error::Checkpoint(e.to_string()))
    }
    pub(super) fn queue_recipe(
        &mut self,
        boundary: Boundary,
        call: Option<ToolCall>,
        result_index: Option<usize>,
    ) -> Result<(), Error> {
        if !self
            .agent
            .recipe
            .as_ref()
            .is_some_and(|recipe| recipe.has(boundary))
        {
            return Ok(());
        }
        let key = self.recipe_key(boundary, call.as_ref())?;
        if self.state.recipe_progress.completed.contains(&key) {
            return Ok(());
        }
        if let Some(pending) = &self.state.recipe_progress.pending {
            if pending.key == key {
                return Ok(());
            }
            return Err(Error::Checkpoint(
                "another recipe boundary is still pending".into(),
            ));
        }
        if self.state.recipe_progress.completed.len() >= 8192 {
            return Err(Error::Composition(
                "recipe progress exceeds 8192 boundaries".into(),
            ));
        }
        self.state.recipe_progress.pending = Some(PreparedBoundary {
            key,
            boundary,
            call,
            result_index,
            index: 0,
            observation: None,
        });
        self.state.recipe_progress.validate_size()
    }
    pub(super) async fn run_recipe(
        &mut self,
        boundary: Boundary,
        call: Option<ToolCall>,
    ) -> Result<Option<Step<RunOutcome>>, Error> {
        let empty = self.state.recipe_progress.pending.is_none();
        self.queue_recipe(boundary, call, None)?;
        if empty && self.state.recipe_progress.pending.is_some() {
            self.commit().await?;
        }
        self.drain_recipe().await
    }
    pub(super) async fn drain_recipe(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        let Some(recipe) = self.agent.recipe.clone() else {
            if !self.state.recipe_progress.is_empty() {
                return Err(Error::Checkpoint(
                    "saved recipe is no longer installed".into(),
                ));
            }
            return Ok(None);
        };
        while let Some(mut frame) = self.state.recipe_progress.pending.clone() {
            if self.context.cancel.is_cancelled() {
                return Err(crate::governance::cancellation_error(&self.context));
            }
            let bindings = recipe
                .stages
                .iter()
                .filter(|binding| binding.at == frame.boundary)
                .collect::<Vec<_>>();
            let Some(binding) = bindings.get(frame.index) else {
                self.state.recipe_progress.completed.insert(frame.key);
                self.state.recipe_progress.pending = None;
                self.state.recipe_progress.validate_size()?;
                self.commit().await?;
                return Ok(None);
            };
            let data = self
                .state
                .recipe_progress
                .data
                .get(&binding.name)
                .cloned()
                .unwrap_or(Value::Null);
            let result = frame
                .result_index
                .map(|index| match self.state.messages.get(index) {
                    Some(Message::Tool {
                        call_id,
                        content,
                        is_error,
                    }) if frame.call.as_ref().is_some_and(|call| &call.id == call_id) => {
                        Ok(StageToolResult {
                            content: content.clone(),
                            is_error: *is_error,
                        })
                    }
                    _ => Err(Error::Checkpoint(
                        "recipe result reference no longer matches its tool".into(),
                    )),
                })
                .transpose()?;
            if let Some(source) = recipe.sources.get(&binding.name) {
                if let Some(saved) = &frame.observation {
                    if saved.source != source.identity() || saved.index != frame.index {
                        return Err(Error::Checkpoint("stage observation source changed".into()));
                    }
                } else {
                    let value = tokio::select! {
                        biased;
                        _=self.context.cancel.cancelled()=>return Err(crate::governance::cancellation_error(&self.context)),
                        result=tokio::time::timeout(std::time::Duration::from_millis(source.timeout_ms()),source.snapshot(&self.state,&self.context))=>result.map_err(|_|Error::Composition("stage observation timed out".into()))??,
                    };
                    if serde_json::to_vec(&value)
                        .map_err(|e| Error::Composition(e.to_string()))?
                        .len()
                        > 65536
                    {
                        return Err(Error::Composition(
                            "stage observation exceeds 64 KiB".into(),
                        ));
                    }
                    frame.observation = Some(PreparedObservation {
                        source: source.identity().into(),
                        index: frame.index,
                        value,
                    });
                    self.state.recipe_progress.pending = Some(frame.clone());
                    self.state.recipe_progress.validate_size()?;
                    self.commit().await?;
                }
            } else if frame.observation.is_some() {
                return Err(Error::Checkpoint(
                    "saved stage source is no longer installed".into(),
                ));
            }
            let input = StageInput {
                boundary: frame.boundary,
                state: &self.state,
                call: frame.call.as_ref(),
                result: result.as_ref(),
                data: &data,
                observation: frame.observation.as_ref().map(|saved| &saved.value),
            };
            let effect = binding.stage.evaluate(&input, &self.context)?;
            effect.validate(frame.boundary)?;
            if let StageAction::Pause { reason } = effect.action {
                // Explicit resume may observe changed approvals/task state.
                if frame.observation.take().is_some() {
                    self.state.recipe_progress.pending = Some(frame.clone());
                    self.commit().await?;
                }
                return Ok(Some(Step::Complete(RunOutcome::Paused {
                    reason,
                    state: self.state.clone(),
                })));
            }
            if let Some(data) = effect.data {
                self.state
                    .recipe_progress
                    .data
                    .insert(binding.name.clone(), data);
            }
            frame.index += 1;
            frame.observation = None;
            self.state.recipe_progress.pending = Some(frame.clone());
            if serde_json::to_vec(&self.state.recipe_progress)
                .map_err(|e| Error::Checkpoint(e.to_string()))?
                .len()
                > 4 * 1024 * 1024
            {
                return Err(Error::Composition("recipe progress exceeds 4 MiB".into()));
            }
            match effect.action {
                StageAction::Next => {}
                StageAction::Feedback { content } => {
                    if self
                        .state
                        .recipe_progress
                        .feedback
                        .iter()
                        .map(String::len)
                        .sum::<usize>()
                        .saturating_add(content.len())
                        > 262144
                    {
                        return Err(Error::Composition(
                            "pending recipe feedback exceeds 256 KiB".into(),
                        ));
                    }
                    self.state.recipe_progress.feedback.push(content);
                    if self.state.pending_tools.is_empty() && self.state.in_flight.is_none() {
                        self.state.complete = false;
                        self.state.hook_progress.stop_done = false;
                    }
                }
                StageAction::Limit { reason } => {
                    self.state.recipe_progress.halted = Some(reason);
                    self.state.recipe_progress.pending = None;
                    self.commit().await?;
                    return Err(Error::BudgetExceeded);
                }
                StageAction::RejectTool { reason } => {
                    let call = frame
                        .call
                        .as_ref()
                        .ok_or_else(|| Error::Checkpoint("before_tool stage has no call".into()))?;
                    self.state.recipe_progress.completed.insert(frame.key);
                    self.state.recipe_progress.pending = None;
                    self.reject_hook_tool(call, reason, "recipe").await?;
                    return Ok(Some(Step::Continue));
                }
                StageAction::ContinueText {
                    feedback,
                    max_bytes,
                } => {
                    self.append_recipe_text(&binding.name, max_bytes)?;
                    if let Some(content) = feedback {
                        if self
                            .state
                            .recipe_progress
                            .feedback
                            .iter()
                            .map(String::len)
                            .sum::<usize>()
                            .saturating_add(content.len())
                            > 262144
                        {
                            return Err(Error::Composition(
                                "pending recipe feedback exceeds 256 KiB".into(),
                            ));
                        }
                        self.state.recipe_progress.feedback.push(content);
                    }
                    self.state.complete = false;
                    self.state.hook_progress.stop_done = false;
                }
                StageAction::CompleteText { max_bytes } => {
                    self.append_recipe_text(&binding.name, max_bytes)?;
                    self.state.output = self
                        .state
                        .recipe_progress
                        .text_buffers
                        .remove(&binding.name)
                        .expect("text accumulator exists");
                }
                StageAction::Pause { .. } => unreachable!("pause returned before mutation"),
            }
            if serde_json::to_vec(&self.state.recipe_progress)
                .map_err(|e| Error::Checkpoint(e.to_string()))?
                .len()
                > 4 * 1024 * 1024
            {
                return Err(Error::Composition("recipe progress exceeds 4 MiB".into()));
            }
            self.commit().await?;
        }
        Ok(None)
    }
    pub(super) async fn flush_recipe_feedback(&mut self) -> Result<(), Error> {
        if self.state.recipe_progress.feedback.is_empty() {
            return Ok(());
        }
        if !self.state.pending_tools.is_empty() || self.state.in_flight.is_some() {
            return Err(Error::Checkpoint(
                "recipe feedback must wait for paired tool results".into(),
            ));
        }
        for content in std::mem::take(&mut self.state.recipe_progress.feedback) {
            self.state
                .hook_progress
                .synthetic_inputs
                .push(self.state.messages.len());
            self.state.messages.push(Message::User { content });
        }
        self.state.hook_progress.prepared_model = None;
        self.commit().await
    }
    fn append_recipe_text(&mut self, name: &str, max_bytes: u32) -> Result<(), Error> {
        if !self.state.pending_tools.is_empty()
            || self.state.in_flight.is_some()
            || self.state.completion_info.structured_output.is_some()
            || self.state.completion_info.refusal.is_some()
        {
            return Err(Error::Composition(
                "text continuation cannot rewrite structured, refused or unpaired tool output"
                    .into(),
            ));
        }
        let buffer = self
            .state
            .recipe_progress
            .text_buffers
            .entry(name.into())
            .or_default();
        if buffer.len().saturating_add(self.state.output.len()) > max_bytes as usize {
            return Err(Error::Composition(
                "text continuation exceeds the configured byte limit".into(),
            ));
        }
        buffer.push_str(&self.state.output);
        Ok(())
    }
}
