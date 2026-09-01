// A1-P1-B7：R0 ConversationPane 簇运行时绑定域（draft-prewarm）逐字转录。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 映射表（minified → 语义名 → bundle 行）：
//   sWe → isThenable                      53869–53871（cWe 内消费）
//   cWe → runDraftPrewarm                 53872–53951（lWe startCurrent 消费）
//   lWe → DraftPrewarmBindingController   53952–54076（class；订阅/现行绑定/失效版本/清理计时器）
//   oN → transportBindingRegistries       54077（lWe 同声明链；transportIdentity → 面板键 → 控制器）
//   uWe → paneBindingKey                  54078–54080（dWe 消费）
//   dWe → getOrCreateBindingController    54081–54100（fWe 消费）
//   fWe → useRuntimeModelBinding          54101–54142（R0 119804 消费；PaneCore declare 群收敛）
// 域内依赖仅 J→logger（SkillStore）/ Q→React；markPromotion* 族为 dispatch 回执对象方法面（消费侧型面）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝带〔A1-P1-B7〕注释。
// 环安全：本叶 import react（库叶）/ modules/SkillStore（store 叶，仅取 logger）；
//   ConversationPaneCore 单向消费本叶。
/* eslint-disable */
import * as React from 'react'; // 原 Q（styles Q←react）
import { logger } from '../../modules/SkillStore'; // 原 J（styles J←skillStore logger）

/* ── 〔A1-P1-B7〕运行时绑定域（styles 53869–54142，274 行逐字；fWe useRuntimeModelBinding 真身 +
 *    cWe/lWe/oN draft-prewarm 控制器族 + sWe/uWe/dWe 卫星）。
 *    映射：sWe→isThenable | cWe→runDraftPrewarm | lWe→DraftPrewarmBindingController | oN→transportBindingRegistries
 *          uWe→paneBindingKey | dWe→getOrCreateBindingController | fWe→useRuntimeModelBinding | J→logger | Q→React。
 *    逐字证明：/tmp/a1r0-p1/r7f-roundtrip.js（R7F ROUNDTRIP EXACT 274 lines）。型缝：见 r7f-seam-log.txt。 ── */
export function isThenable(e: any) {
  return !!(e && typeof e == `object` && `then` in e && typeof e.then == `function`);
}
export function runDraftPrewarm(e: any) {
  let {
      workspaceKey: t,
      dispatchCommand: n,
      onReady: r,
      onSettled: i,
      resolveInitialConfig: a,
      resolveInitialRuntimeModel: o,
    } = e,
    s = !1,
    c = `draft`,
    l: any = null,
    u = (e: any) => {
      n(`deleteSession`, {}, e)
        .then((t: any) => {
          t.status !== `accepted` &&
            t.status !== `noop` &&
            logger.warn(`[v4-draft-prewarm] 清理预热会话被拒`, {
              sessionId: e,
              status: t.status,
              reasonCode: t.reasonCode ?? null,
            });
        })
        .catch(() => {});
    },
    d = (e: any) => {
      let n: any = { workspaceId: t },
        r = a?.();
      return (r && Object.keys(r).length > 0 && (n.config = r), e && (n.runtimeModel = e), n);
    },
    f = (e: any) => {
      let t = d(e);
      return s ? Promise.resolve(null) : n(`createSession`, t, null);
    },
    p = o?.();
  return (
    (isThenable(p) ? p.then((e: any) => f(e)) : f(p))
      .then((e: any) => {
        if (e) {
          if (e.status !== `accepted` || e.result?.type !== `createSession`) {
            logger.warn(`[v4-draft-prewarm] createSession 被拒，回落无预热路径`, {
              status: e.status,
              reasonCode: e.reasonCode ?? null,
              workspaceKey: t,
            });
            return;
          }
          if (((l = e.result.sessionId), s)) {
            u(l);
            return;
          }
          (logger.info(`[v4-draft-prewarm] draft session 预热就绪`, { sessionId: l, workspaceKey: t }),
            r(l));
        }
      })
      .catch((e: any) => {
        logger.warn(`[v4-draft-prewarm] createSession 失败，回落无预热路径`, {
          error: e instanceof Error ? e.message : String(e),
          workspaceKey: t,
        });
      })
      .finally(() => {
        i?.();
      }),
    {
      markPromotionPending() {
        c === `draft` && (c = `pending`);
      },
      markPromoted() {
        c = `promoted`;
      },
      markDiscarded() {
        c !== `promoted` && (c = `discarded`);
      },
      dispose() {
        s || ((s = !0), l && c === `draft` && u(l));
      },
    }
  );
}
export const DraftPrewarmBindingController = class {
    subscribers = new Map();
    current: any = null;
    blockedInvalidationVersion = null;
    cleanupTimer: any = null;
    dispatchCommand;
    resolveInitialConfig;
    resolveInitialRuntimeModel;
    workspaceKey;
    onEmpty;
    constructor(e: any, t: any, n: any, r: any, i: any) {
      ((this.workspaceKey = e),
        (this.onEmpty = i),
        (this.dispatchCommand = t),
        (this.resolveInitialConfig = n),
        (this.resolveInitialRuntimeModel = r));
    }
    update(e: any, t: any, n: any) {
      ((this.dispatchCommand = e),
        (this.resolveInitialConfig = t),
        (this.resolveInitialRuntimeModel = n));
    }
    acquire(e: any) {
      this.cleanupTimer !== null && (clearTimeout(this.cleanupTimer), (this.cleanupTimer = null));
      let t = Symbol(`draft-prewarm-subscriber`);
      return (
        this.subscribers.set(t, e),
        this.reconcile(),
        this.emitBindingTo(e),
        () => {
          !this.subscribers.delete(t) ||
            this.subscribers.size > 0 ||
            (this.cleanupTimer = setTimeout(() => {
              ((this.cleanupTimer = null),
                !(this.subscribers.size > 0) &&
                  (this.retireCurrent(), this.current || this.onEmpty()));
            }, 0));
        }
      );
    }
    requestedInvalidationVersion() {
      let e = null;
      for (let t of this.subscribers.values())
        e = e === null ? t.invalidationVersion : Math.max(e, t.invalidationVersion);
      return e;
    }
    reconcile() {
      let e = this.requestedInvalidationVersion();
      e !== null &&
        (this.blockedInvalidationVersion !== null &&
          this.blockedInvalidationVersion !== e &&
          (this.blockedInvalidationVersion = null),
        !(
          this.current &&
          ((!this.current.retiring && this.current.invalidationVersion === e) ||
            (this.retireCurrent(), this.current))
        ) &&
          this.blockedInvalidationVersion !== e &&
          this.startCurrent(e));
    }
    startCurrent(e: any) {
      let t: any;
      ((t = {
        invalidationVersion: e,
        controller: runDraftPrewarm({
          workspaceKey: this.workspaceKey,
          dispatchCommand: (e: any, t: any, n: any) => this.dispatchCommand(e, t, n),
          resolveInitialConfig: () => this.resolveInitialConfig?.(),
          resolveInitialRuntimeModel: () => this.resolveInitialRuntimeModel?.(),
          onReady: (e: any) => {
            if (this.current !== t || t.retiring) return;
            let n: any;
            ((n = {
              workspaceKey: this.workspaceKey,
              sessionId: e,
              beginPromotion: () =>
                this.current !== t || t.binding !== n
                  ? !1
                  : (t.controller.markPromotionPending(), !0),
              promote: () => {
                this.current !== t || t.binding !== n || t.controller.markPromoted();
              },
              discard: () => {
                this.current !== t ||
                  t.binding !== n ||
                  (t.controller.markDiscarded(),
                  (t.binding = null),
                  (this.blockedInvalidationVersion = t.invalidationVersion),
                  this.emitBindings());
              },
            }),
              (t.binding = n),
              this.emitBindings());
          },
          onSettled: () => {
            ((t.settled = !0),
              !(this.current !== t || !t.retiring) &&
                ((this.current = null),
                this.subscribers.size > 0 ? this.reconcile() : this.onEmpty()));
          },
        }),
        binding: null,
        settled: !1,
        retiring: !1,
      }),
        (this.current = t));
    }
    retireCurrent() {
      let e = this.current;
      !e ||
        e.retiring ||
        ((e.retiring = !0),
        (e.binding = null),
        e.controller.dispose(),
        this.emitBindings(),
        e.settled && (this.current = null));
    }
    emitBindings() {
      for (let e of this.subscribers.values()) this.emitBindingTo(e);
    }
    emitBindingTo(e: any) {
      let t = this.current;
      e.onBinding(
        t && !t.retiring && t.invalidationVersion === e.invalidationVersion ? t.binding : null,
      );
    }
  },
  transportBindingRegistries = new Map();
