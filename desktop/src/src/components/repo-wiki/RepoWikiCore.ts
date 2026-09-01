/**
 * ============================================================================
 * RepoWikiCore.ts — repo-wiki 域首簇：页树合成 + 项目裁决（纯数据面）
 * ============================================================================
 *
 * 〔A1-P2-B8〕项 3（repo-wiki 整域首批）。域图见 A1-P2-B6.report.md §四.2
 * （整域 ≈1,670 行 / 26+ 件，域根 l3 = RepoWikiMain 132323-133087 未重建）。
 * 本批按闭合子簇拆批取首簇：132222–132322 纯函数簇（零 freevar——无 React /
 * 无 store / 无跨域依赖，AST 逐件实证），域内消费点全数登记在下表，接线待
 * 域根批（l3 转录）自然闭合。真身基准 = out/renderer/assets/styles-CdEGpc2x.js
 * （md5 48d71d4874b0868d61fd35a328bf6ad5）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = 融合 chunk js 行）
 * ----------------------------------------------------------------------------
 *   SAt → resolveWikiPageTree          页树裁决：catalogTree 优先（剪枝到现有页），
 *                                      否则父子林，末路按项目名分组（132222-132228）
 *   CAt → pruneCatalogTreeToPages      目录树剪枝（递归，保留有页/有后代之节点）（132229-132237）
 *   wAt → buildPageForest              按 parentId 建父子林，孤儿为根（132238-132256）
 *   TAt → mapPageToTreeNode            页 → 树节点（递归挂子）（132257-132266）
 *   EAt → groupPagesByProjectName      按派生项目名分组（≤1 组退化为平铺）（132267-132294）
 *   DAt → deriveProjectNameOfPage      项目名派生（标题冒号前缀 > 路径首段 > Wiki）（132295-132300）
 *   OAt → slugify                      分组 slug（小写，非字母数字中文转 -）（132301-132303）
 *   kAt → resolveEntryProjectId        入口项目解析（entryWorkspaceKey 命中 > 首项 > null）（132304-132306）
 *   AAt → resolveInitialProjectId      初始项目裁决（preferEntryProject > 现行项目存在性 > 入口）（132307-132314）
 *   c3…LAt 常量块（132315-132322）→ 下方八常量（逐值逐字）
 *
 * ----------------------------------------------------------------------------
 * 二、域内消费面（全数登记；束内域外零消费——grep 实证）
 * ----------------------------------------------------------------------------
 *   resolveWikiPageTree：133694（域尾助手簇，`o = SAt(a)`）
 *   resolveEntryProjectId：132308（本簇 AAt 内）/ 132623（l3 内）
 *   resolveInitialProjectId：132629（l3 内）
 *   WIKI_DEFAULT_MAX_RETRIES：132668（l3 `maxRetries ?? c3`）/ 133936/133939（域尾 yjt/bjt 解析回退）
 *   WIKI_MAX_RETRIES_LIMIT：133545（HAt 表单 `max: jAt`）/ 133939（bjt clamp 上限）
 *   WIKI_PROGRESS_RECENCY_WINDOW_MS：132524（l3 performance.now() 近旁窗）
 *   WIKI_MARKDOWN_SOURCE_LIMIT：133177（zAt `njt(e.markdown, NAt)`）
 *   WIKI_CONTENT_CHUNK_CHAR_LIMIT：133856（域尾累计长度切块）
 *   WIKI_LIST_EXPAND_STEP：133225（zAt 展开步进 +2）
 *   WIKI_NARROW_WIDTH_THRESHOLD_PX：132421（l3 ResizeObserver 窄幅判定）
 *   wikiItemNeverLocked：132958 / 133525（l3 / HAt `isItemLocked: LAt`）
 *
 * ----------------------------------------------------------------------------
 * 三、型缝登记
 * ----------------------------------------------------------------------------
 *   WikiCatalogNode extends WikiPageTreeNode：束真 SAt 三路（catalog/父子林/分组）
 *   归一同器消费（133694 单点取用），目录节点与合成节点同面——id/title/order
 *   按同器登记（catalog 域产出，消费面与合成节点无分支）。
 * ==========================================================================*/

/* ---- 域型面（按簇内消费点归纳） ---- */

/** wiki 页（簇内消费：id/title/order/parentId/filePaths[0]） */
export interface WikiPage {
  id: string;
  title: string;
  order: number;
  parentId?: string | null;
  filePaths: string[];
  [key: string]: unknown;
}

/** 页树节点（wAt/EAt/TAt 产出面；SAt 三路归一面） */
export interface WikiPageTreeNode {
  id: string;
  title: string;
  order: number;
  pageId?: string;
  children?: WikiPageTreeNode[];
}

/** wiki 目录树节点（型缝见头注 §三） */
export interface WikiCatalogNode extends WikiPageTreeNode {
  pageId?: string;
  children?: WikiCatalogNode[];
  [key: string]: unknown;
}

/** resolveWikiPageTree 入参（束真 133694 供面：{ catalogTree?, pages }） */
export interface WikiPageTreeInput {
  catalogTree?: WikiCatalogNode[] | null;
  pages: WikiPage[];
}

/* ---- 域常量（原 c3…LAt var 块，132315-132322，逐值逐字） ---- */

