/**
 * 〔A1-P1-B5〕命令协议族真身（styles-CdEGpc2x.js 115625–115963 + 118700–118734，374 行逐字；R0 簇命令族属主收敛）。
 *
 * 映射（混淆 → 语义 → styles js 行）：
 *   Gbt→STALE_PROTOCOL_REASON_CODES 115625 | Kbt→staleProtocolReasonOf 115626 | z1→isStaleProtocolAck 115634
 *   B1→CONFIG_COMMAND_SUPERSEDED 115637 | qbt→createSerialQueue 115638 | Jbt→createSupersedingCommandScheduler 115656
 *   Ybt→COMMAND_ACK_E2E_LIMIT 115684 | V1→recordCommandAckE2E 115685 | Xbt→PENDING_COMMAND_TTL_MS 115697
 *   H1→PENDING_COMMAND_STORAGE_KEY 115698 | Zbt→safeLocalStorage 115699 | U1→pendingCommandKey 115700
 *   W1→deepCloneJson 115703 | G1→canonicalJson 115706 | Qbt→fnv1a32Digest 115713 | $bt→isPersistedPendingCommand 115720
 *   ext→commandReplayOf 115731 | txt→isDiscardedOnRestartQueueDisposition 115745 | K1→pendingCommandLedger 115758–115963（class 单例）
 *   ECt→recoverableWorkspaceOf 118700 | DCt→matchesRecoverableWorkspace 118706 | OCt→useRecoverablePendingCommands 118710–118734
 *   Q→React | J→logger（modules/SkillStore）
 *
 * 环安全：运行期边 = react + modules/SkillStore(logger)；不引 conversation 域 → 单向 DAG。
 * 消费面：ConversationPaneCore（R0 七符：B1/z1/qbt/Jbt/V1/K1/OCt）；ConversationInteractionsOverlay 族留批改指。
 * 逐字证明：/tmp/a1r0-p1/r5-roundtrip.js（逆改名+缝逆归一 ≡ bundle 双段）。
 * 型缝：S16 位置驱动 : any；class 域缝（storage/now 成员、构造参）见 r5-seam-log.txt；var→const 树风格缝。
 */
import * as React from 'react';
import { logger } from '../../modules/SkillStore';

export const STALE_PROTOCOL_REASON_CODES = new Set([`proto.staleLogEpoch`, `proto.staleRevision`, `proto.staleTarget`]);
export function staleProtocolReasonOf(e: any) {
  if (e instanceof Error) return e.message;
  if (typeof e == `string`) return e;
  if (!e || typeof e != `object` || Array.isArray(e)) return;
  let t = e;
  if (!(t.status !== void 0 && t.status !== `stale`))
    return typeof t.reasonCode == `string` ? t.reasonCode : void 0;
}
export function isStaleProtocolAck(e: any) {
  return STALE_PROTOCOL_REASON_CODES.has(staleProtocolReasonOf(e) ?? ``);
}
export const CONFIG_COMMAND_SUPERSEDED = Symbol(`config-command-superseded`);
export function createSerialQueue() {
  let e = Promise.resolve();
  return {
    enqueue(t: any) {
      let n: Promise<any> = e.then(t, t);
      return (
        (e = n.then(
          () => void 0,
          () => void 0,
        )),
        n
      );
    },
    wait() {
      return e;
    },
  };
}
export function createSupersedingCommandScheduler(e: any) {
  let t: any = null;
  return {
    schedule(n: any) {
      return new Promise((r, i) => {
        if (t) {
          (t.waiter.resolve(CONFIG_COMMAND_SUPERSEDED), (t.command = n), (t.waiter = { reject: i, resolve: r }));
          return;
        }
        let a = { command: n, waiter: { reject: i, resolve: r } };
        ((t = a),
          e.enqueue(async () => {
            t === a && (t = null);
            let e = a.command,
              n = a.waiter;
            try {
              n.resolve(await e());
            } catch (e) {
              n.reject(e);
            }
          }));
      });
    },
    seal() {
      t = null;
    },
  };
}
export const COMMAND_ACK_E2E_LIMIT = 50;
export function recordCommandAckE2E(e: any) {
  if (typeof window > `u`) return;
  let t = window,
    n = ((t as any).__zcodeV4CommandAcksE2E ??= []);
  (n.push(e), n.length > COMMAND_ACK_E2E_LIMIT && n.splice(0, n.length - COMMAND_ACK_E2E_LIMIT));
}
export const PENDING_COMMAND_TTL_MS = 1440 * 60 * 1e3,
  PENDING_COMMAND_STORAGE_KEY = `zcode-v4-pending-commands:v1`;
