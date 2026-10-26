/** Native model config boundary. Snapshots never contain secrets or raw config. */
export type ModelApiBackend = 'chat_completions' | 'responses' | 'messages';
export type ModelConfigRow = {
  id: string;
  name: string;
  model: string;
  providerId: string | null;
  baseUrl: string | null;
  apiBackend: ModelApiBackend;
  hasApiKey: boolean;
  hasHiddenUrlParts: boolean;
  hasModelOverrides: boolean;
};
export type ModelProviderRow = {
  id: string;
  baseUrl: string | null;
  apiBackend: ModelApiBackend;
  hasApiKey: boolean;
  hasHiddenUrlParts: boolean;
};
export type ModelConfigSnapshot = {
  revisionHash: string;
  format: 'json' | 'toml' | 'missing';
  editable: boolean;
  reason: string | null;
  defaultModelId: string | null;
  models: ModelConfigRow[];
  providers: ModelProviderRow[];
};
export type ModelConfigPatch = {
  expectedRevision: string;
  id: string;
  name: string;
  /** Omitted on edit preserves the existing endpoint, including hidden URL query fields. */
  baseUrl?: string;
  /** Omitted preserves existing credentials; empty values are rejected. */
  apiKey?: string;
  makeDefault: boolean;
  /** Optional shared provider; omitted keeps per-model configuration. */
  providerId?: string;
  apiBackend?: ModelApiBackend;
  model?: string;
};
export type ModelConfigAccess = {
  readModelConfig: () => Promise<ModelConfigSnapshot>;
  updateModelConfig: (patch: ModelConfigPatch) => Promise<ModelConfigSnapshot>;
};
