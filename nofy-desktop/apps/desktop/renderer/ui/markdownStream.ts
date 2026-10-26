import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const parser = unified().use(remarkParse).use(remarkGfm);
type SyntaxNode = { type:string; value?:string; children?:SyntaxNode[] };
export type MarkdownFragment = { key:string; text:string };

// Definitions can change earlier content. Unresolved references are plain text in
// mdast, so conservatively retain whole-document semantics for bracketed prose.
function needsDocumentContext(node: SyntaxNode): boolean {
  return node.type === 'definition' || node.type.startsWith('footnote') || node.type.endsWith('Reference') ||
    (node.type === 'text' && (node.value?.includes('[') ?? false)) ||
    (node.children?.some(needsDocumentContext) ?? false);
}

/** Per-message prefix cache. Keep the last top-level block mutable: lists, tables,
 * setext headings and unfinished fences can all grow across chunk boundaries. */
export function createMarkdownStream() {
  let source = '', offset = 0, epoch = 0, documentContext = false, parsedCharacters = 0;
  let stable: MarkdownFragment[] = [], result: MarkdownFragment[] = [];
  return {
    get parsedCharacters() { return parsedCharacters; },
    read(text: string): readonly MarkdownFragment[] {
      if (text === source) return result;
      if (!text.startsWith(source)) { stable = []; offset = 0; documentContext = false; epoch++; }
      source = text;
      if (documentContext) return result = [{ key:epoch + ':0', text }];
      const tail = text.slice(offset);
      parsedCharacters += tail.length;
      const tree = parser.parse(tail);
      if (needsDocumentContext(tree)) {
        documentContext = true; stable = []; offset = 0;
        return result = [{ key:epoch + ':0', text }];
      }
      const base = offset;
      for (let i = 0; i < tree.children.length - 1; i++) {
        const end = base + tree.children[i + 1]!.position!.start.offset!;
        stable.push({ key:epoch + ':' + offset, text:text.slice(offset, end) });
        offset = end;
      }
      result = [...stable, { key:epoch + ':' + offset, text:text.slice(offset) }];
      return result;
    },
  };
}