export function safeLocalStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return;
  }
}
export function pendingCommandKey(e: any, t: any) {
  return `${e ?? `<global>`}\u0000${t}`;
}
export function deepCloneJson(e: any) {
  return JSON.parse(JSON.stringify(e));
}
export function canonicalJson(e: any): any {
  return Array.isArray(e)
    ? `[${e.map(canonicalJson).join(`,`)}]`
    : e && typeof e == `object`
      ? `{${Object.entries(e)
          .sort(([e], [t]) => e.localeCompare(t))
          .map(([e, t]) => `${JSON.stringify(e)}:${canonicalJson(t)}`)
          .join(`,`)}}`
      : JSON.stringify(e);
}
export function fnv1a32Digest(e: any) {
  let t = canonicalJson(e),
    n = 2166136261;
  for (let e = 0; e < t.length; e += 1) ((n ^= t.charCodeAt(e)), (n = Math.imul(n, 16777619)));
  return `fnv1a32:${(n >>> 0).toString(16).padStart(8, `0`)}`;
}
export function isPersistedPendingCommand(e: any) {
  if (!e || typeof e != `object`) return !1;
  let t = e;
  return (
    typeof t.commandId == `string` &&
    typeof t.clientId == `string` &&
    (typeof t.sessionId == `string` || t.sessionId === null) &&
    typeof t.issuedAt == `number` &&
    typeof t.expiresAt == `number` &&
    !!t.replay &&
    typeof t.replay == `object`
  );
}
export function commandReplayOf(e: any) {
  if (e.type === `sendText` || e.type === `sendGoalCommand` || e.type === `compact`)
    return {
      kind: `input`,
      type: e.type,
      payload: deepCloneJson(e.payload),
      ...(e.baseRevision === void 0 ? {} : { baseRevision: e.baseRevision }),
    };
  if (e.type === `createSession`) {
    let t = e.payload;
    return `firstInput` in t ? { kind: `input`, type: `createSession`, payload: deepCloneJson(t) } : null;
  }
  return e.type === `resolveInteraction`
    ? { kind: `sensitiveDigest`, type: `resolveInteraction`, digest: fnv1a32Digest(e.payload) }
    : null;
}
export function isDiscardedOnRestartQueueDisposition(e: any) {
  return (
    e.reasonCode === `fault.command.inputDiscardedOnRestart` &&
    e.result?.type === `inputDisposition` &&
    (e.result.delivery === `queue` || e.result.delivery === `guide`)
  );
}
export const pendingCommandLedger = new (class {
  storage;
  now;
  entries = new Map();
  listeners = new Set<any>();
  reconcileInFlight = new Map();
  constructor(e: any = {}) {
    ((this.storage = e.storage ?? safeLocalStorage()), (this.now = e.now ?? Date.now), this.load());
  }
  subscribe(e: any): () => void {
    return (this.listeners.add(e), () => this.listeners.delete(e));
  }
  record(e: any, t?: any) { // 〔A1-P1-B6〕型缝 D2：clientContext 可选面（bundle JS 元数宽容；调用面 1 参 117420/117628 vs 2 参 119487，t 消费为条件 spread）
    this.pruneExpired();
    let n = commandReplayOf(e);
    if (!n) return null;
    let r = pendingCommandKey(e.sessionId, e.commandId),
      i = this.entries.get(r);
    if (i) return i;
    let a = {
      commandId: e.commandId,
      clientId: e.clientId,
      sessionId: e.sessionId,
      issuedAt: e.issuedAt,
      expiresAt: this.now() + PENDING_COMMAND_TTL_MS,
      replay: n,
      ...(t ? { clientContext: t } : {}),
    };
    return (this.entries.set(r, a), this.commit(), a);
  }
  list(e: any) {
    return (
      this.pruneExpired(),
      [...this.entries.values()]
        .filter((t) => t.sessionId === e)
        .sort((e, t) => e.issuedAt - t.issuedAt)
    );
  }
  listRecoverable(e: any) {
    return this.list(e).filter((e) => e.recovery === `discarded` && !e.recoveryDismissed);
  }
  settle(e: any, t: any) {
    this.entries.delete(pendingCommandKey(e, t)) && this.commit();
  }
  dismissRecovery(e: any, t: any) {
    let n = pendingCommandKey(e, t),
      r = this.entries.get(n);
    !r?.recovery ||
      r.recoveryDismissed ||
      (this.entries.set(n, { ...r, recoveryDismissed: !0 }), this.commit());
  }
  applyAck(e: any, t: any) {
    let n = this.entries.get(pendingCommandKey(e.sessionId, e.commandId));
    if (n) {
      if (n.replay.kind === `sensitiveDigest`) {
        this.settle(n.sessionId, n.commandId);
        return;
      }
      if (
        ((n = this.remapCreatedSession(n, t)), t.status === `accepted` || t.status === `duplicate`)
      ) {
        this.clearRecovery(n);
        return;
      }
      if (t.status === `failed` && t.reasonCode === `fault.command.inputDiscardedOnRestart`) {
        if (isDiscardedOnRestartQueueDisposition(t)) {
          this.settle(n.sessionId, n.commandId);
          return;
        }
        this.markRecovery(n, `discarded`);
        return;
      }
      this.settle(n.sessionId, n.commandId);
    }
  }
  applyQuery(e: any) {
    for (let t of e.results) {
      let e = this.entries.get(pendingCommandKey(t.key.sessionId, t.key.commandId));
      if (e) {
        if (t.result === `unknown`) {
          this.settle(e.sessionId, e.commandId);
          continue;
        }
        if (!(
          t.result.status === `failed` && t.result.reasonCode === `fault.command.queryUnavailable`
        )) {
          if (
            t.result.status === `failed` &&
            t.result.reasonCode === `fault.command.inputDiscardedOnRestart`
          ) {
            if (isDiscardedOnRestartQueueDisposition(t.result)) {
              this.settle(e.sessionId, e.commandId);
              continue;
            }
            this.markRecovery(e, `discarded`);
            continue;
          }
          if (((e = this.remapCreatedSession(e, t.result)), e.replay.kind === `sensitiveDigest`)) {
            this.settle(e.sessionId, e.commandId);
            continue;
          }
          t.result.status === `accepted` || t.result.status === `duplicate`
            ? this.clearRecovery(e)
            : this.settle(e.sessionId, e.commandId);
        }
      }
    }
  }
  reconcileSnapshot(e: any) {
    let t = new Set();
    for (let n of e.queue.items) n.sourceCommandId && t.add(n.sourceCommandId);
    for (let n of e.rows.window)
      (n.kind === `userInput` && n.sourceCommandId && t.add(n.sourceCommandId),
        n.kind === `timelineMarker` &&
          n.marker.type === `compact` &&
          n.sourceCommandId &&
          t.add(n.sourceCommandId));
    if (t.size === 0) return;
    let n = !1;
    for (let r of t) n = this.entries.delete(pendingCommandKey(e.sessionId, r)) || n;
    n && this.commit();
  }
  reconcileSession(e: any, t: any) {
    let n = e ?? `<global>`,
      r = this.reconcileInFlight.get(n);
    if (r) return r;
    let i = this.runReconcile(e, t).finally(() => {
      this.reconcileInFlight.get(n) === i && this.reconcileInFlight.delete(n);
    });
    return (this.reconcileInFlight.set(n, i), i);
  }
  consumeReplay(e: any) {
    let t = this.entries.get(pendingCommandKey(e.sessionId, e.commandId));
    if (!t || t.replay.kind !== `input`) return null;
    let n = {
      type: t.replay.type,
      payload: deepCloneJson(t.replay.payload),
      sessionId: t.sessionId,
      ...(t.replay.baseRevision === void 0 ? {} : { baseRevision: t.replay.baseRevision }),
      ...(t.clientContext ? { clientContext: t.clientContext } : {}),
    };
    return (this.settle(t.sessionId, t.commandId), n);
  }
  async runReconcile(e: any, t: any) {
    let n = this.list(e);
    for (let e = 0; e < n.length; e += 64) {
      let r = await t({
        commands: n
          .slice(e, e + 64)
          .map((e) => ({ sessionId: e.sessionId, commandId: e.commandId })),
      });
      this.applyQuery(r);
    }
  }
  markRecovery(e: any, t: any) {
    e.recovery !== t &&
      (this.entries.set(pendingCommandKey(e.sessionId, e.commandId), { ...e, recovery: t, recoveryDismissed: !1 }),
      this.commit());
  }
  clearRecovery(e: any) {
    if (!e.recovery && !e.recoveryDismissed) return;
    let { recovery: t, recoveryDismissed: n, ...r } = e;
    (this.entries.set(pendingCommandKey(e.sessionId, e.commandId), r), this.commit());
  }
  remapCreatedSession(e: any, t: any) {
    if (
      e.replay.kind !== `input` ||
      e.replay.type !== `createSession` ||
      (t.status !== `accepted` && t.status !== `duplicate`) ||
      t.result?.type !== `createSession` ||
      e.sessionId === t.result.sessionId
    )
      return e;
    this.entries.delete(pendingCommandKey(e.sessionId, e.commandId));
    let n = { ...e, sessionId: t.result.sessionId };
    return (this.entries.set(pendingCommandKey(n.sessionId, n.commandId), n), this.commit(), n);
  }
  load() {
    if (this.storage)
      try {
        let e = this.storage.getItem(PENDING_COMMAND_STORAGE_KEY);
        if (!e) return;
        let t = JSON.parse(e);
        if (!Array.isArray(t)) return;
        for (let e of t) isPersistedPendingCommand(e) && this.entries.set(pendingCommandKey(e.sessionId, e.commandId), e);
        this.pruneExpired();
      } catch {
        this.entries.clear();
      }
  }
  pruneExpired() {
    let e = this.now(),
      t = !1;
    for (let [n, r] of this.entries) r.expiresAt <= e && (this.entries.delete(n), (t = !0));
    t && this.commit();
  }
  commit() {
    if (this.storage)
      try {
        this.entries.size === 0
          ? this.storage.removeItem(PENDING_COMMAND_STORAGE_KEY)
          : this.storage.setItem(PENDING_COMMAND_STORAGE_KEY, JSON.stringify([...this.entries.values()]));
      } catch {}
    for (let e of this.listeners) e();
  }
})();
export function recoverableWorkspaceOf(e: any) {
  let t = e.clientContext?.workspace;
  if (t) return t.workspaceIdentity?.trim() || t.workspacePath;
  if (e.replay.kind !== `input` || e.replay.type !== `createSession`) return null;
  let n = e.replay.payload?.workspaceId;
  return typeof n == `string` && n.trim() ? n.trim() : null;
}
export function matchesRecoverableWorkspace(e: any, t: any, n: any) {
  return recoverableWorkspaceOf(e) === (n?.trim() || t);
}
export function useRecoverablePendingCommands({
  layer: e,
  sessionId: t,
  snapshot: n,
  status: r,
  subscriptionId: i,
  workspacePath: a,
  workspaceIdentity: o,
}: any) {
  let [s, c] = (0, React.useState)(0);
  ((0, React.useEffect)(() => pendingCommandLedger.subscribe(() => c((e) => e + 1)), []),
    (0, React.useEffect)(() => {
      n && pendingCommandLedger.reconcileSnapshot(n);
    }, [n]),
    (0, React.useEffect)(() => {
      if (r !== `live` || i === null) return;
      let n = t === null ? [null] : [t, null];
      Promise.all(n.map((t) => pendingCommandLedger.reconcileSession(t, (t: any) => e.queryCommands(t)))).catch((e) => {
        logger.warn(`[v4-pending-command] 重连对账失败，保留账本等待下次连接`, e);
      });
    }, [e, t, r, i]));
  let l = pendingCommandLedger.listRecoverable(t),
    u = pendingCommandLedger.listRecoverable(null).filter((e) => matchesRecoverableWorkspace(e, a, o));
  return t === null ? u : [...l, ...u];
}