export function paneBindingKey(e: any, t: any) {
  return JSON.stringify([e, t]);
}
export function getOrCreateBindingController(e: any) {
  let t = transportBindingRegistries.get(e.transportIdentity);
  t || ((t = new Map()), transportBindingRegistries.set(e.transportIdentity, t));
  let n = paneBindingKey(e.workspaceKey, e.paneId),
    r = t.get(n);
  return (
    r ||
      ((r = new DraftPrewarmBindingController(
        e.workspaceKey,
        e.dispatchCommand,
        e.resolveInitialConfig,
        e.resolveInitialRuntimeModel,
        () => {
          t?.get(n) === r && (t.delete(n), t.size === 0 && transportBindingRegistries.delete(e.transportIdentity));
        },
      )),
      t.set(n, r)),
    r
  );
}
export function useRuntimeModelBinding(e: any) {
  let {
      enabled: t,
      workspaceKey: n,
      paneId: r,
      transportIdentity: i,
      invalidationVersion: a = 0,
      dispatchCommand: o,
      resolveInitialConfig: s,
      resolveInitialRuntimeModel: c,
    } = e,
    l = (0, React.useMemo)(() => ({ workspaceKey: n, paneId: r, transportIdentity: i }), [r, i, n]),
    u = (0, React.useMemo)(
      () =>
        getOrCreateBindingController({
          workspaceKey: n,
          paneId: r,
          transportIdentity: i,
          dispatchCommand: o,
          resolveInitialConfig: s,
          resolveInitialRuntimeModel: c,
        }),
      [l],
    );
  (0, React.useLayoutEffect)(() => {
    u.update(o, s, c);
  }, [u, o, s, c]);
  let d = (0, React.useMemo)(() => ({ owner: l }), [t, a, l]),
    [f, p] = (0, React.useState)<any>(null);
  return (
    (0, React.useEffect)(() => {
      if (t)
        return u.acquire({
          invalidationVersion: a,
          onBinding: (e: any) => {
            p((t: any) => (e ? { generation: d, binding: e } : t?.generation === d ? null : t));
          },
        });
    }, [u, t, d, a]),
    { binding: f?.generation === d ? f.binding : null }
  );
}
