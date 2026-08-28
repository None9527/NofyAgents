import React, { useEffect, useRef, useState } from "react";
import { I, Spinner } from "./icons";
import { PROJECTS, UNREAD, type Task } from "./data";

/* §4 任务行上下文菜单（dzt） */
const CTX: (string | "sep")[] = [
  "移动到分组 ▸", "置顶", "重命名", "归档", "标记未读", "sep",
  "在文件管理器打开", "复制路径", "复制任务路径", "复制日志路径", "复制JSONL路径", "复制会话ID", "sep",
  "打开方式 ▸",
];

export function Sidebar({ active, onPick }: { active: string; onPick: (t: Task) => void }) {
  const [seg, setSeg] = useState<"group" | "proj">("proj");
  const [ctx, setCtx] = useState<{ x: number; y: number; t: Task } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener("click", close);
    window.addEventListener("blur", close);
    return () => { window.removeEventListener("click", close); window.removeEventListener("blur", close); };
  }, []);

  return (
    <aside className="zc-side">
      <div className="zc-nav">
        <button className="zc-navrow"><I n="plus" /> 新建任务 <span className="zc-k">⌘N</span></button>
        <button className="zc-navrow"><I n="search" /> 搜索 <span className="zc-k">⌘K</span></button>
        <button className="zc-navrow"><I n="bot" /> 自动化</button>
        <button className="zc-navrow"><I n="grid" /> 插件市场</button>
      </div>

      <div className="zc-segrow">
        <div className="zc-seg">
          <button className={seg === "group" ? "on" : ""} onClick={() => setSeg("group")}><I n="grid" s={12}/> 分组</button>
          <button className={seg === "proj" ? "on" : ""} onClick={() => setSeg("proj")}><I n="folder" s={12}/> 项目</button>
        </div>
        <span className="zc-seg-ic"><button className="zc-ib"><I n="filter" s={14}/></button><button className="zc-ib"><I n="archive" s={14}/></button></span>
      </div>

      <div className="zc-projhead">项目 <I n="chevD" s={12}/> <span className="sp"/><button className="zc-ib"><I n="copy" s={13}/></button><button className="zc-ib"><I n="plus" s={13}/></button></div>

      <div className="zc-list">
        {PROJECTS.map(p => (
          <React.Fragment key={p.id}>
            <div className="zc-proj">
              {p.running ? <Spinner s={13}/> : <I n="chevR" s={13} className="zc-dim"/>}
              <I n="folder" s={14} className="zc-dim"/> {p.name}
            </div>
            {p.tasks.map(t => (
              <div key={t.id}
                className={"zc-task" + (active === t.id ? " on" : "")}
                onClick={() => onPick(t)}
                onContextMenu={e => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, t }); }}>
                <span className="t">{t.title}</span>
                {UNREAD.has(t.id) && <span className="dot ok"/>}
                {t.age && <span className="age">{t.age}</span>}
              </div>
            ))}
            {p.more && <div className="zc-more">显示更多</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="zc-sidefoot">
        <span className="av">T</span> tgtieedo
        <span className="sp"/>
        <button className="zc-ib" style={{ color: "var(--term-yellow)" }}><I n="clipboard" s={15}/></button>
        <button className="zc-ib"><I n="gear" s={15}/></button>
      </div>

      {ctx && (
        <div ref={ref} className="zc-ctx" style={{ left: Math.min(ctx.x, innerWidth - 220), top: Math.min(ctx.y, innerHeight - CTX.length * 30 - 16) }}>
          {CTX.map((m, i) => m === "sep" ? <div key={i} className="sep"/> :
            <button key={i} className="row">{m}</button>)}
        </div>
      )}
    </aside>
  );
}