/* ── 〔A1-P1-B6〕命令工厂闭包（styles 34315–34338 + 34598–34645，72 行逐字；OS buildCommand 真身 + CAS/row-target 集 + UUIDv7/clientId 装配）。
 *    映射：Zke→CAS_COMMAND_TYPES | Qke→ROW_TARGET_COMMAND_TYPES | nAe→HEX_BYTE_TABLE | wS→generateUuidV7
 *          TS→CLIENT_ID_STORAGE_KEY | ES→cachedClientId | DS→getClientId | OS→buildCommand。
 *    逐字证明：/tmp/a1r0-p1/r6-roundtrip.js（R6 ROUNDTRIP EXACT 72 lines）。型缝：见 r6-seam-log.txt。 ── */
export const CAS_COMMAND_TYPES = new Set([
    `applyFileRewind`,
    `forkAssistant`,
    `editUserQuery`,
    `retryTurn`,
    `setAssistantFeedback`,
    `sendQueuedNow`,
    `editQueueItem`,
    `reorderQueueItem`,
    `deleteQueueItem`,
    `setAutoDrain`,
    `switchModelConfig`,
    `switchCollaborationMode`,
    `setFollowupMode`,
    `pauseGoal`,
    `resumeGoal`,
  ]),
  ROW_TARGET_COMMAND_TYPES = new Set([
    `applyFileRewind`,
    `forkAssistant`,
    `editUserQuery`,
    `retryTurn`,
    `setAssistantFeedback`,
  ]);
