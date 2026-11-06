# Third-party code in this crate

`src/windows.rs` is adapted from **openai/codex** (<https://github.com/openai/codex>).

| | |
|---|---|
| Upstream files | `codex-rs/uds/src/windows_security.rs`, `codex-rs/uds/src/windows_socket_validation.rs` |
| Upstream commit | `ba057e43758cb19beead2af9df19d10756cc4100` (2026-11-04) |
| Copyright | Copyright 2025 OpenAI (from codex's `NOTICE`) |
| License | Apache License 2.0 (the same license as this project; the full text is `LICENSE` at the repository root) |

The rest of codex's `NOTICE` (Ratatui, MIT) concerns code that is not used here.

## What was changed

Apache License 2.0 §4(b) asks for a prominent notice of changes. Relative to the
upstream files:

- The code serves any directory or file. Upstream prepares and validates a
  socket rendezvous directory for its daemon.
- The check accepts the access lists Windows gives a user's own folders: allow
  entries only for the current user, `SYSTEM`, the Administrators group and
  `CREATOR OWNER`, an owner that is the user or the Administrators group, and an
  access list that exists. Upstream accepts exactly one entry, for the user,
  with fixed inheritance flags. The change is deliberate: a state directory that
  already exists under the user's profile, or was made by an elevated process,
  would otherwise be refused.
- A file can be checked too. It is opened with delete sharing and not held,
  because the credential store replaces it by rename.
- Errors name the path and the reason, and the rule is a function of its inputs
  (`judge`) separate from the system calls that feed it.
- Creation and checking are one call, `ensure_private_dir`, and the Unix half of
  the crate (`0700` directories, `0600` files) is new.
- Tests were written for this crate; the cases they cover (new directory, broad
  access list refused and left unrepaired, junction refused, volume root
  refused, directory pinned while held) follow upstream's.

This notice is repeated in the repository's `THIRD-PARTY-NOTICES`.
