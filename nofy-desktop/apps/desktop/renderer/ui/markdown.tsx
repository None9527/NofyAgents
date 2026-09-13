/**
 * Markdown 渲染 —— 自写的小型解析器，**输出 React 节点，不产出 HTML 字符串**。
 *
 * 为什么不用 dangerouslySetInnerHTML +  sanitzer：模型文本是不可信输入，
 * 「渲染 markdown」最容易引入的就是 XSS；走 React 节点从构造上就没有注入面。
 * 为什么不引 react-markdown/marked：S0 工艺批要的是 ZCode 观感的子集
 * （标题/列表/引用/行内码/围栏码/粗斜体/链接），自写 ~150 行可控、零依赖、
 * 样式完全走令牌；表格与语法高亮登记为后续批（uiux-reference.md §4）。
 *
 * 支持：# ~ ### 标题、- / * / 1. 列表（一层缩进嵌套）、> 引用、--- 分隔、
 * ``` 围栏代码、行内 `code` / **bold** / *italic* / [text](url)。
 * 不支持的行原样进段落——**渲染失败的表现是朴素，不是错乱**。
 */
import type { ReactNode } from "react";
import { CodeBlock } from "./codeblock.tsx";

type Inline = ReactNode;

const INLINE_RE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^\s)]+\))/g;

export function renderInline(text: string, keyBase: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = keyBase + ":" + String(i++);
    if (tok.startsWith("`")) out.push(<code key={key} className="md__code">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const close = tok.indexOf("](");
      const label = tok.slice(1, close);
      const href = tok.slice(close + 2, -1);
      out.push(
        <a key={key} className="md__link" href={href} title={href} onClick={(e) => e.preventDefault()}>
          {label}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type BlockNode =
  | { t: "h"; level: number; text: string }
  | { t: "p"; text: string }
  | { t: "code"; lang: string | null; text: string }
  | { t: "table"; header: string[]; rows: string[][] }
  | { t: "quote"; text: string }
  | { t: "hr" }
  | { t: "ul"; items: Array<{ text: string; depth: number }> }
  | { t: "ol"; items: Array<{ text: string; depth: number }> };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isSepLine(line: string): boolean {
  return /^[\s|:-]+$/.test(line) && line.includes("-") && line.includes("|");
}

function parseBlocks(src: string): BlockNode[] {
  const lines = src.split("\n");
  const out: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim().length === 0) {
      i++;
      continue;
    }
    const fence = line.trim().match(/^\`\`\`(\S*)/);
    if (fence !== null) {
      const lang = fence[1] === "" ? null : (fence[1] ?? null);
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]?.trim().startsWith("```")) {
        buf.push(lines[i] ?? "");
        i++;
      }
      i++;
      out.push({ t: "code", lang, text: buf.join("\n") });
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h !== null) {
      out.push({ t: "h", level: h[1]?.length ?? 1, text: h[2] ?? "" });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push({ t: "hr" });
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith(">")) {
        buf.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i++;
      }
      out.push({ t: "quote", text: buf.join("\n") });
      continue;
    }
    const bullet = line.match(/^(\s*)([-*])\s+(.*)$/);
    // 表格：表头行 + 分隔行（|---|）开头；吃到第一个非 | 行
    if (line.includes("|") && isSepLine(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").includes("|") && (lines[i] ?? "").trim().length > 0) {
        rows.push(splitRow(lines[i] ?? ""));
        i++;
      }
      out.push({ t: "table", header, rows });
      continue;
    }
    const ordered = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (bullet !== null || ordered !== null) {
      const kind = bullet !== null ? "ul" : "ol";
      const items: Array<{ text: string; depth: number }> = [];
      while (i < lines.length) {
        const l = lines[i] ?? "";
        const b = l.match(/^(\s*)([-*])\s+(.*)$/);
        const o = l.match(/^(\s*)(\d+)\.\s+(.*)$/);
        const hit = kind === "ul" ? b : o;
        if (hit === null) break;
        const depth = Math.min(2, Math.floor((hit[1]?.length ?? 0) / 2));
        items.push({ text: hit[3] ?? "", depth });
        i++;
      }
      out.push({ t: kind, items });
      continue;
    }
    const buf: string[] = [line];
    i++;
    while (i < lines.length) {
      const l = lines[i] ?? "";
      if (l.trim().length === 0 || /^(#{1,3}\s|>|\`\`\`|\s*([-*]|\d+\.)\s)/.test(l)) break;
      buf.push(l);
      i++;
    }
    out.push({ t: "p", text: buf.join("\n") });
  }
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="md">
      {blocks.map((b, i) => {
        const key = String(i);
        switch (b.t) {
          case "h": {
            const Tag = b.level === 1 ? "h2" : b.level === 2 ? "h3" : "h4";
            return <Tag key={key} className={"md__h md__h" + String(b.level)}>{renderInline(b.text, key)}</Tag>;
          }
          case "p":
            return (
              <p key={key} className="md__p">
                {renderInline(b.text, key)}
              </p>
            );
          case "code":
            return <CodeBlock key={key} lang={b.lang} code={b.text} />;
          case "table":
            return (
              <table key={key} className="md__table">
                <thead>
                  <tr>
                    {b.header.map((h, j) => (
                      <th key={String(j)}>{renderInline(h, key + ":h" + String(j))}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, j) => (
                    <tr key={String(j)}>
                      {r.map((c, k) => (
                        <td key={String(k)}>{renderInline(c, key + ":" + String(j) + ":" + String(k))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "quote":
            return (
              <blockquote key={key} className="md__quote">
                {renderInline(b.text, key)}
              </blockquote>
            );
          case "hr":
            return <hr key={key} className="md__hr" />;
          case "ul":
            return (
              <ul key={key} className="md__ul">
                {b.items.map((it, j) => (
                  <li key={String(j)} className={"md__li" + (it.depth > 0 ? " md__li--deep" : "")}>
                    {renderInline(it.text, key + ":" + String(j))}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="md__ol">
                {b.items.map((it, j) => (
                  <li key={String(j)} className={"md__li" + (it.depth > 0 ? " md__li--deep" : "")}>
                    {renderInline(it.text, key + ":" + String(j))}
                  </li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
