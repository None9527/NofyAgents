import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createMarkdownStream } from '../renderer/ui/markdownStream.ts';

const html = (text:string) => renderToStaticMarkup(createElement(ReactMarkdown, {remarkPlugins:[remarkGfm],skipHtml:true,children:text}));
const cases = [
  '# 标题\n\n段落 **强调**，包含 `code`。\n\n下一段。',
  '标题\n---\n\n- one\n\n  continuation\n- two\n\n# End',
  '前文\n\n```json\n{"list": [1, 2]}\n```\n\n末尾 *正文*',
  '前文\n\n~~~js\nconst x = "```";\n~~~\n\n末尾',
  '| 项目 | 值 |\n| --- | ---: |\n| CPU | 8 |\n| RAM | 16 |\n\n后文',
  '> 引用\n>\n> - nested\n> - items\n\n正文\n\n    indented code\n\n    continued\n\n结束',
  '先读 [引用][target]。\n\n```ts\nconst x=1\n```\n\n[target]: https://example.com',
  '一个脚注[^n]。\n\n其他段落\n\n[^n]: 注解',
  '- [x] task\n- [ ] next\n\n![alt](https://example.com/image.png)\n\n---',
  '<div>\nraw html\n</div>\n\n安全正文',
];
for (const [index, source] of cases.entries()) test('incremental CommonMark/GFM matches whole document at every boundary '+index, () => {
  const stream = createMarkdownStream();
  for (let end = 1; end <= source.length; end++) {
    const text = source.slice(0,end), fragments = stream.read(text);
    assert.equal(fragments.map(part=>part.text).join(''),text);
    // ReactMarkdown inserts root separator newlines; they have no visual semantics.
    assert.equal(fragments.map(part=>html(part.text)).join('').replace(/>\n</g,'><').trim(),html(text).replace(/>\n</g,'><').trim(), 'offset '+end+' '+JSON.stringify(text));
  }
});
test('finished prefixes retain identity and stop being parsed while the tail grows', () => {
  const stream=createMarkdownStream(), prefix=('# Header\n\nparagraph\n\n').repeat(150);
  const initial=stream.read(prefix+'tail');
  const before=stream.parsedCharacters;
  for(let i=1;i<=40;i++) {
    const parts=stream.read(prefix+'tail'+'x'.repeat(i));
    assert.equal(parts[0],initial[0]);
    assert.equal(parts.at(-1)!.key,initial.at(-1)!.key);
  }
  assert.ok(stream.parsedCharacters-before<2000);
});
test('replacement invalidates prior source and identical reads do no parsing', () => {
  const stream=createMarkdownStream();const old=stream.read('old\n\nparagraph');
  const next=stream.read('new\n\nparagraph');assert.notEqual(next[0]!.key,old[0]!.key);
  const count=stream.parsedCharacters;assert.equal(stream.read('new\n\nparagraph'),next);assert.equal(stream.parsedCharacters,count);
});
