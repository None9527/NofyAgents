/**
 * CodeBlock —— 代码块外壳：语言条 + 复制按钮 + 行号 + 高亮正文。
 *
 * 解剖对照（活壳 streamdown 族，见 MarkdownCodeBlock.tsx 头注）：
 *   CodeBlockHeader（语言名条）→ 我们的 .codeblock__head
 *   CodeBlockCopyButton        → 复制按钮（下载按钮登记在 uiux-reference.md §7，
 *                                它需要 document.createElement 造 anchor，暂不做）
 *   行号（CSS counter）         → .codeblock__line::before
 *   shiki 高亮正文              → 自写 highlight.tsx（取舍见其文件头）
 *
 * 复制走 navigator.clipboard（用户手势内、非 window/document API，dep-guard 兼容）；
 * 失败给「复制失败」而不是静默——剪贴板权限被拒是常见现实。
 */
import { useMemo, useState } from "react";
import { highlightLines, normalizeLang, renderTokens } from "./highlight.tsx";
import { IconCheck, IconCopy } from "./icons.tsx";

export function CodeBlock({ lang, code }: { lang: string | null; code: string }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "err">("idle");
  const lines = useMemo(() => highlightLines(code, lang), [code, lang]);

  const copy = (): void => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied("ok");
        setTimeout(() => setCopied("idle"), 1500);
      })
      .catch(() => setCopied("err"));
  };

  return (
    <div className="codeblock">
      <div className="codeblock__head">
        <span className="codeblock__lang mono">{normalizeLang(lang)}</span>
        <button type="button" className="codeblock__copy" onClick={copy} title="复制代码块内容">
          {copied === "ok" ? <IconCheck size={12} /> : <IconCopy size={12} />}
          <span>{copied === "ok" ? "已复制" : copied === "err" ? "复制失败" : "复制"}</span>
        </button>
      </div>
      <pre className="codeblock__pre mono">
        <code>
          {lines.map((ln, i) => (
            <span key={String(i)} className="codeblock__line">
              {renderTokens(ln, String(i))}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
