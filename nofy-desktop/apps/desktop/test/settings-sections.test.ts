import assert from "node:assert/strict";
import test from "node:test";
import { EXT_CLIENT_REQUEST, EXT_DISPATCH_ONLY } from "@nofy-desktop/acp";
import {
  ACCEPTED_SETTINGS_METHODS,
  settingsGroups,
  settingsTopicShown,
  settingsWriteShown,
} from "../renderer/features/settings/settingsModel.ts";

test("accepted methods keep the three Codex groups and drop pages with no accepted action", () => {
  assert.deepEqual(
    settingsGroups(ACCEPTED_SETTINGS_METHODS).map((group) => [group.id, group.sections.map((section) => section.id)]),
    [
      ["basics", ["general", "appearance", "models"]],
      ["agentCapabilities", ["plugins", "skills", "mcp", "hooks"]],
      ["dataAndStats", ["usage"]],
    ],
  );
  for (const topic of ["memory", "indexing", "commands", "browser", "automations", "proxy", "scheduler/create", "scheduler/list"]) {
    assert.equal(settingsTopicShown(topic, ACCEPTED_SETTINGS_METHODS), false);
    assert.equal(settingsTopicShown(topic, new Set([...ACCEPTED_SETTINGS_METHODS, EXT_CLIENT_REQUEST.memory_rewrite])), false);
  }
  assert.equal(settingsTopicShown("general", new Set()), true);
  assert.equal(settingsTopicShown("appearance", new Set()), true);
  assert.equal(settingsTopicShown("models", new Set()), true);
  assert.equal(settingsTopicShown("usage", new Set()), true);
  assert.equal(settingsTopicShown("hooks", new Set()), false);
  assert.deepEqual(
    settingsGroups(new Set([EXT_CLIENT_REQUEST.skills_list])).flatMap((group) => group.sections.map((section) => section.id)),
    ["general", "appearance", "models", "skills", "usage"],
  );
  assert.equal(settingsWriteShown(EXT_CLIENT_REQUEST.skills_toggle, ACCEPTED_SETTINGS_METHODS), true);
  assert.equal(settingsWriteShown(EXT_CLIENT_REQUEST.plugins_action, ACCEPTED_SETTINGS_METHODS), true);
  assert.equal(settingsWriteShown(EXT_CLIENT_REQUEST.mcp_upsert, ACCEPTED_SETTINGS_METHODS), true);
  assert.equal(settingsWriteShown(EXT_DISPATCH_ONLY.skills_add, ACCEPTED_SETTINGS_METHODS), false);
  assert.equal(settingsWriteShown(EXT_DISPATCH_ONLY.skills_remove, ACCEPTED_SETTINGS_METHODS), false);
  assert.equal(settingsWriteShown(EXT_DISPATCH_ONLY.skills_config, ACCEPTED_SETTINGS_METHODS), false);
  assert.equal(settingsWriteShown(EXT_DISPATCH_ONLY.skills_reset, ACCEPTED_SETTINGS_METHODS), false);
  assert.equal(settingsWriteShown(EXT_CLIENT_REQUEST.mcp_toggle_tool, ACCEPTED_SETTINGS_METHODS), false);
  assert.equal(settingsWriteShown(EXT_CLIENT_REQUEST.hooks_action, ACCEPTED_SETTINGS_METHODS), false);
});
