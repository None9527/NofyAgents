//! Model-free programs use the same admitted tool boundary and checkpoint
//! driver as sampled Agents. No synthetic completion or model quota is used.
use super::*;

impl Agent {
    pub(crate) fn set_scope_identity(&mut self, scheme: Option<crate::IdentityScheme>) {
        if scheme == Some(crate::IdentityScheme::HashedV2)
            && self.spec.settings.scope_identity != scheme
        {
            self.composition =
                crate::identity::extend(scheme, std::mem::take(&mut self.composition));
        }
        self.spec.settings.scope_identity = scheme;
    }
    pub(super) fn sampled_model(&self) -> Result<&dyn Model, Error> {
        self.model.as_deref().ok_or_else(|| {
            Error::Composition("a tool program cannot request a model completion".into())
        })
    }

    pub(crate) fn tool_program(name: String, tools: ToolCatalog) -> Self {
        Self {
            spec: AgentSpec {
                name,
                model: String::new(),
                prompt: String::new(),
                tools: vec![],
                policies: vec![],
                tool_sources: vec![],
                context_sources: vec![],
                settings: Settings::default(),
            },
            model: None,
            direct_tool: None,
            event_program: None,
            prompt: Arc::new(crate::StaticPrompt(String::new())),
            tools,
            policies: vec![],
            hooks: None,
            required_policies: Default::default(),
            composition: "tool-program-v1".into(),
            tool_sources: vec![],
            checkpoint: None,
            bindings: vec![],
            middleware: vec![],
            context_sources: vec![],
            context_policies: vec![],
            governance: vec![],
            recipe: None,
        }
    }

    pub(crate) fn tool_policy(&mut self, policy: Arc<dyn Policy>) {
        self.policies.push(policy);
    }
    pub(crate) fn tool_source(&mut self, id: String, source: Arc<dyn crate::ToolSource>) {
        self.tool_sources.push((id, source));
    }

    pub(crate) async fn invoke_tool_program(
        &self,
        call: ToolCall,
        input: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        if self.model.is_some()
            || input.prompt.is_some()
            || input.content.is_some()
            || input.retry_model.is_some()
        {
            return Err(Error::Composition(
                "tool program accepts a call or explicit recovery".into(),
            ));
        }
        self.bind_tool_program(call)?.invoke(input, context).await
    }

    pub(crate) fn bind_tool_program(&self, call: ToolCall) -> Result<Self, Error> {
        let mut program = self.clone();
        program.composition = crate::identity::extend(
            self.spec.settings.scope_identity,
            serde_json::to_string(&(&self.composition, &call))
                .map_err(|e| Error::Composition(e.to_string()))?,
        );
        program.direct_tool = Some(call);
        Ok(program)
    }

    #[cfg(feature = "workflow")]
    pub(crate) fn add_program_tool(&mut self, entry: crate::ToolEntry) -> Result<(), Error> {
        let identity = (entry.definition.clone(), entry.dispatch.recovery_identity());
        self.composition = crate::identity::extend(
            self.spec.settings.scope_identity,
            serde_json::to_string(&(&self.composition, "program-tool", identity))
                .map_err(|e| Error::Composition(e.to_string()))?,
        );
        self.tools.insert(entry)
    }

    pub(super) fn prepare_direct_tool(
        &self,
        state: &mut RunState,
        call: &ToolCall,
        context: &RunContext,
    ) -> Result<(), Error> {
        if !state.messages.is_empty() || state.has_pending_work() || state.complete {
            return Err(Error::Checkpoint(
                "tool program already started; use explicit resume".into(),
            ));
        }
        state.execution_run_id = Some(context.run_id.clone());
        if let Some(initial) = context
            .capabilities
            .get::<crate::mailbox::InitialInputBinding>()
        {
            if !initial.matches(context) {
                return Err(Error::Checkpoint(
                    "tool program initial proof recipient changed".into(),
                ));
            }
            state.input_progress.initial = Some(initial.0.proof());
        }
        state.messages.push(Message::Assistant {
            content: String::new(),
            tool_calls: vec![call.clone()],
        });
        state.pending_tools.push_back(call.clone());
        if self.hooks.is_some() {
            state.hook_progress.run_id = Some(context.run_id.clone());
            state.hook_progress.turn = 1;
        }
        Ok(())
    }
}

impl AgentHost<'_> {
    pub(super) async fn finish_direct_tool(&mut self) -> Result<(), Error> {
        let Some(Message::Tool { content, .. }) = self.state.messages.last() else {
            return Err(Error::Checkpoint(
                "tool program has no paired result".into(),
            ));
        };
        self.state.output =
            serde_json::to_string(content).map_err(|e| Error::Tool(e.to_string()))?;
        self.state.complete = true;
        self.commit().await
    }
}

impl Agent {
    pub(crate) fn constrain_program_descendants(mut self) -> Result<Self, Error> {
        use sha2::{Digest, Sha256};
        let identity = format!("{:x}", Sha256::digest(self.composition.as_bytes()));
        let policies = std::mem::take(&mut self.policies);
        for (index, policy) in policies.into_iter().enumerate() {
            self =
                self.with_required_policy(format!("workflow-policy:{identity}:{index}"), policy)?;
        }
        Ok(self)
    }
}

impl Agent {
    pub(crate) fn program_tool_schema(
        &self,
        name: &str,
    ) -> Result<Option<serde_json::Value>, Error> {
        match self.tools.get(name) {
            Some(entry) => Ok(Some(entry.definition.function.parameters.clone())),
            None if !self.tool_sources.is_empty() => Ok(None),
            None => Err(Error::Composition(format!(
                "tool runtime has no registered tool: {name}"
            ))),
        }
    }
}

impl Agent {
    #[cfg(feature = "sqlite")]
    pub(crate) fn execution_kind(&self) -> &'static str {
        if self.model.is_some() {
            "agent"
        } else {
            "tool_program"
        }
    }
}
