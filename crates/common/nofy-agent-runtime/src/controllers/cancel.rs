use super::*;
use crate::supervisor::ChildCancelResumeCommand;

impl ControllerBinding {
    pub async fn accepted_cancel(&self, command: &ChildCancelResumeCommand) -> Result<bool, Error> {
        let (_, saved) = self.load().await?;
        if saved.commands.contains_key(&command.command_id) {
            return Err(Error::Checkpoint(
                "control command ID belongs to another command kind".into(),
            ));
        }
        match saved.cancel_commands.get(&command.command_id) {
            None => Ok(false),
            Some(old) if old == command => Ok(true),
            Some(_) => Err(Error::Checkpoint(
                "cancel resume command cannot change".into(),
            )),
        }
    }
    pub async fn authorize_cancel(
        &self,
        command: &ChildCancelResumeCommand,
        root: &str,
        path: &[String],
        graphs: &[GraphRoute],
        hooks: &[HookRoute],
    ) -> Result<(), Error> {
        let (revision, mut saved) = self.load().await?;
        if saved.commands.contains_key(&command.command_id) {
            return Err(Error::Checkpoint(
                "control command ID belongs to another command kind".into(),
            ));
        }
        if let Some(old) = saved.cancel_commands.get(&command.command_id) {
            return if old == command {
                Ok(())
            } else {
                Err(Error::Checkpoint(
                    "cancel resume command cannot change".into(),
                ))
            };
        }
        if command.command_id.trim().is_empty()
            || command.command_id.len() > 256
            || command.through == 0
            || command.through > i64::MAX as u64
            || path.is_empty()
            || path.len() > 128
            || saved.commands.len() + saved.cancel_commands.len() >= 8192
        {
            return Err(Error::Checkpoint(
                "invalid cancel resume command or capacity exceeded".into(),
            ));
        }
        advance(&mut saved, root, path, graphs, hooks)?;
        saved.targets.remove(&command.address.run_id);
        saved.cancels.insert(
            command.address.run_id.clone(),
            CancelResume {
                address: command.address.clone(),
                through: command.through,
            },
        );
        saved
            .cancel_commands
            .insert(command.command_id.clone(), command.clone());
        self.write(revision, saved).await
    }
}
