import { memo, useMemo, useRef, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { recordRender } from "./renderDiagnostics.ts";
import { CodeBlock } from "./codeblock.tsx";
import { MarkdownTable } from "./markdownTable.tsx";
import { createMarkdownStream } from "./markdownStream.ts";
const plugins = [remarkGfm];
const MarkdownFragmentView = memo(function MarkdownFragmentView({ text, components }: { text: string; components: Components }) {
  recordRender("MarkdownFragment");
  return <ReactMarkdown remarkPlugins={plugins} skipHtml components={components}>{text}</ReactMarkdown>;
});
/** One CommonMark/GFM renderer for messages, files and settings; no raw HTML. */
export const Markdown = memo(function Markdown({ text, streaming = false, onSaveText }: { text: string; streaming?: boolean; onSaveText?: (text: string, filename: string) => Promise<boolean> }) {
  recordRender("Markdown");
  const stream = useRef<ReturnType<typeof createMarkdownStream> | null>(null);
  // Retain fragment identities on completion: code/table controls keep their state.
  if (streaming && stream.current === null) stream.current = createMarkdownStream();
  const components = useMemo<Components>(() => ({
    h1: ({ children }) => <h2 className="md__h md__h1">{children}</h2>,
    h2: ({ children }) => <h3 className="md__h md__h2">{children}</h3>,
    h3: ({ children }) => <h4 className="md__h md__h3">{children}</h4>,
    p: ({ children }) => <p className="md__p">{children}</p>,
    code: ({ children, className }) => <code className={className ?? "md__code"}>{children}</code>,
    pre: ({ children }) => {
      const child = Array.isArray(children) ? children[0] : children;
      if (isValidElement<ComponentProps<"code">>(child)) {
        const code = String(child.props.children ?? "").replace(/\n$/, "");
        return <CodeBlock lang={child.props.className?.replace(/^language-/, "") ?? null} code={code} onSaveText={onSaveText} lineNumbers={false} />;
      }
      return <pre>{children as ReactNode}</pre>;
    },
    table: ({ children }) => <MarkdownTable onSaveText={onSaveText}>{children}</MarkdownTable>,
    blockquote: ({ children }) => <blockquote className="md__quote">{children}</blockquote>,
    ul: ({ children, className }) => <ul className={"md__ul " + (className ?? "")}>{children}</ul>,
    ol: ({ children, start }) => <ol className="md__ol" start={start}>{children}</ol>,
    li: ({ children, className }) => <li className={"md__li " + (className ?? "")}>{children}</li>,
    hr: () => <hr className="md__hr" />,
    a: ({ children, href }) => <a className="md__link" href={href} title={href} onClick={event => event.preventDefault()}>{children}</a>,
    img: ({ alt }) => <span>{alt}</span>,
  }), [onSaveText]);
  const fragments = stream.current?.read(text);
  return <div className="md">{fragments
    ? fragments.map(part => <MarkdownFragmentView key={part.key} text={part.text} components={components} />)
    : <MarkdownFragmentView text={text} components={components} />}</div>;
});
