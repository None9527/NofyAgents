import { tr } from "../../ui/i18n.ts";
import type { ModelConfigSnapshot } from "./contracts.ts";
import { settleSettingsWrite } from "./writeResult.ts";

export type ModelSaveExpectation = { id: string; name: string; makeDefault: boolean };

/** The native snapshot confirms a save only when the saved row is present. */
export function modelConfigConfirms(snapshot: ModelConfigSnapshot | null, expected: ModelSaveExpectation): boolean {
  if (snapshot === null) return false;
  const row = snapshot.models.find((item) => item.id === expected.id);
  if (row === undefined || row.name !== expected.name) return false;
  return !expected.makeDefault || snapshot.defaultModelId === expected.id;
}

export function decideModelSave(input: {
  written: ModelConfigSnapshot | null;
  readBack: ModelConfigSnapshot | null;
  expected: ModelSaveExpectation;
  readError: string | null;
}): { close: boolean; error: string | null } {
  if (input.readError !== null) {
    const settled = settleSettingsWrite({
      committed: input.expected,
      draft: input.expected,
      accepted: false,
      error: input.readError,
      readBack: null,
    });
    return { close: false, error: settled.error };
  }
  const writtenOk = modelConfigConfirms(input.written, input.expected);
  const readOk = modelConfigConfirms(input.readBack, input.expected);
  const settled = settleSettingsWrite({
    committed: input.expected,
    draft: input.expected,
    accepted: writtenOk,
    error: writtenOk && readOk ? null : tr("内核未回读确认。"),
    readBack: writtenOk && readOk ? input.expected : null,
  });
  if (!settled.success) return { close: false, error: settled.error ?? tr("内核未回读确认。") };
  return { close: true, error: null };
}

/** Close the editor only after updateModelConfig and a throwing read both confirm the row. */
export async function finishModelSave<TPatch>(
  models: { save: (patch: TPatch) => Promise<ModelConfigSnapshot>; read: () => Promise<ModelConfigSnapshot> },
  patch: TPatch,
  expected: ModelSaveExpectation,
): Promise<{ close: boolean; error: string | null }> {
  const written = await models.save(patch);
  let readBack: ModelConfigSnapshot | null = null;
  let readError: string | null = null;
  try {
    readBack = await models.read();
  } catch (error) {
    readError = error instanceof Error ? error.message : String(error);
  }
  return decideModelSave({ written, readBack, expected, readError });
}

/** A resolved resource refresh is not confirmation. Error status keeps the previous snapshot. */
export function modelResourceConfirms(
  snapshot: { status: string; data: unknown; error: string | null },
  expected: ModelSaveExpectation,
): { close: boolean; error: string | null } {
  const data = snapshot.data !== null && typeof snapshot.data === "object" && "models" in snapshot.data ? snapshot.data as ModelConfigSnapshot : null;
  const confirmed = snapshot.status === "ready" && modelConfigConfirms(data, expected);
  const settled = settleSettingsWrite({
    committed: expected,
    draft: expected,
    accepted: confirmed,
    error: confirmed ? null : snapshot.error ?? tr("内核未回读确认。"),
    readBack: confirmed ? expected : null,
  });
  return { close: settled.success, error: settled.error };
}