export const HEX_BYTE_TABLE = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, `0`));
export function generateUuidV7(e = Date.now()) {
  let t = new Uint8Array(16);
  crypto.getRandomValues(t);
  let n = BigInt(e);
  ((t[0] = Number((n >> 40n) & 255n)),
    (t[1] = Number((n >> 32n) & 255n)),
    (t[2] = Number((n >> 24n) & 255n)),
    (t[3] = Number((n >> 16n) & 255n)),
    (t[4] = Number((n >> 8n) & 255n)),
    (t[5] = Number(n & 255n)),
    (t[6] = 112 | (t[6] & 15)),
    (t[8] = 128 | (t[8] & 63)));
  let r = ``;
  for (let e of t) r += HEX_BYTE_TABLE[e];
  return `${r.slice(0, 8)}-${r.slice(8, 12)}-${r.slice(12, 16)}-${r.slice(16, 20)}-${r.slice(20)}`;
}
export let CLIENT_ID_STORAGE_KEY = `zcode-v4-client-id:v1`,
  cachedClientId: string | null = null;
export function getClientId() {
  if (cachedClientId) return cachedClientId;
  let e = null;
  try {
    e = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  } catch {}
  let t = e ?? `client-${generateUuidV7()}`;
  if (!e)
    try {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, t);
    } catch {}
  return ((cachedClientId = t), t);
}
export function buildCommand(e: any) {
  if (CAS_COMMAND_TYPES.has(e.type) && e.baseRevision === void 0)
    throw Error(`command ${e.type} 是 CAS 命令，必须携带 baseRevision（10-protocol-spec §6.4）`);
  if (ROW_TARGET_COMMAND_TYPES.has(e.type) && !e.baseLogEpoch)
    throw Error(`command ${e.type} 是 row target 命令，必须携带 baseLogEpoch`);
  return {
    commandId: generateUuidV7(),
    clientId: getClientId(),
    sessionId: e.sessionId,
    ...(e.baseRevision === void 0 ? {} : { baseRevision: e.baseRevision }),
    ...(e.baseLogEpoch ? { baseLogEpoch: e.baseLogEpoch } : {}),
    type: e.type,
    payload: e.payload,
    issuedAt: Date.now(),
  };
}
