import { decodeSessionMetadata } from "./sessionMetadataModel.ts";
import type { SessionMetadataPrefs } from "./sessionMetadataModel.ts";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";

export function loadSessionMetadata(): SessionMetadataPrefs {
  return decodeSessionMetadata(readPreference("session-metadata"));
}
export function saveSessionMetadata(prefs: SessionMetadataPrefs): boolean {
  return writePreference("session-metadata", prefs);
}
