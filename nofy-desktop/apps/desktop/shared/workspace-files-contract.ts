export type WorkspaceWatch = { id: string; root: string; directories: string[] };
export type WorkspaceChange = { id: string; root: string; paths: string[] };
export type RasterResult = { ok: true; dataUrl: string; size: number } | { ok: false; error: string };
export type WorkspaceFileAccess = {
  readRaster: (root: string, path: string) => Promise<RasterResult>;
  watchFiles: (request: WorkspaceWatch) => Promise<{ ok: boolean; error?: string }>;
  unwatchFiles: (id: string) => Promise<void>;
  onFilesChanged: (listener: (change: WorkspaceChange) => void) => () => void;
};
