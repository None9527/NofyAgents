import { useLocale } from "./useLocale.ts";
import { useEffect, useRef, useState } from "react";
import { Btn } from "./primitives.tsx";
import { IconCheck, IconCopy, IconDownload } from "./icons.tsx";
import { tr } from "./i18n.ts";
export function CopyButton({ text, label = "复制" }: { text: string | (() => string); label?: string }) {
  useLocale();
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <Btn variant="ghost" size="icon" aria-label={tr(label)} title={state === "ok" ? tr("已复制") : state === "error" ? tr("复制失败") : tr(label)} onClick={() => {
    void navigator.clipboard.writeText(typeof text === "function" ? text() : text).then(() => {
      setState("ok"); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setState("idle"), 1500);
    }).catch(() => setState("error"));
  }}>{state === "ok" ? <IconCheck size={15} /> : <IconCopy size={15} />}<span className="sr-only" aria-live="polite">{state === "ok" ? tr("已复制") : state === "error" ? tr("复制失败") : ""}</span></Btn>;
}
export function SaveButton({ text, filename, onSave }: { text: string | (() => string); filename: string; onSave?: (text: string, filename: string) => Promise<boolean> }) {
  useLocale();
  const [failed, setFailed] = useState(false);
  return <Btn variant="ghost" size="icon" aria-label={tr("下载内容")} title={failed ? tr("保存失败") : tr("下载内容")} onClick={() => {
    setFailed(false);
    const value = typeof text === "function" ? text() : text;
    if (onSave) { void onSave(value, filename).catch(() => setFailed(true)); return; }
    const url = URL.createObjectURL(new Blob([value], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }}><IconDownload size={15} /></Btn>;
}
