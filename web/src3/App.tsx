import React, { useEffect, useState } from "react";
import "./zc/tokens.css";
import "./zc/app.css";
import { I } from "./zc/icons";
import { Sidebar } from "./zc/Sidebar";
import type { Task } from "./zc/data";

/* §13.3 S6 WindowsCaptionMenuButton 菜单项 */
const WIN_MENU = [
  "新建任务  ⌘N", "打开工作区  ⌘O", "在文件管理器中打开", "sep",
  "关于", "检查更新", "进程监视器", "sep",
  "问题反馈", "产品建议", "用户社群", "产品文档", "导出日志", "sep",
  "DevTools", "关闭窗口",
];

export default function App() {
  const [sidebar, setSidebar] = useState(true);
  const [active, setActive] = useState<Task | null>({ id: "r1", title: "RTAgent-SDK R55 eval and R54 comparison" });
  const [winMenu, setWinMenu] = useState(false);
  const [term, setTerm] = useState(false);
  useEffect(() => {
    const close = () => setWinMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="zc-shell">
      {/* 顶栏覆盖层（shell 级，悬于侧栏列上方；§3/§13.1） */}
      <div className={"zc-topbar" + (sidebar ? " sbw" : "")}>
        <button className="zc-ib" title="切换侧栏" onClick={() => setSidebar(s => !s)}>
          <I n="logo" s={16} />
        </button>
        <button className="zc-ib" disabled><I n="left" s={16} /></button>
        <button className="zc-ib"><I n="right" s={16} /></button>
        {!sidebar && <button className="zc-ib" title="新建任务"><I n="plus" s={16} /></button>}
      </div>
      {sidebar && <Sidebar active={active?.id ?? ""} onPick={t => setActive(t)} />}
      <main className="zc-main">
        {/* 会话头行（§13.5）：标题+chips ｜ 右簇 H6终端 + S6窗口菜单 */}
        <div className="zc-sesshead">
          <h1>{active?.title ?? ""}</h1>
          <button className="zc-chip"><I n="folder" s={13} /> rtagent</button>
          <button className="zc-chip"><I n="branch" s={13} /> dev <I n="chevD" s={12} /></button>
          <button className="zc-ib"><I n="dots" s={16} /></button>
          <span className="sp" />
          <button className="zc-ib" title="终端 ⌘J" style={term ? { background: "var(--selected)" } : undefined}
            onClick={() => setTerm(t => !t)}><I n="terminal" s={15} /></button>
          <div style={{ position: "relative", alignSelf: "stretch", display: "flex" }}>
            <button className="zc-winmenu" onClick={e => { e.stopPropagation(); setWinMenu(v => !v); }}>
              <I n="chevD" s={14} />
            </button>
            {winMenu && (
              <div className="zc-ctx" style={{ right: 0, top: "100%" }} onClick={e => e.stopPropagation()}>
                {WIN_MENU.map((m, i) => m === "sep" ? <div key={i} className="sep" /> :
                  <button key={i} className="row">{m}</button>)}
              </div>
            )}
          </div>
        </div>

        {/* 会话流（Z3） */}
        <div className="zc-body">
          <div style={{ padding: "16px 24px", color: "var(--fg-subtlest)", fontSize: 12.5 }}>
            会话流 · Z3 阶段实现（turnHeader 轮级动作 / 工具折叠块 / Git 浮卡）
          </div>
        </div>
      </main>
    </div>
  );
}
