import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Dialog } from "../../ui/dialog.tsx";
import { Btn } from "../../ui/primitives.tsx";
import { tr } from "../../ui/i18n.ts";
type FormState = { dirty: boolean; busy: boolean };
type Guard = { register: (key: object, state: FormState | null) => void; request: (action: () => void) => void };
const Context = createContext<Guard>({ register: () => {}, request: action => action() });
export function SettingsExitGuard({ children }: { children: ReactNode }) {
  const forms = useRef(new Map<object, FormState>());
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [blocked, setBlocked] = useState(false);
  const register = useCallback((key: object, state: FormState | null) => { if (state) forms.current.set(key, state); else forms.current.delete(key); }, []);
  const request = useCallback((action: () => void) => {
    if ([...forms.current.values()].some(form => form.busy)) { setBlocked(true); return; }
    if ([...forms.current.values()].some(form => form.dirty)) { setPending(() => action); return; }
    action();
  }, []);
  const context = useMemo(() => ({ register, request }), [register, request]);
  return <Context.Provider value={context}>{children}
    <Dialog open={pending !== null} title={tr("未保存的修改")} onClose={() => setPending(null)} footer={<><Btn onClick={() => setPending(null)}>{tr("继续编辑")}</Btn><Btn variant="danger" onClick={() => { if ([...forms.current.values()].some(form => form.busy)) return; const action = pending; setPending(null); action?.(); }}>{tr("放弃修改并离开")}</Btn></>}><p>{tr("离开将丢弃当前表单中未保存的修改。")}</p></Dialog>
    <Dialog open={blocked} title={tr("正在保存设置")} onClose={() => setBlocked(false)} footer={<Btn onClick={() => setBlocked(false)}>{tr("继续编辑")}</Btn>}><p>{tr("请等待当前操作结束后再切换或退出设置。")}</p></Dialog>
  </Context.Provider>;
}
export function useSettingsExit() { return useContext(Context).request; }
export function useSettingsForm(dirty: boolean, busy: boolean) {
  const { register } = useContext(Context);
  const key = useRef({});
  useLayoutEffect(() => { register(key.current, { dirty, busy }); return () => register(key.current, null); }, [register, dirty, busy]);
}
