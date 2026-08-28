const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./info-OMHHGYJF-DxeNaTt9.js",
      "./chunk-K5T4RW27-C2k7zM1B.js",
      "./chunk-Cq_f4orQ.js",
      "./isEmpty-CzqZrCGw.js",
      "./identity-BWeT0p4R.js",
      "./reduce-Bc5cHXXJ.js",
      "./flatten-D5zHxTCl.js",
      "./chunk-KGLVRYIC-BHpl30-B.js",
      "./packet-4T2RLAQJ-do9TQ2oW.js",
      "./chunk-FOC6F5B3-DKRBqgb6.js",
      "./pie-ZZUOXDRM-D2y5C8UT.js",
      "./chunk-AA7GKIK3-USDP_OCc.js",
      "./treeView-SZITEDCU-DpZRKpHb.js",
      "./chunk-ORNJ4GCN-Bu3Yxmim.js",
      "./architecture-YZFGNWBL-C_yj8nWv.js",
      "./chunk-7N4EOEYR-CsHhOX59.js",
      "./gitGraph-7Q5UKJZL-3kAD1sB3.js",
      "./chunk-67CJDMHE-Cexdo6Zz.js",
      "./radar-PYXPWWZC-ClC9wlgL.js",
      "./chunk-2KRD3SAO-CGz6ceN4.js",
      "./treemap-W4RFUUIX-Dge-OZNU.js",
      "./chunk-LIHQZDEY-D6IgIE9_.js",
      "./wardley-RL74JXVD-B0NkEXbY.js",
      "./chunk-CIAEETIT-DcXR9d5t.js",
    ]),
) => i.map((i) => d[i]);
import { t as e } from "./preload-helper-BHSF1fZ9.js";
import { m as t } from "./chunk-K5T4RW27-C2k7zM1B.js";
import "./chunk-7N4EOEYR-CsHhOX59.js";
import "./chunk-67CJDMHE-Cexdo6Zz.js";
import "./chunk-KGLVRYIC-BHpl30-B.js";
import "./chunk-FOC6F5B3-DKRBqgb6.js";
import "./chunk-AA7GKIK3-USDP_OCc.js";
import "./chunk-2KRD3SAO-CGz6ceN4.js";
import "./chunk-ORNJ4GCN-Bu3Yxmim.js";
import "./chunk-LIHQZDEY-D6IgIE9_.js";
import "./chunk-CIAEETIT-DcXR9d5t.js";
var n = {},
  r = {
    info: t(async () => {
      let { createInfoServices: t } = await e(
        async () => {
          let { createInfoServices: e } = await import(`./info-OMHHGYJF-DxeNaTt9.js`);
          return { createInfoServices: e };
        },
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7]),
        import.meta.url,
      );
      n.info = t().Info.parser.LangiumParser;
    }, `info`),
    packet: t(async () => {
      let { createPacketServices: t } = await e(
        async () => {
          let { createPacketServices: e } = await import(`./packet-4T2RLAQJ-do9TQ2oW.js`);
          return { createPacketServices: e };
        },
        __vite__mapDeps([8, 1, 2, 3, 4, 5, 6, 9]),
        import.meta.url,
      );
      n.packet = t().Packet.parser.LangiumParser;
    }, `packet`),
    pie: t(async () => {
      let { createPieServices: t } = await e(
        async () => {
          let { createPieServices: e } = await import(`./pie-ZZUOXDRM-D2y5C8UT.js`);
          return { createPieServices: e };
        },
        __vite__mapDeps([10, 1, 2, 3, 4, 5, 6, 11]),
        import.meta.url,
      );
      n.pie = t().Pie.parser.LangiumParser;
    }, `pie`),
    treeView: t(async () => {
      let { createTreeViewServices: t } = await e(
        async () => {
          let { createTreeViewServices: e } = await import(`./treeView-SZITEDCU-DpZRKpHb.js`);
          return { createTreeViewServices: e };
        },
        __vite__mapDeps([12, 1, 2, 3, 4, 5, 6, 13]),
        import.meta.url,
      );
      n.treeView = t().TreeView.parser.LangiumParser;
    }, `treeView`),
    architecture: t(async () => {
      let { createArchitectureServices: t } = await e(
        async () => {
          let { createArchitectureServices: e } = await import(
            `./architecture-YZFGNWBL-C_yj8nWv.js`
          );
          return { createArchitectureServices: e };
        },
        __vite__mapDeps([14, 1, 2, 3, 4, 5, 6, 15]),
        import.meta.url,
      );
      n.architecture = t().Architecture.parser.LangiumParser;
    }, `architecture`),
    gitGraph: t(async () => {
      let { createGitGraphServices: t } = await e(
        async () => {
          let { createGitGraphServices: e } = await import(`./gitGraph-7Q5UKJZL-3kAD1sB3.js`);
          return { createGitGraphServices: e };
        },
        __vite__mapDeps([16, 1, 2, 3, 4, 5, 6, 17]),
        import.meta.url,
      );
      n.gitGraph = t().GitGraph.parser.LangiumParser;
    }, `gitGraph`),
    radar: t(async () => {
      let { createRadarServices: t } = await e(
        async () => {
          let { createRadarServices: e } = await import(`./radar-PYXPWWZC-ClC9wlgL.js`);
          return { createRadarServices: e };
        },
        __vite__mapDeps([18, 1, 2, 3, 4, 5, 6, 19]),
        import.meta.url,
      );
      n.radar = t().Radar.parser.LangiumParser;
    }, `radar`),
    treemap: t(async () => {
      let { createTreemapServices: t } = await e(
        async () => {
          let { createTreemapServices: e } = await import(`./treemap-W4RFUUIX-Dge-OZNU.js`);
          return { createTreemapServices: e };
        },
        __vite__mapDeps([20, 1, 2, 3, 4, 5, 6, 21]),
        import.meta.url,
      );
      n.treemap = t().Treemap.parser.LangiumParser;
    }, `treemap`),
    wardley: t(async () => {
      let { createWardleyServices: t } = await e(
        async () => {
          let { createWardleyServices: e } = await import(`./wardley-RL74JXVD-B0NkEXbY.js`);
          return { createWardleyServices: e };
        },
        __vite__mapDeps([22, 1, 2, 3, 4, 5, 6, 23]),
        import.meta.url,
      );
      n.wardley = t().Wardley.parser.LangiumParser;
    }, `wardley`),
  };
async function i(e, t) {
  let i = r[e];
  if (!i) throw Error(`Unknown diagram type: ${e}`);
  n[e] || (await i());
  let o = n[e].parse(t);
  if (o.lexerErrors.length > 0 || o.parserErrors.length > 0) throw new a(o);
  return o.value;
}
t(i, `parse`);
var a = class extends Error {
  constructor(e) {
    let t = e.lexerErrors.map(
        (e) =>
          `Lexer error on line ${e.line !== void 0 && !isNaN(e.line) ? e.line : `?`}, column ${e.column !== void 0 && !isNaN(e.column) ? e.column : `?`}: ${e.message}`,
      ).join(`
`),
      n = e.parserErrors.map(
        (e) =>
          `Parse error on line ${e.token.startLine !== void 0 && !isNaN(e.token.startLine) ? e.token.startLine : `?`}, column ${e.token.startColumn !== void 0 && !isNaN(e.token.startColumn) ? e.token.startColumn : `?`}: ${e.message}`,
      ).join(`
`);
    (super(`Parsing failed: ${t} ${n}`), (this.result = e));
  }
  static {
    t(this, `MermaidParseError`);
  }
};
export { i as t };
