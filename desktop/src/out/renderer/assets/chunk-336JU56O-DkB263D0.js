const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./dagre-KV5264BT-DcjV4okn.js",
      "./chunk-U2HBQHQK-Cs90NbhX.js",
      "./src-D6nttw3b.js",
      "./chunk-Cq_f4orQ.js",
      "./string-DeCsdInp.js",
      "./chunk-5PVQY5BW-CHFWSpGD.js",
      "./dist-B7dupJ3c.js",
      "./step-BOU9QToW.js",
      "./linearClosed-sVKHPf8I.js",
      "./catmullRom-VKG4HBuo.js",
      "./math-hZRFyvgF.js",
      "./chunk-ICPOFSXX-C_rmVRO5.js",
      "./preload-helper-BHSF1fZ9.js",
      "./identity-BWeT0p4R.js",
      "./dagre-Ba15qe2z.js",
      "./graphlib-By8Ud-mb.js",
      "./isEmpty-CzqZrCGw.js",
      "./reduce-Bc5cHXXJ.js",
      "./flatten-D5zHxTCl.js",
      "./clone-C1scsHxK.js",
      "./chunk-5FUZZQ4R-BxSIwqfJ.js",
      "./chunk-X2U36JSP-GGXNMzXA.js",
      "./chunk-ZZ45TVLE-D6pHsM4Y.js",
      "./rough.esm-By2WpMXC.js",
      "./chunk-BSJP7CBP-CtqWAD3R.js",
      "./chunk-ENJZ2VHE-D2K2A5i_.js",
      "./line-B5c9ys_W.js",
      "./array-B2f2amhX.js",
      "./path-6nRvbSUf.js",
      "./path-DGMeFKnt.js",
      "./cose-bilkent-S5V4N54A-DoQtGwhn.js",
      "./cytoscape.esm-ZNxEkdto.js",
    ]),
) => i.map((i) => d[i]);
import { t as e } from "./preload-helper-BHSF1fZ9.js";
import { i as t, r as n } from "./src-D6nttw3b.js";
import { s as r, y as i } from "./chunk-ICPOFSXX-C_rmVRO5.js";
import { u as a } from "./chunk-5PVQY5BW-CHFWSpGD.js";
import { a as o, i as s, s as c } from "./chunk-5FUZZQ4R-BxSIwqfJ.js";
import { a as l, i as u, n as d, r as f } from "./chunk-ENJZ2VHE-D2K2A5i_.js";
var p = {
    common: r,
    getConfig: i,
    insertCluster: s,
    insertEdge: d,
    insertEdgeLabel: f,
    insertMarkers: u,
    insertNode: o,
    interpolateToCurve: a,
    labelHelper: c,
    log: t,
    positionEdgeLabel: l,
  },
  m = {},
  h = n((e) => {
    for (let t of e) m[t.name] = t;
  }, `registerLayoutLoaders`);
n(() => {
  h([
    {
      name: `dagre`,
      loader: n(
        async () =>
          await e(
            () => import(`./dagre-KV5264BT-DcjV4okn.js`),
            __vite__mapDeps([
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
              24, 25, 26, 27, 28, 29,
            ]),
            import.meta.url,
          ),
        `loader`,
      ),
    },
    ...[
      {
        name: `cose-bilkent`,
        loader: n(
          async () =>
            await e(
              () => import(`./cose-bilkent-S5V4N54A-DoQtGwhn.js`),
              __vite__mapDeps([30, 3, 31, 2, 4]),
              import.meta.url,
            ),
          `loader`,
        ),
      },
    ],
  ]);
}, `registerDefaultLayoutLoaders`)();
var g = n(async (e, t) => {
    if (!(e.layoutAlgorithm in m)) throw Error(`Unknown layout algorithm: ${e.layoutAlgorithm}`);
    if (e.diagramId)
      for (let t of e.nodes) {
        let n = t.domId || t.id;
        t.domId = `${e.diagramId}-${n}`;
      }
    let n = m[e.layoutAlgorithm],
      r = await n.loader(),
      { theme: i, themeVariables: a } = e.config,
      { useGradient: o, gradientStart: s, gradientStop: c } = a,
      l = t.attr(`id`);
    if (
      (t
        .append(`defs`)
        .append(`filter`)
        .attr(`id`, `${l}-drop-shadow`)
        .attr(`height`, `130%`)
        .attr(`width`, `130%`)
        .append(`feDropShadow`)
        .attr(`dx`, `4`)
        .attr(`dy`, `4`)
        .attr(`stdDeviation`, 0)
        .attr(`flood-opacity`, `0.06`)
        .attr(`flood-color`, `${i?.includes(`dark`) ? `#FFFFFF` : `#000000`}`),
      t
        .append(`defs`)
        .append(`filter`)
        .attr(`id`, `${l}-drop-shadow-small`)
        .attr(`height`, `150%`)
        .attr(`width`, `150%`)
        .append(`feDropShadow`)
        .attr(`dx`, `2`)
        .attr(`dy`, `2`)
        .attr(`stdDeviation`, 0)
        .attr(`flood-opacity`, `0.06`)
        .attr(`flood-color`, `${i?.includes(`dark`) ? `#FFFFFF` : `#000000`}`),
      o)
    ) {
      let e = t
        .append(`linearGradient`)
        .attr(`id`, t.attr(`id`) + `-gradient`)
        .attr(`gradientUnits`, `objectBoundingBox`)
        .attr(`x1`, `0%`)
        .attr(`y1`, `0%`)
        .attr(`x2`, `100%`)
        .attr(`y2`, `0%`);
      (e.append(`svg:stop`).attr(`offset`, `0%`).attr(`stop-color`, s).attr(`stop-opacity`, 1),
        e.append(`svg:stop`).attr(`offset`, `100%`).attr(`stop-color`, c).attr(`stop-opacity`, 1));
    }
    return r.render(e, t, p, { algorithm: n.algorithm });
  }, `render`),
  _ = n((e = ``, { fallback: n = `dagre` } = {}) => {
    if (e in m) return e;
    if (n in m)
      return (t.warn(`Layout algorithm ${e} is not registered. Using ${n} as fallback.`), n);
    throw Error(`Both layout algorithms ${e} and ${n} are not registered.`);
  }, `getRegisteredLayoutAlgorithm`);
export { h as n, g as r, _ as t };
