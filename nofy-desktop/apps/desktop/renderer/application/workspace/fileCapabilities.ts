export type FilePreviewKind = "markdown" | "text" | "image" | "unsupported";
export function filePreviewKind(path: string): FilePreviewKind {
  if (/\.(md|markdown)$/i.test(path)) return "markdown";
  if (/\.(png|jpe?g|gif|webp)$/i.test(path)) return "image";
  if (/\.(zip|gz|tar|7z|rar|bz2|xz|pdf|docx?|xlsx?|pptx?|mp[34]|mov|wav|ogg|woff2?|ttf|dmg|exe|dll|so|sqlite|db|svg)$/i.test(path)) return "unsupported";
  return "text";
}
