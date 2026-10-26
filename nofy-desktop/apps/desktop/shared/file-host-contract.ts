export type FileOpenKind = "default" | "choose" | "reveal";
export type FileHostResult = { ok: true; canceled?: boolean; application?: string } | { ok: false; error: string };
export type FileHostAccess = {
  copyFilePath: (value: string) => Promise<FileHostResult>;
  openWorkspacePath: (path: string, kind: FileOpenKind) => Promise<FileHostResult>;
};
