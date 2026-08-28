// Dependency-free markdown renderer tuned for agent replies:
// headings, bold/italic, inline code, links, lists, quotes, tables, hrs,
// fenced code with language tag + copy button.
import { useState, type ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // tokenize: `code`, **bold**, *italic*, [link](url)
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(
        <code className="md-inline-code" key={`${keyBase}-${k++}`}>
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={`${keyBase}-${k++}`}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={`${keyBase}-${k++}`}>{tok.slice(1, -1)}</em>);
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (lm) {
        out.push(
          <a key={`${keyBase}-${k++}`} href={lm[2]} target="_blank" rel="noreferrer">
            {lm[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Lightweight per-line syntax highlighter (no dependencies): comments,
// strings, numbers and a shared keyword set across common languages.
const KEYWORDS = new Set(
  (
    "function const let var return if else for while import export from class new async await " +
    "try catch throw switch case break continue type interface extends implements public private " +
    "static void def print in not and or None True False fn mut pub struct enum match use mod impl " +
    "trait do end then nil true false local require"
  ).split(/\s+/),
);
const HASH_COMMENT = new Set(["py", "python", "bash", "sh", "shell", "toml", "yaml", "yml", "makefile", ""]);

function hlLine(line: string, lang: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const comment = HASH_COMMENT.has(lang) ? "#" : "//";
  const re = new RegExp(
    `(${comment}.*$)|("[^"]*"|'[^']*'|\`[^\`]*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)`,
    "g",
  );
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const tok = m[0];
    const cls = m[1] ? "tok-c" : m[2] ? "tok-s" : m[3] ? "tok-n" : KEYWORDS.has(tok) ? "tok-k" : "";
    out.push(
      cls ? (
        <span className={cls} key={`${keyBase}-${k++}`}>
          {tok}
        </span>
      ) : (
        tok
      ),
    );
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  return (
    <div className="md-codeblock">
      <div className="md-codeblock-head">
        <span>{lang || "text"}</span>
        <span
          className="md-copy"
          onClick={() => {
            void navigator.clipboard?.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "已复制" : "复制"}
        </span>
      </div>
      <pre className="md-code md-code-lines">
        {lines.map((line, i) => (
          <div className="code-line" key={i}>
            <span className="code-ln">{i + 1}</span>
            <span className="code-src">{hlLine(line, lang, `l${i}`)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export function renderMarkdown(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fence = /^```(\w*)\s*$/.exec(line.trim());
    if (fence) {
      const lang = fence[1];
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(<CodeBlock key={key++} lang={lang} code={buf.join("\n")} />);
      continue;
    }

    // blank
    if (line.trim() === "") {
      i++;
      continue;
    }

    // heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      out.push(
        <div className={`md-h md-h${level}`} key={key++}>
          {inline(h[2], `h${key}`)}
        </div>,
      );
      i++;
      continue;
    }

    // hr
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push(<div className="md-hr" key={key++} />);
      i++;
      continue;
    }

    // blockquote
    if (line.trim().startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        buf.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(
        <div className="md-quote" key={key++}>
          {inline(buf.join(" "), `q${key}`)}
        </div>,
      );
      continue;
    }

    // table
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|?[\s:-]+\|/.test(lines[i + 1])) {
      const parseRow = (r: string) =>
        r
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const head = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      out.push(
        <table className="md-table" key={key++}>
          <thead>
            <tr>
              {head.map((c, ci) => (
                <th key={ci}>{inline(c, `th${key}-${ci}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci}>{inline(c, `td${key}-${ri}-${ci}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    // lists
    const ul = /^(\s*)[-*•]\s+(.*)$/.exec(line);
    const ol = /^(\s*)\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      const ordered = Boolean(ol);
      const items: string[] = [];
      const re2 = ordered ? /^(\s*)\d+[.)]\s+(.*)$/ : /^(\s*)[-*•]\s+(.*)$/;
      while (i < lines.length) {
        const m2 = re2.exec(lines[i]);
        if (!m2) break;
        items.push(m2[2]);
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      out.push(
        <Tag className="md-list" key={key++}>
          {items.map((item, ii) => (
            <li key={ii}>{inline(item, `li${key}-${ii}`)}</li>
          ))}
        </Tag>,
      );
      continue;
    }

    // paragraph
    out.push(<div className="md-p" key={key++}>{inline(line, `p${key}`)}</div>);
    i++;
  }
  return out;
}
