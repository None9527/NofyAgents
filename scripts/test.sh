#!/usr/bin/env bash
# Canonical test runner: normalizes ambient environment before delegating to
# `cargo test`, so suites do not depend on which machine/terminal/session
# type runs them.
#
# SSH variables are stripped: nofy-pager-render's terminal context is a
# process-wide write-once OnceLock seeded from the real environment
# (terminal_context(), no test injection seam). Under SSH the drop-paste
# classifier is disabled by production design, which turns the 17
# paste_key drop-classification tests in nofy-pager into environment
# casualties (verified green with SSH vars removed: 76/76). Stripping here
# keeps them covered instead of exempting them.
#
# Usage: scripts/test.sh [cargo test args...]   (e.g. scripts/test.sh --workspace)
set -euo pipefail
exec env -u SSH_CONNECTION -u SSH_TTY -u SSH_CLIENT cargo test "$@"