export const WIKI_DEFAULT_MAX_RETRIES = 0; // 原 c3
export const WIKI_MAX_RETRIES_LIMIT = 5; // 原 jAt
export const WIKI_PROGRESS_RECENCY_WINDOW_MS = 1e4; // 原 MAt
export const WIKI_MARKDOWN_SOURCE_LIMIT = 8e3; // 原 NAt
export const WIKI_CONTENT_CHUNK_CHAR_LIMIT = 12e3; // 原 PAt
export const WIKI_LIST_EXPAND_STEP = 2; // 原 FAt
export const WIKI_NARROW_WIDTH_THRESHOLD_PX = 560; // 原 IAt
export const wikiItemNeverLocked = () => false; // 原 LAt

/* ---- 页树合成簇 ---- */

/** 原 SAt（132222）：页树裁决——目录树优先，父子林次之，分组兜底 */
export function resolveWikiPageTree(e: WikiPageTreeInput): WikiPageTreeNode[] {
  if (!e) return [];
  if (e.catalogTree && e.catalogTree.length > 0)
    return pruneCatalogTreeToPages(e.catalogTree, new Set(e.pages.map((e) => e.id)));
  let t = buildPageForest(e.pages);
  return t.length > 0 ? t : groupPagesByProjectName(e.pages);
}

/** 原 CAt（132229）：目录树剪枝——无页且无后代之节点剔除（递归） */
export function pruneCatalogTreeToPages(e: WikiCatalogNode[], t: Set<string>): WikiCatalogNode[] {
  return e
    .map((e) => {
      let n = e.children ? pruneCatalogTreeToPages(e.children, t) : [],
        r = e.pageId && t.has(e.pageId) ? e.pageId : void 0;
      return !r && n.length === 0 ? null : { ...e, pageId: r, children: n.length > 0 ? n : void 0 };
    })
    .filter((e) => e !== null);
}

/** 原 wAt（132238）：按 parentId 建父子林——父缺或无父者不入林，孤儿根按 order 平铺 */
export function buildPageForest(e: WikiPage[]): WikiPageTreeNode[] {
  let t = new Map(e.map((e) => [e.id, e])),
    n = new Map();
  for (let r of e) {
    if (!r.parentId || !t.has(r.parentId)) continue;
    let e = n.get(r.parentId) ?? [];
    (e.push(r), n.set(r.parentId, e));
  }
  if (n.size === 0) return [];
  let r = new Set(
    Array.from(n.values())
      .flat()
      .map((e) => e.id),
  );
  return e
    .filter((e) => !r.has(e.id))
    .sort((e, t) => e.order - t.order)
    .map((e) => mapPageToTreeNode(e, n));
}

/** 原 TAt（132257）：页 → 树节点（子列递归挂载） */
export function mapPageToTreeNode(e: WikiPage, t: Map<string, WikiPage[]>): WikiPageTreeNode {
  let n = (t.get(e.id) ?? []).sort((e, t) => e.order - t.order).map((e) => mapPageToTreeNode(e, t));
  return {
    id: `page-node-${e.id}`,
    title: e.title,
    order: e.order,
    pageId: e.id,
    children: n.length > 0 ? n : void 0,
  };
}

/** 原 EAt（132267）：按派生项目名分组——≤1 组退化为平铺节点列 */
export function groupPagesByProjectName(e: WikiPage[]): WikiPageTreeNode[] {
  let t = new Map<string, WikiPage[]>(); // 〔A1-P2-B8〕型缝：束真裸 new Map()，分组值形按簇内消费登记
  for (let n of e) {
    let e = deriveProjectNameOfPage(n),
      r = t.get(e) ?? [];
    (r.push(n), t.set(e, r));
  }
  if (t.size <= 1)
    return e
      .slice()
      .sort((e, t) => e.order - t.order)
      .map((e) => ({ id: `page-node-${e.id}`, title: e.title, order: e.order, pageId: e.id }));
  let n = 0;
  return Array.from(t.entries()).map(
    ([e, t]) => (
      (n += 1),
      {
        id: `group-${n}-${slugify(e)}`,
        title: e,
        order: n,
        children: t
          .slice()
          .sort((e, t) => e.order - t.order)
          .map((e) => ({ id: `page-node-${e.id}`, title: e.title, order: e.order, pageId: e.id })),
      }
    ),
  );
}

/** 原 DAt（132295）：项目名派生——标题分隔符前缀（≥2 字符）> 路径首段（src 则取次段）> "Wiki" */
export function deriveProjectNameOfPage(e: WikiPage): string {
  let t = e.title.match(/^(.+?)[：:：/／-]/)?.[1]?.trim();
  if (t && t.length >= 2) return t;
  let [n, r] = (e.filePaths[0] ?? ``).replace(/\\/g, `/`).split(`/`);
  return n === `src` && r ? r : n || `Wiki`;
}

/** 原 OAt（132301）：分组 slug */
export function slugify(e: string): string {
  return e.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, `-`);
}

/* ---- 项目裁决簇 ---- */

/** 原 kAt（132304）：入口项目解析 */
export function resolveEntryProjectId(e: {
  entryWorkspaceKey?: string | null;
  projects: Array<{ id: string }>;
}): string | null {
  return e.projects.find((t) => t.id === e.entryWorkspaceKey)?.id ?? e.projects[0]?.id ?? null;
}

/** 原 AAt（132307）：初始项目裁决 */
export function resolveInitialProjectId(e: {
  currentProjectId?: string | null;
  entryWorkspaceKey?: string | null;
  preferEntryProject?: boolean;
  projects: Array<{ id: string }>;
}): string | null {
  let t = resolveEntryProjectId({ entryWorkspaceKey: e.entryWorkspaceKey, projects: e.projects });
  return e.preferEntryProject
    ? t
    : e.currentProjectId && e.projects.some((t) => t.id === e.currentProjectId)
      ? e.currentProjectId
      : t;
}
