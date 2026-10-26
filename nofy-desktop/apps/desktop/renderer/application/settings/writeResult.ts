/** Visible settings state changes only after the same resource is read back. */
export type SettingsWriteSettlement<T> = {
  success: boolean;
  visible: T;
  draft: T;
  error: string | null;
};

export function settleSettingsWrite<T>(input: {
  committed: T;
  draft: T;
  accepted: boolean;
  error: string | null;
  readBack: T | null;
}): SettingsWriteSettlement<T> {
  if (input.accepted && input.readBack !== null) {
    return { success: true, visible: input.readBack, draft: input.readBack, error: null };
  }
  return { success: false, visible: input.committed, draft: input.draft, error: input.error };
}
