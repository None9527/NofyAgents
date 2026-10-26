import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { loadGeneralPrefs, saveGeneralPrefs, subscribeGeneralPrefs } from "../../ui/generalPrefs.ts";
import type { GeneralPrefs } from "../../ui/generalPrefs.ts";
import { setLocale, tr } from "../../ui/i18n.ts";
import type { Locale } from "../../ui/i18n.ts";

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return <button type="button" className={"set__themebtn" + (on ? " set__themebtn--on" : "")} aria-pressed={on} aria-label={label} onClick={onClick}>{on ? tr("开") : tr("关")}</button>;
}

function Row({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) {
  return <div className="set__row"><div className="set__rowmain"><span className="set__rowname">{title}</span>{detail ? <span className="set__rowdesc">{detail}</span> : null}</div>{children}</div>;
}

export function GeneralSettings({ locale }: { locale: Locale }) {
  const prefs = useSyncExternalStore(subscribeGeneralPrefs, loadGeneralPrefs, loadGeneralPrefs);
  const patch = (next: Partial<GeneralPrefs>) => { saveGeneralPrefs(next); };
  const knownShell = prefs.terminalShell === "" || prefs.terminalShell === "/bin/zsh" || prefs.terminalShell === "/bin/bash";
  return <>
    <section className="set__block">
      <h3 className="set__subhead">{tr("界面语言")}</h3>
      <div className="set__themes" role="group" aria-label={tr("界面语言")}>
        <button type="button" className={"set__themebtn" + (locale === "zh-CN" ? " set__themebtn--on" : "")} aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>中文</button>
        <button type="button" className={"set__themebtn" + (locale === "en" ? " set__themebtn--on" : "")} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>English</button>
      </div>
    </section>
    <section className="set__block">
      <h3 className="set__subhead">{tr("终端")}</h3>
      <div className="set__rows">
        <Row title={tr("终端程序")} detail={tr("留空跟随系统登录 shell。指定程序后，新建终端按该程序启动。")}>
          <select aria-label={tr("终端程序")} value={knownShell ? prefs.terminalShell : "custom"} onChange={event => { const value = event.currentTarget.value; if (value !== "custom") patch({ terminalShell: value }); }}>
            <option value="">{tr("跟随系统")}</option>
            <option value="/bin/zsh">zsh</option>
            <option value="/bin/bash">bash</option>
            <option value="custom">{tr("自定义")}</option>
          </select>
          <input aria-label={tr("自定义终端程序")} defaultValue={prefs.terminalShell} key={prefs.terminalShell} placeholder="/opt/homebrew/bin/fish" onBlur={event => patch({ terminalShell: event.currentTarget.value })} />
        </Row>
        <Row title={tr("终端字体")} detail={tr("留空使用默认等宽字体。已打开的终端会换字体。")}>
          <input aria-label={tr("终端字体")} value={prefs.terminalFont} placeholder="SF Mono, Menlo, monospace" onChange={event => patch({ terminalFont: event.currentTarget.value })} />
        </Row>
      </div>
    </section>
    <section className="set__block">
      <h3 className="set__subhead">{tr("对话")}</h3>
      <div className="set__rows">
        <Row title={tr("显示思考过程")} detail={tr("关掉后，回答里的思考块不再出现。")}>
          <Toggle label={tr("显示思考过程")} on={prefs.showThoughts} onClick={() => patch({ showThoughts: !prefs.showThoughts })} />
        </Row>
        <Row title={tr("回合结束时通知")} detail={tr("窗口在后台时，回合结束弹出系统通知。")}>
          <Toggle label={tr("回合结束时通知")} on={prefs.notifyDone} onClick={() => {
            const next = !prefs.notifyDone;
            patch({ notifyDone: next });
            const Notify = (globalThis as { Notification?: { permission: string; requestPermission: () => Promise<string> } }).Notification;
            if (next && Notify?.permission === "default") void Notify.requestPermission();
          }} />
        </Row>
        <Row title={tr("通知声音")} detail={tr("通知发出时播放系统提示音。")}>
          <Toggle label={tr("通知声音")} on={prefs.notifySound} onClick={() => patch({ notifySound: !prefs.notifySound })} />
        </Row>
      </div>
    </section>
    <section className="set__block">
      <h3 className="set__subhead">{tr("系统")}</h3>
      <div className="set__rows">
        <Row title={tr("运行时阻止休眠")} detail={tr("有回合在跑时阻止这台电脑休眠。")}>
          <Toggle label={tr("运行时阻止休眠")} on={prefs.keepAwake} onClick={() => patch({ keepAwake: !prefs.keepAwake })} />
        </Row>
        <Row title={tr("内置浏览器代理")} detail={tr("立即用于内置浏览器。内核出站要等下次启动应用。")}>
          <input aria-label={tr("内置浏览器代理")} value={prefs.httpProxy} placeholder="http://127.0.0.1:7890" onChange={event => patch({ httpProxy: event.currentTarget.value })} />
        </Row>
        <Row title={tr("不走代理")} detail={tr("逗号分隔的主机，内置浏览器会直接连接。")}>
          <input aria-label={tr("不走代理")} value={prefs.noProxy} placeholder="localhost,127.0.0.1" onChange={event => patch({ noProxy: event.currentTarget.value })} />
        </Row>
      </div>
    </section>
  </>;
}
