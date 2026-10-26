/** Reject another cascade patch with the same selector in the same context. */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
type Node = { type: string; selector?: string; name?: string; params?: string; nodes?: Node[] };
const parser = require(require.resolve("postcss", { paths: [dirname(require.resolve("vite/package.json"))] })) as { parse: (text: string) => Node };
const ui = join(dirname(fileURLToPath(import.meta.url)), "../renderer/ui");
const files = ["foundations.css", "components.css", "content.css", "conversation.css", "settings.css", "workspace.css", "taskOverview.css", "styles.css"];
const seen = new Map<string, string>();
const problems: string[] = [];
function visit(nodes: Node[], context: string[], file: string): void {
  for (const node of nodes) {
    if (node.type === "rule" && node.selector) {
      if (file === "styles.css" && /\.(?:aux__(?!handle\b|sliver\b)|fileworkspace__|filepane__|filetree__|review(?:__|row|\b)|ui-pane-)/.test(node.selector)) problems.push(file + " contains right-workspace control/layout selector " + node.selector + "; use workspace.css or components.css");
      if (file !== "components.css" && /\.ui-pane-/.test(node.selector)) problems.push(file + " overrides shared workbench controls " + node.selector + "; use components.css");

      const key = context.join(" > ") + ":" + node.selector.replace(/\s+/g, " ").trim();
      const previous = seen.get(key);
      if (previous) problems.push(file + " repeats " + node.selector + " from " + previous);
      seen.set(key, file);
    } else if (node.type === "atrule" && node.nodes && !node.name?.includes("keyframes")) {
      visit(node.nodes, [...context, "@" + node.name + " " + (node.params ?? "")], file);
    }
  }
}
for (const file of files) visit(parser.parse(await readFile(join(ui, file), "utf8")).nodes ?? [], [], file);
if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
else console.log("UI style ownership verified: " + files.length + " modules, no duplicate selectors in the same context");
