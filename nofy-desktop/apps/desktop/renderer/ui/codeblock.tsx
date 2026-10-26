import { useLocale } from "./useLocale.ts";
import { useMemo, useState } from "react";
import { highlightLines, normalizeLang, renderTokens } from "./highlight.tsx";
import { IconWrap } from "./icons.tsx";
import { CopyButton, SaveButton } from "./contentActions.tsx";
import { Btn } from "./primitives.tsx";
import { tr } from "./i18n.ts";
export function CodeBlock({ lang, code, onSaveText, lineNumbers = true, defaultWrap = false }: { lang: string | null; code: string; onSaveText?: (text: string, filename: string) => Promise<boolean>; lineNumbers?: boolean; defaultWrap?: boolean }) {
  useLocale();
  const [wrap, setWrap] = useState(defaultWrap);
  const lines = useMemo(() => highlightLines(code, lang), [code, lang]);
  return <div className={"codeblock" + (wrap ? " codeblock--wrap" : "") + (lineNumbers ? " codeblock--numbered" : "")}>
    <div className="codeblock__head"><span className="codeblock__lang mono">{normalizeLang(lang)}</span><div className="codeblock__actions">
      <Btn variant="ghost" size="icon" aria-label={tr("代码自动换行")} title={tr("代码自动换行")} aria-pressed={wrap} onClick={() => setWrap(value => !value)}><IconWrap size={15} /></Btn>
      <SaveButton text={code} filename={"code." + (lang?.match(/^[a-z0-9]+$/i)?.[0] ?? "txt")} onSave={onSaveText} />
      <CopyButton text={code} label="复制代码块内容" />
    </div></div>
    <pre className="codeblock__pre mono"><code>{lines.map((line, i) => <span key={i} className="codeblock__line">{renderTokens(line, String(i))}{"\n"}</span>)}</code></pre>
  </div>;
}
