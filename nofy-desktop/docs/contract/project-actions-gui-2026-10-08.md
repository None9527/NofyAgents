# Project and local session actions GUI acceptance

Executed 2026-10-08 18:30 Asia/Shanghai (report timestamps UTC), on macOS Electron from the freshly generated application `dist`.

Command from `nofy-desktop/`: `node apps/desktop/e2e/project-actions.mjs` after `pnpm build`.

Result: **11/11 cases passed, zero renderer console exceptions**, exit code 0. Report: `output/playwright/project-2026-10-08T10-30-06.477Z/report.json`; protocol observation: `wire.jsonl`; screenshot: `local-organisation.png`; actual exported example: `export-example.md` in the same directory.

## Test boundary

The test drives actual Electron renderer buttons, textboxes, menus, tabs, and reloading with Playwright. The production preload, typed IPC handlers, directory validation, reducer and persistence run unchanged. Electron main `dialog.showOpenDialog` and `dialog.showSaveDialog` providers are substituted to return controlled cancellation/selection responses. This validates the application's native-dialog integration but **does not claim manual verification of the OS directory/save dialog UI**.

The nofy child process is the isolated deterministic ACP emulator, not the installed production kernel or a real model. It uses the documented wire shapes and records renderer requests/responses. These results validate client behaviour and must be combined with the separate installed-kernel and real-model acceptance evidence. HOME, NOFY_HOME and Chromium user data are temporary and deleted after the run. No real configuration or credentials are copied.

## Observed cases

| Case | Actual GUI actions and observations |
|---|---|
| E01 cancellation | Fill session A draft, click Add Project with cancelled native provider. No session/new added; draft retained. |
| E01 open project | Click Add Project with a real temporary Chinese/space-containing directory. Production main validates directory; session/new cwd exactly matches; only one emulator PID. |
| E03 navigation | Choose recent project to create a fresh task, navigate old A/B tasks through side rows. Each draft remains attached to its original session. |
| E04 export | Send a text prompt, cancel export and confirm no file, then select a destination. Production main writes UTF-8 Markdown with User/Assistant sections and Chinese text; raw protocol/configuration fields absent. |
| Local pin/unread | Pin current task; mark it unread; activate that same task through its side row. Pin persists and unread clears even though the session ID did not change. |
| Local groups | Set group, rename it through group header, dissolve it. Session count remains unchanged; persisted membership matches each action. |
| Local archive | Archive current task and observe archive badge; navigate away and it disappears from normal list; archive filter shows it; open/unarchive restores normal list. |
| Running guard | Start pending plan turn; open session menu; archive button is disabled and preference unchanged; approve plan to complete turn. |
| Reload | Reload renderer; latest task and pin preference restore without creating extra session/new. |
| Delete cleanup | Confirm delete through session menu; target disappears and target metadata is removed, other tasks retained. Kernel delete itself is emulated. |
| Protocol boundary | Local archive/pin/unread/group actions emitted no invented ACP lifecycle methods. |

The script fails if any functional case fails **or any renderer pageerror occurs**. Provider substitution is confined to the spawned Electron process. All retained evidence contains only synthetic test conversation content.
