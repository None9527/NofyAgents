# Opt-in managed consumer native CI

This is a second, explicitly opt-in hosting mode, not a replacement for the default
SDK compatibility gate. The original fixture, independent-consumer runner and
`.github/workflows/ci.yml` are unchanged. Their default-entry failures remain
failures. Passing managed mode does not establish universal SDK stack safety,
default Windows compatibility, unlimited nesting, or support for confined
execution outside Linux.

## What runs

The new workflow runs the same full public-API business fixture on native Linux,
Windows and macOS. It selects the fixture's existing `pack`, `workflow` and
`control-file` features, with the runtime's empty `default` feature. It does not
enable `sqlite` or claim `all-features` coverage. The exact accepted inventory is
three agents (business, research-pack, standalone-coding) and eleven asserted
scenarios: delegation, parallel, configuration, recipe, workflow, workflow_module,
workflow_hook, program, event_program, declarative_system and file_catalog.

There is no copied business implementation. The runner copies all nine fixture
files into a temporary workspace outside the repository. It requires exactly the
reviewed entry signature and keeps the original current-thread `tokio::main`
macro. It renames that function and appends an opt-in main wrapper. All original
business statements, module paths, JSON inputs and assertions are preserved.
The generated package and executable are separately named
`nofy-opt-in-managed-consumer`; path dependencies are relocated using the
unchanged default runner's helper.

The wrapper creates one explicitly sized 16 MiB thread and calls the macro-expanded
entry there. That call first constructs the one runtime, application data and
future inside the managed thread, never on OS main. It keeps the original Result
Termination reporting inside that thread. Only ExitCode crosses the join;
child panic is resumed. There is no second driver or SDK public API change.
The completion marker means this wrapper call returned successfully, after its
runtime dropped. It is not a general lifecycle, cancellation or leak proof.

The cost is one process-lifetime thread and a requested 16 MiB virtual stack,
in addition to the OS main stack and normal runtime resources. This is not a
per-invocation allocation, immediate RSS measurement or proof of arbitrary
composition depth. See `runtime-hosting.md` for the hosting contract and limits.

## Evidence and failure behavior

Each artifact is explicitly prefixed `opt-in-managed-consumer-`. It retains:
- Every original fixture file, raw SHA-256 and explicitly LF-normalized SHA-256.
- Original/generated entry, exact generated entry diff, generated manifest diff.
- Exact selected feature set, Cargo metadata and normal dependency tree.
- Actual generated Cargo.lock, its hash, native rustc/Cargo versions and host.
- Actual commands, statuses, return codes, timeouts, stdout/stderr and scenario list.
- The fresh root binary's Cargo artifact record and SHA-256, plus direct execution.

Only CRLF is normalized to LF for cross-platform source identity and generation.
Raw copies/hashes remain available, so platform checkout translation is visible.
All other byte differences fail parity. The full canonical source map is checked
against the comparison job checkout. The generated entry and manifest use LF.

Like the default fixture, this independent consumer does not reuse the root
Cargo.lock: metadata resolves a separate lockfile from the consumer manifest.
CI first fetches dependencies; local mode defaults to offline. The actual resolved
lockfile is retained and subsequent dependency-tree/build commands are locked.
Do not equate those resolved versions with the workspace's versions. Key runtime
and Tokio versions must match between the three successful native jobs.

Cargo runs with cwd outside the source tree, and an independent target outside
both source and artifact directories. No root .cargo/config is inherited.
The runner refuses ancestor or global Cargo configuration, clears stack,
compiler, profile, target and runner overrides, and records only removed variable
names, not environment values or credentials. It executes the built binary
directly, not via a Cargo runner. No RUST_MIN_STACK workaround is applied.

Empty evidence, unknown/missing scenarios, fake booleans, missing completion,
wrong runtime mode, stderr, failure, timeout, wrong/native-mismatched host,
cached root artifact, source or generated-entry drift, incomplete platforms and
feature/version drift fail closed. The parity job runs even after matrix failure
and explicitly requires the whole matrix result to be success; uploaded files
alone cannot make a failed/cancelled/skipped matrix green. No managed gate uses
continue-on-error or a test skip.

## Local commands and validation status

Run outside a reused evidence directory:

```sh
python3 -m unittest discover -s scripts/tests -p test_verify_agent_managed_consumer.py
python3 scripts/verify-agent-managed-consumer.py collect \
  --runner ubuntu-24.04 --output /tmp/nofy-managed-evidence
python3 scripts/verify-agent-managed-consumer.py compare /tmp/downloaded-managed-artifacts
```

For Windows or macOS use their matching workflow runner labels. The compare
command requires three separate artifact subdirectories and never substitutes
mock output for native execution. Python unit tests use synthetic evidence solely
to exercise the validator.

This change prepares CI locally and does not dispatch workflows or publish a push.
Linux native execution is validated separately in the accompanying review report.
Windows and macOS native runs remain unverified until their actual jobs execute.
