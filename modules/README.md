# Reusable main-agent component repository

`module-repository.json` is the source repository index. It is consumed by the existing `ModuleStore`; it is not the trusted runtime `ModuleRegistry` and does not install code or grant authority.

The repository contains 12 independently versioned packages:

- Foundation: context compaction, bounded skill task, plan, collaboration, Human question, execution escalation and resilience.
- Main-agent: inherited root guardrails/shared budget, bounded delegate, coordinator instructions, declaration-driven assembly.
- Model: frozen Chat Completions protocol and explicitly configured connection/model.

Register the source with `nofy repository add nofy --host-directory /absolute/path/to/modules`, retain the returned revision, then explicitly synchronize with `nofy repository sync nofy --expected-revision <returned-revision>`. These are host management operations requiring the existing resource/edit scopes. They are not performed merely by building a source project. Query `nofy schema --input` using a package coordinate to obtain its parameters, ports and exports, then use `agent.module.use` to pin it.

`presets/main-agent-composable` contains the assembled `main-agent@0.2.0` source with seven frozen package sources. It builds offline once non-secret provider configuration is supplied; the source package can be exported independently of this repository. Rebuild the source with the public-API example documented in `docs/manual/main-agent-repository.md`.

Versions are immutable in ModuleStore. Do not edit an already published package in place: publish the next version and explicitly replace the import. No remote repository is created and no source is uploaded by these files.

Protocol files in models/chat-completions are byte-for-byte frozen copies of the existing coding preset protocol at this source revision, distributed under the repository license. The package stores only source and credential references, never secret values.
