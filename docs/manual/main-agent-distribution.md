# Omni Agent source distribution

This offline assembler packages existing binaries and explicitly declared source packages. It does not compile or replace the Nofy kernel, install software, configure security, start services, or contact a network.

## Assemble

From the repository root, with Python 3.10 or newer:

```sh
python3 scripts/package-main-agent.py \
  --repo . \
  --cli /path/to/compiled/nofy \
  --host /path/to/compiled/nofy-agent-host \
  --kernel-version 0.1.0 \
  --platform linux-x86_64-gnu \
  --output /existing/parent/nofy-main-agent-0.2.0
python3 scripts/package-main-agent.py --check /existing/parent/nofy-main-agent-0.2.0
```

On Windows, supply Windows binaries and a platform such as windows-x86_64; filenames receive .exe. On macOS use a macos- target. The script works from explicit paths and never guesses target compatibility. Platform and kernel version are operator declarations, not binary inspection results. A successful checksum check does not prove native Windows/macOS isolation, clean-machine installation, architecture compatibility, dependency availability, or runtime readiness. The selected kernel binaries must already implement the required runtime. Shared library dependencies are not collected automatically.

## Inventory

- bin/nofy and bin/nofy-agent-host (or their .exe equivalents).
- LICENSE and THIRD-PARTY-NOTICES, copied explicitly from the repository.
- modules/module-repository.json and every referenced package's source-files.json allowlist.
- presets/omni from its source-files.json allowlist.
- A minimal presets/index.json with Omni 0.1.0 as the default project preset.
- inventory.json recording distribution version, declared kernel version/target, package identities and files.
- SHA256SUMS.json recording each payload's SHA256, byte size and executable flag, including inventory.json.

The host handles loader worker entry points itself and passes its own current_exe as the loader helper (crates/common/nofy-agent-host/src/main.rs). A separate worker executable is not required by that entry point. Runtime-image building/signing utilities are not required for this source distribution.

The bundle carries source declarations. Keep access tokens, provider credentials, private state and runtime databases outside the distribution. Configure the model, workspace resources and SDK connection as needed. [Omni Agent setup](omni-agent.md)

Only declared source files are copied, never entire trees. Dotfiles, credentials.json, state/runs, ref, node_modules, .git, target, build and dist are rejected in declared paths. The sole dot-directory exception is an explicitly declared .nofy-module-packages/ followed by a 64-lowercase-hex .json filename, used for frozen package artifacts. Path escapes, noncanonical paths and symlink/junction inputs are refused. These checks are not a general secret scanner: maintainers must review all declared source contents before shipping. License notices must also be reviewed for the actual supplied binaries.

The output directory must not exist and its parent must already exist. Failed output is retained for inspection rather than removed recursively. Choose a new output path after a failure. Build in a trusted, non-concurrently-mutated workspace; the tool is not a defense against a hostile process racing filesystem operations.

The --check operation verifies the entire regular-file set, checksums, sizes, source inventory and executable flags on POSIX. It rejects missing/extra files and links. It neither executes binaries nor trusts this unsigned manifest as proof of publisher authenticity. Publish a detached signature or trusted out-of-band digest when authentication is required.

## Tests

```sh
python3 -m unittest discover -s scripts/tests -p test_package_main_agent.py
```

Tests use fixture bytes for executables, including the shipped source declarations when available. A real-binary assembly/check is an additional packaging smoke, not a clean-machine installation test.
