/**
 * 布局键的编解码门禁。
 *
 * 布局值是**手写的字符串编码**（"sidebar-open|aux-closed|w=264|v=projects|s=recent"），
 * 抄 ZCode persistentLayoutKey 的思路：一个键记一整组、值可手改。手写编码的失败模式是
 * 「升级后旧值读不出来 ⇒ 用户调好的侧栏宽度/开合态静默回默认」，这类回归在界面上
 * 看起来像「应用忘了我的设置」，很难归因，所以用测试钉住向后兼容。
 *
 * prefs.ts 住在 ui/ 是因为它要碰 localStorage（dep-guard 只给 ui/ 这个豁免）。
 * 测试里给它装一个假 window —— 只装 localStorage 这一件，别的一律不模拟。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  AUX_WIDTH_DEFAULT,
  DOCK_HEIGHT_DEFAULT,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  loadLayout,
  saveLayout,
} from "../renderer/ui/prefs.ts";
import type { LayoutPrefs } from "../renderer/ui/prefs.ts";

const KEY = "nofy-desktop:layout";

type Fake = { store: Record<string, string>; restore: () => void };

function fakeWindow(initial: Record<string, string>, opts: { throwOnSet?: boolean } = {}): Fake {
  const store: Record<string, string> = { ...initial };
  const g = globalThis as Record<string, unknown>;
  const prev = g["window"];
  g["window"] = {
    localStorage: {
      getItem: (k: string): string | null => (Object.hasOwn(store, k) ? (store[k] ?? null) : null),
      setItem: (k: string, v: string): void => {
        if (opts.throwOnSet === true) throw new Error("QuotaExceededError（模拟）");
        store[k] = String(v);
      },
      removeItem: (k: string): void => {
        delete store[k];
      },
    },
  };
  return {
    store,
    restore: () => {
      g["window"] = prev;
    },
  };
}

const FULL: LayoutPrefs = {
  sidebarOpen: false,
  auxOpen: true,
  sidebarWidth: 320,
  view: "grouped",
  sort: "title",
  dockOpen: true,
  projectOrder: [],
  auxWidth: AUX_WIDTH_DEFAULT,
  auxSizing: "auto",
  auxExpanded: false,
  dockHeight: DOCK_HEIGHT_DEFAULT,
};

test("往返：写进去再读出来，六个字段一个不差", () => {
  const f = fakeWindow({});
  try {
    saveLayout(FULL);
    assert.equal(f.store[KEY], "sidebar-closed|aux-open|w=320|v=grouped|s=title|dock-open|as=auto", "值要能手读手改");
    assert.deepEqual(loadLayout(), FULL);
  } finally {
    f.restore();
  }
});

test("向后兼容：升级前的旧值（没有 v=/s=/dock 段）旧窄栏折叠，新字段落默认", () => {
  const f = fakeWindow({ [KEY]: "sidebar-open|aux-closed|w=232" });
  try {
    assert.deepEqual(loadLayout(), {
      sidebarOpen: false,
      auxOpen: false,
      sidebarWidth: SIDEBAR_WIDTH_MIN,
      view: "projects",
      sort: "recent",
      // 旧版本没有 dock ⇒ 默认收起（默认展开会让升级后的用户凭空多出一条面板）
      dockOpen: false,
      projectOrder: [],
      auxWidth: AUX_WIDTH_DEFAULT,
  auxSizing: "auto",
      auxExpanded: false,
      dockHeight: DOCK_HEIGHT_DEFAULT,
    });
  } finally {
    f.restore();
  }
});

test("更早的旧值（只有 aux-open/aux-closed）也读得出来：缺 sidebar 段视为开", () => {
  const f = fakeWindow({ [KEY]: "aux-open" });
  try {
    const got = loadLayout();
    assert.equal(got.sidebarOpen, true);
    assert.equal(got.auxOpen, true);
    assert.equal(got.sidebarWidth, SIDEBAR_WIDTH_DEFAULT);
    assert.equal(got.dockOpen, false);
  } finally {
    f.restore();
  }
});

test("宽度夹到 240–480，过窄旧偏好直接折叠（手改值/坏值都不能把侧栏拖成 0 或盖住主列）", () => {
  const wide = fakeWindow({ [KEY]: "sidebar-open|aux-open|w=9999" });
  try {
    assert.equal(loadLayout().sidebarWidth, SIDEBAR_WIDTH_MAX);
  } finally {
    wide.restore();
  }
  const thin = fakeWindow({ [KEY]: "sidebar-open|aux-open|w=3" });
  try {
    assert.equal(loadLayout().sidebarWidth, SIDEBAR_WIDTH_MIN);
    assert.equal(loadLayout().sidebarOpen, false);
  } finally {
    thin.restore();
  }
  const nan = fakeWindow({ [KEY]: "sidebar-open|aux-open|w=abc" });
  try {
    assert.equal(loadLayout().sidebarWidth, SIDEBAR_WIDTH_DEFAULT);
  } finally {
    nan.restore();
  }
});

test("projectOrder 往返：cwd 含逗号/竖线也不破编码；旧值无 po= 段 ⇒ []", () => {
  const f = fakeWindow({});
  try {
    saveLayout({ ...FULL, projectOrder: ["/x,y", "/z|w"] });
    assert.deepEqual(loadLayout().projectOrder, ["/x,y", "/z|w"]);
  } finally {
    f.restore();
  }
  const legacy = fakeWindow({ [KEY]: "sidebar-open|aux-open|w=264|v=projects|s=recent|dock-closed" });
  try {
    assert.deepEqual(loadLayout().projectOrder, [], "升级前的布局键没有 po= 段 ⇒ 空序（默认序）");
  } finally {
    legacy.restore();
  }
});

test("auxWidth 往返：非默认写 a= 段并 clamp；旧键无 a= 段 ⇒ 默认", () => {
  const f = fakeWindow({});
  try {
    saveLayout({ ...FULL, auxWidth: 640, auxSizing:"fixed" });
    assert.equal(loadLayout().auxWidth, 640);
    saveLayout({ ...FULL, auxWidth: 5 });
    assert.equal(loadLayout().auxWidth, 320, "下限 clamp");
  } finally {
    f.restore();
  }
  const legacy = fakeWindow({ [KEY]: "sidebar-open|aux-open|w=264|v=projects|s=recent|dock-closed" });
  try {
    assert.equal(loadLayout().auxWidth, AUX_WIDTH_DEFAULT);
  } finally {
    legacy.restore();
  }
});

test("没有存储（隐私模式 / 配额满）时不炸：读写都退回默认", () => {
  const f = fakeWindow({}, { throwOnSet: true });
  try {
    assert.doesNotThrow(() => saveLayout(FULL));
    assert.deepEqual(loadLayout(), {
      sidebarOpen: true,
      auxOpen: true,
      sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
      view: "projects",
      sort: "recent",
      dockOpen: false,
      projectOrder: [],
      auxWidth: AUX_WIDTH_DEFAULT,
  auxSizing: "auto",
      auxExpanded: false,
      dockHeight: DOCK_HEIGHT_DEFAULT,
    });
  } finally {
    f.restore();
  }
});

test("右侧栏全屏只在 ax=full 时记住，旧键保持分屏", () => {
  const f = fakeWindow({});
  try {
    saveLayout({ ...FULL, auxExpanded: true });
    const expanded = f.store[KEY] ?? "";
    assert.equal(expanded.endsWith("|ax=full"), true);
    assert.equal(loadLayout().auxExpanded, true);
    assert.equal(loadLayout().auxWidth, AUX_WIDTH_DEFAULT);
    saveLayout({ ...FULL, auxExpanded: false });
    assert.equal((f.store[KEY] ?? "").includes("ax=full"), false);
  } finally {
    f.restore();
  }
});

test("panel sizing intent survives reload including fixed default width and legacy values",()=>{
  const f=fakeWindow({[KEY]:"sidebar-open|aux-open|a=640"});
  try {
    assert.equal(loadLayout().auxSizing,"fixed");
    saveLayout({...FULL,auxWidth:548,auxSizing:"fixed"});
    assert.equal(loadLayout().auxSizing,"fixed");
    saveLayout({...FULL,auxWidth:640,auxSizing:"auto"});
    assert.equal(loadLayout().auxSizing,"auto");
    assert.equal(loadLayout().auxWidth,640);
  } finally {f.restore();}
});
