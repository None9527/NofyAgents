# Native model configuration writer

The current kernel exposes credential storage and model reload, but no provider/default-model configuration RPC. This adapter is the explicit local-write fallback allowed by T16. It only handles user `config.json` (the kernel loader prioritizes JSON); a legacy-only `config.toml` is read-only until a separate format-preserving migration is implemented.

Source schema: nofy-config/src/loader.rs JSON-to-TOML test, nofy-shell/src/agent/config.rs ConfigModelOverride/ModelsConfig, nofy-shell/src/agent/model_providers.rs. Model-local BYOK entries live at `model.<id>` with `name`, `model`, `base_url`, `api_key`, `api_backend`; shared suppliers use `model_providers.<providerId>` and a model's `model_provider` reference. Default selection is `models.default`.

Shared boundary: preload/model-config-contract.ts. Native read returns revisionHash plus sanitized model/provider metadata, credential-presence booleans and editability. No raw JSON, key, headers or auth command crosses preload. URLs are returned without username/password/query/fragment, with a flag telling the form not to write the sanitized URL back implicitly. The optional apiKey field is never persisted in renderer preferences or echoed in responses. Unknown/advanced config fields are kept.

Write lifecycle (main owns steps 1, 2, 6):
1. Refuse while any known session is working, awaiting input or has unknown activity, or pending client approvals exist. Gate client requests/notifications/responses during configuration change.
2. Stop and await the sole kernel process; do not write beneath a live config watcher.
3. Acquire the desktop advisory lock. Open only regular, non-symlink config files, with bounded size. Verify expected SHA256 revision against the current bytes.
4. Validate only the supported patch fields: IDs, model/display name, HTTP(S) endpoint without embedded credentials/query/fragment, backend enum and optional non-empty API key. Preserve all unrelated JSON and existing advanced per-model/provider fields. Refuse legacy-only TOML.
5. Save a 0600 backup; write and fsync a same-directory 0600 temporary file; recheck the config revision and config-file identity, then atomic rename. Read back a sanitized snapshot. Cleanup lock/temp files on failures.
6. Restart the single kernel and reinitialize. Failure reports whether the file was saved, and gives a retry/restart path rather than claiming a verified network connection.

Concurrency: the adapter lock serializes cooperating desktop writers. Main stops its own kernel. Other CLI processes do not honor this lock; CAS refuses changes observed before either revision check. A change in the final check-to-rename window cannot be fully prevented without a shared kernel/CLI lock protocol. This residual is explicit; the user is told to avoid concurrent external config editing. Backup provides recovery. No filesystem API can make this an atomic compare-and-swap against an uncooperative writer.

Tests use isolated temporary config directories and synthetic secrets. Required cases: secret-free snapshots and URL sanitization, preservation of other config/advanced fields, stale revision refusal, symlink refusal, malformed config/TOML refusal, concurrent desktop writes, permissions and backup contents. Actual kernel parsing must be verified with the isolated generated JSON; network authentication is a separate acceptance scene.

Endpoint edit rule (targeted review): the kernel's global API-key fallback chooses `api_base_url` ahead of `base_url` (`nofy-shell/src/agent/config.rs:resolve_credentials`). An explicitly submitted endpoint therefore clears the old alternate route on that edited model/provider. Omitting the endpoint preserves the alternate route. A model-specific edit that retains a provider with its own alternate route pins the model's `api_base_url` to the new endpoint, so inheritance cannot route it back to the old provider address; the provider and other models remain unchanged. All unrelated headers and advanced fields are preserved. Regression tests cover independent models, shared providers and inherited per-model overrides.
