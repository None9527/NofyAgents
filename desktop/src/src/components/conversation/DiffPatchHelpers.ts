// A1-P1-B13：diff 行解析配色域逐字重建（styles js 100466–100506，共 41 行，2 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B12 留批卫星，gut@100507 DiffView 之先行实体化铺路）。
// 纯闭合零依赖；消费面留批（gut 束体未实体化，F19 域）。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；无参数缝（零参数函数）。
// 区段切分墓碑：左界 = ToolLayoutBlocks 右界邻接（lQ@100465）；右界 gut@100507（DiffView，F19 域）。
// 注意：CTV parsePatchLines/inferPatchLanguage 双 declare（105/106）为手写面近似签名，与 mut/hut 真身不符，
//   不构成本叶消费面，原样留存（见 A1-P1-B13.report.md §七）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   mut→parseDiffLine（100466）| hut→diffKindVisualStyle（100474）
/* eslint-disable */

/* ── diff 行解析配色域（styles 100466–100506） ── */
function parseDiffLine(e: any) {
  return e.startsWith(`+`)
    ? { content: e.slice(1), kind: `added`, marker: `+`, raw: e }
    : e.startsWith(`-`)
      ? { content: e.slice(1), kind: `removed`, marker: `-`, raw: e }
      : e.startsWith(` `)
        ? { content: e.slice(1), kind: `context`, marker: ` `, raw: e }
        : { content: e, kind: `context`, marker: ``, raw: e };
}
function diffKindVisualStyle(e: any) {
  return e === `added`
    ? {
        lineNumberClassName: `text-diff-added`,
        rowStyle: {
          backgroundColor: `color-mix(in srgb, var(--color-diff-added) 14%, transparent)`,
          boxShadow: `inset 3px 0 0 var(--color-diff-added)`,
        },
        gutterStyle: {
          backgroundColor: `color-mix(in srgb, var(--color-diff-added) 18%, var(--color-background))`,
          boxShadow: `inset 3px 0 0 var(--color-diff-added)`,
          color: `var(--color-diff-added)`,
        },
      }
    : e === `removed`
      ? {
          lineNumberClassName: `text-diff-removed`,
          rowStyle: {
            backgroundColor: `color-mix(in srgb, var(--color-diff-removed) 14%, transparent)`,
            boxShadow: `inset 3px 0 0 var(--color-diff-removed)`,
          },
          gutterStyle: {
            backgroundColor: `color-mix(in srgb, var(--color-diff-removed) 18%, var(--color-background))`,
            boxShadow: `inset 3px 0 0 var(--color-diff-removed)`,
            color: `var(--color-diff-removed)`,
          },
        }
      : {
          lineNumberClassName: `text-foreground-subtlest`,
          gutterStyle: { backgroundColor: `var(--color-background)` },
        };
}

export { parseDiffLine, diffKindVisualStyle };
