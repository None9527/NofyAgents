/* ============================================================================
 * conversationWireCore.ts —— A1-P3-B4：会话线协议簇逐字补面（styles js 33441–34804 七子区，661 行）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（七子区，非连续；中间死码/留批区段见下墓碑）：
 *   33441–33466（wke/Tke hello 能力/握手 schema）+ 33785–33889（Vke 族帧形/预算助手）
 *   + 33890–34228（bS 帧装配类）+ 34598–34629（nAe 族 uuidv7/clientId）
 *   + 34646–34670（kS/AS 握手缓存）+ 34671–34745（rAe 族在途帧暂存）
 *   + 34746–34804（NS 帧装配包装）
 * 消费面：services/sessionIndex §B5-transport 段（sessionIndexTransportFactory，A1-P3-B3）
 *   之 bS/AS/MS/NS 环境声明四件改指本叶实体；oS 仍留批（见下）。
 * 转录机制：AST 精确改名（106 处：跨块自由符引用 10 名 + 顶层声明锚 33 + 顶层引用 27 +
 *   声明锚同址 36），往返核对 ROUNDTRIP[wire] EXACT（661 行）在案
 *   （/tmp/a1r0-p3/p3b4-roundtrip.js）；体内 62 局部保留混淆名（B5 约定）。
 * 映射表（minified → 语义名 → bundle 定义行）：
 *   wke→sessionWireCapabilitiesSchema(33441) | Tke→sessionHelloSchema(33447)
 *   Vke→frameEnvelopeHeadroomBytes(33785) | Hke→frameEnvelopeFramingBytes(33786)
 *   fS→varintByteLength(33787) | pS→frameEnvelopeBudgets(33792) | mS→jsonUtf8ByteLength(33822)
 *   Uke→completeFrameRequiredFields(33825) | Wke→fragmentFrameRequiredFields(33835)
 *   Gke→frameChecksumFields(33849) | hS→keysWithinFieldSet(33850) | gS→normalizeDeliveryKind(33853)
 *   Kke→hasFragmentFrameShape(33856) | _S→assemblyRouteKey(33872) | qke→bytesEqual(33875)
 *   vS→frameMetadataMatches(33880) | yS→resolveBudgetLimit(33885)
 *   bS→SessionIndexTopicMultiplexer(33890)
 *   nAe→hexByteTable(34598) | wS→uuidV7(34599) | TS→clientIdStorageKey(34615)
 *   ES→cachedClientId(34616) | DS→resolveClientId(34617)
 *   kS→handshakePromiseByEndpoint(34646) | AS→sessionTransportHandshake(34647)
 *   rAe→inflightStagingFrameCap(34671) | jS→inflightStagingByteCap(34672)
 *   iAe→inflightStagingOverflowReason(34673) | aAe→frameJsonUtf8Bytes(34674)
 *   MS→sessionIndexInflightTracker(34677) | NS→sessionFrameAssembly(34746)
 * 区外自由符 → 段内环境声明（函数体消费，模块初始化不读，declare 安全）：
 *   bi→protocolLimits（src 块 Rf；属主 declare 在 ./commandQueueProtocol §G.4）
 *   Tte→decodeFrameBase64（src 块 Uf）
 * 跨块直连（实体接线）：Ane→crc32Hex（SrcSharedB）| J→logger（SkillStore 转导出）|
 *   _i→wireServerTimeSchema（src 块 If=E()，模块初始化读 → 本叶 zNumber() 实体）|
 *   ji/K/Jr/Fi/Li→SrcSharedA zod 面（zObject/zString/zEnum/zLiteral/zBoolean）。
 * 墓碑（同区留批，边界证据见 A1-P3-B4.report.md §七）：
 *   33467–33473 / 34339–34348 丢弃式死码（ji({...}) 孤调用，无赋值无导出）——不录；
 *   34229–34338 Jke/Yke/Xke/Zke/Qke——bS 同 var 语句共声明者（§G.3 SessionCommandSchemas
 *     属域），模块初始化读 src 块 schema（Ci/gne/Qee/Dte/_i/ii 等）未实体化，declare 即启动崩，
 *     整链留批；本叶 bS 类以 S19 缝（`, `→`;`）自该语句切出，类表达式本体逐字不变；
 *   34630–34645 OS——依赖 Zke/Qke（留批共声明者），同步留批；
 *   34349–34597 $ke/eAe/xS 族 + SS——命令回执/会话状态表，依赖面（cS/Fi/Tt 族）超本批，留批；
 *   33505 oS（sessionIndexFrameSchema）——aS 链（33493–33529）依赖 iS(33480)/oke(33180)/
 *     cke(33219)/hke(33313)/gke(33314) 延伸至 33100 以下，超单批预算，留批
 *     （sessionIndex §B5-transport 段 declare 保留）。
 * 型缝（全型层，禁抑制符）×70：P1 顶层函数参数 :any ×23 + P1 类构造/方法参数 :any ×17 +
 *   P1 返回对象字面量方法参数 :any ×12（MS begin/bind/cancel/activate/forget/accept +
 *   NS accept/recover/discard）+ S16 any 接收面回调参数 :any ×7（Tke.superRefine 双参 /
 *   NS a 双参箭头 / o 单参箭头 / MS a 清理箭头 / MS filter 单参）+ S6 声明位宽化 ×1
 *   （cachedClientId: any = null）+ S5 容器泛型宽化 ×2（new Set<any>() / expire let t: any[]）+
 *   S17 类字段宽化 :any ×6 + S18 类成员补声明 ×1（frameSchema）+
 *   S19 语句切分终止符 ×1（bS 共声明者留批，`,`→`;`）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zLiteral, zBoolean, zNumber } from '../modules/SrcSharedA';
import { crc32Hex } from '../modules/SrcSharedB';
import { logger } from '../modules/SkillStore';

declare const protocolLimits: {
  logicalFrameAssemblyMaxBytes: number;
  logicalFrameAssemblyMaxFragments: number;
  logicalFrameAssemblyMaxConcurrent: number;
  logicalFrameAssemblyMaxStagedBytes: number;
  logicalFrameAssemblyTimeoutMs: number;
  maxFrameBytes: number;
  transportEnvelopeIdMaxChars: number;
}; // 原 bi（src 块 Rf；属主 declare 在 ./commandQueueProtocol §G.4，同 FeedbackCenter 处置）
declare function decodeFrameBase64(e: any): any; // 原 Tte（src 块 Uf）

const wireServerTimeSchema = zNumber(); // 原 _i（src 块 If=E()，模块初始化读 → 实体接线）

var sessionWireCapabilitiesSchema = zObject({
    nativeDialogs: zBoolean(),
    localTerminal: zBoolean(),
    binaryFrames: zBoolean(),
    compression: zEnum([`none`, `permessage-deflate`]),
  }),
  sessionHelloSchema = zObject({
    kind: zLiteral(`hello`),
    protocolVersion: zLiteral(3),
    connectionId: zString(),
    clientMode: zEnum([`desktop-continuous`, `web-remote-replayable`]),
    deliveryProfile: zEnum([`continuous`, `replayable`]),
    serverTime: wireServerTimeSchema,
    capabilities: sessionWireCapabilitiesSchema,
    auth: zObject({ userId: zString().optional() }),
  })
    .strict()
    .superRefine((e: any, t: any) => {
      let n = e.clientMode === `desktop-continuous` ? `continuous` : `replayable`;
      e.deliveryProfile !== n &&
        t.addIssue({
          code: `custom`,
          message: `trusted clientMode and deliveryProfile must match`,
          path: [`deliveryProfile`],
        });
    });
var frameEnvelopeHeadroomBytes = 204,
  frameEnvelopeFramingBytes = 13;
function varintByteLength(e: any) {
  let t = 1;
  for (let n = e >>> 7; n > 0; n >>>= 7) t += 1;
  return t;
}
function frameEnvelopeBudgets(e: any) {
  let t = jsonUtf8ByteLength({ method: `v4/conversation/frame`, params: e }) + 1,
    n = jsonUtf8ByteLength(e),
    r = String(2 ** 53 - 1).length,
    i = 1 + varintByteLength(r) + r,
    a = 1 + varintByteLength(2) + 1 + varintByteLength(frameEnvelopeHeadroomBytes) + i + 1 + varintByteLength(n) + n,
    o = a + frameEnvelopeFramingBytes,
    s = 4 * Math.ceil(a / 3),
    c = `x`.repeat(protocolLimits.transportEnvelopeIdMaxChars),
    l =
      jsonUtf8ByteLength({
        type: `data`,
        payload: {
          zcode_type: `rpc-frame`,
          bridgeSessionId: c,
          bridgeGeneration: 2 ** 53 - 1,
          recoveryId: c,
          seq: 2 ** 53 - 1,
          dataBase64: ``,
        },
        client_ts: 2 ** 53 - 1,
        server_ts: 2 ** 53 - 1,
      }) + s;
  return {
    cliNdjsonBytes: t,
    channelSocketBytes: o,
    mobileRelayBytes: l,
    maxBytes: Math.max(t, o, l),
  };
}
function jsonUtf8ByteLength(e: any) {
  return new TextEncoder().encode(JSON.stringify(e)).byteLength;
}
var completeFrameRequiredFields = new Set([
    `wireVersion`,
    `kind`,
    `deliveryKind`,
    `logicalFrameId`,
    `logicalFrameOrdinal`,
    `topic`,
    `subscriptionId`,
    `frame`,
  ]),
  fragmentFrameRequiredFields = new Set([
    `wireVersion`,
    `kind`,
    `deliveryKind`,
    `logicalFrameId`,
    `logicalFrameOrdinal`,
    `topic`,
    `subscriptionId`,
    `fragmentIndex`,
    `fragmentCount`,
    `logicalBytes`,
    `checksum`,
    `dataBase64`,
  ]),
  frameChecksumFields = new Set([`algorithm`, `value`]);
function keysWithinFieldSet(e: any, t: any) {
  return Object.keys(e).every((e) => t.has(e));
}
function normalizeDeliveryKind(e: any) {
  return e === `initial` || e === `online` || e === `recovery` ? e : null;
}
function hasFragmentFrameShape(e: any) {
  if (
    !keysWithinFieldSet(e, fragmentFrameRequiredFields) ||
    typeof e.fragmentIndex != `number` ||
    typeof e.fragmentCount != `number` ||
    typeof e.logicalBytes != `number` ||
    typeof e.dataBase64 != `string` ||
    typeof e.checksum != `object` ||
    e.checksum === null ||
    Array.isArray(e.checksum) ||
    !keysWithinFieldSet(e.checksum, frameChecksumFields)
  )
    return !1;
  let t = e.checksum;
  return typeof t.algorithm == `string` && typeof t.value == `string`;
}
function assemblyRouteKey(e: any, t: any) {
  return `${e}\0${t}`;
}
function bytesEqual(e: any, t: any) {
  if (e.byteLength !== t.byteLength) return !1;
  for (let n = 0; n < e.byteLength; n += 1) if (e[n] !== t[n]) return !1;
  return !0;
}
function frameMetadataMatches(e: any, t: any) {
  if (typeof e != `object` || !e) return !1;
  let n = e;
  return n.topic === t.topic && n.subscriptionId === t.subscriptionId;
}
function resolveBudgetLimit(e: any, t: any, n: any) {
  let r = e ?? t;
  if (!Number.isFinite(r) || r <= 0) throw RangeError(`${n} must be a positive finite number`);
  return Math.min(Math.floor(r), t);
}
var SessionIndexTopicMultiplexer = class {
    frameSchema: any;
    assemblies = new Map();
    settledByRoute = new Map();
    stagedDecodedBytes = 0;
    maxAssemblyBytes: any;
    maxFragments: any;
    maxConcurrentAssemblies: any;
    maxStagedDecodedBytes: any;
    timeoutMs: any;
    maxPhysicalFrameBytes: any;
    constructor(e: any, t: any = {}) {
      ((this.frameSchema = e),
        (this.maxAssemblyBytes = resolveBudgetLimit(
          t.maxAssemblyBytes,
          protocolLimits.logicalFrameAssemblyMaxBytes,
          `maxAssemblyBytes`,
        )),
        (this.maxFragments = resolveBudgetLimit(
          t.maxFragments,
          protocolLimits.logicalFrameAssemblyMaxFragments,
          `maxFragments`,
        )),
        (this.maxConcurrentAssemblies = resolveBudgetLimit(
          t.maxConcurrentAssemblies,
          protocolLimits.logicalFrameAssemblyMaxConcurrent,
          `maxConcurrentAssemblies`,
        )),
        (this.maxStagedDecodedBytes = resolveBudgetLimit(
          t.maxStagedDecodedBytes,
          protocolLimits.logicalFrameAssemblyMaxStagedBytes,
          `maxStagedDecodedBytes`,
        )),
        (this.timeoutMs = resolveBudgetLimit(t.timeoutMs, protocolLimits.logicalFrameAssemblyTimeoutMs, `timeoutMs`)),
        (this.maxPhysicalFrameBytes = resolveBudgetLimit(
          t.maxPhysicalFrameBytes,
          protocolLimits.maxFrameBytes,
          `maxPhysicalFrameBytes`,
        )));
    }
    accept(e: any, t: any = Date.now()) {
      let n = this.expire(t),
        r = assemblyRouteKey(e.topic, e.subscriptionId);
      if (!Number.isSafeInteger(e.logicalFrameOrdinal) || e.logicalFrameOrdinal < 1)
        return (n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)), n);
      let i = this.settledByRoute.get(r);
      if (i) {
        if (e.logicalFrameOrdinal < i.logicalFrameOrdinal) return n;
        if (e.logicalFrameOrdinal === i.logicalFrameOrdinal)
          return (
            e.logicalFrameId !== i.logicalFrameId &&
              n.push(this.fault(e, `proto.frameAssemblyOrdinalConflict`)),
            n
          );
      }
      let a = normalizeDeliveryKind(e.deliveryKind);
      if (a === `recovery`)
        for (let t = n.length - 1; t >= 0; --t) {
          let r = n[t];
          r?.kind === `fault` &&
            r.fault.topic === e.topic &&
            r.fault.subscriptionId === e.subscriptionId &&
            r.fault.logicalFrameOrdinal < e.logicalFrameOrdinal &&
            n.splice(t, 1);
        }
      let o = this.assemblies.get(r);
      if (o) {
        if (e.logicalFrameOrdinal < o.logicalFrameOrdinal) return n;
        if (e.logicalFrameOrdinal === o.logicalFrameOrdinal) {
          if (e.logicalFrameId !== o.logicalFrameId)
            return (
              this.release(r, o),
              this.settle(r, o),
              n.push(this.fault(e, `proto.frameAssemblyOrdinalConflict`)),
              n
            );
        } else
          (this.release(r, o),
            this.settle(r, o),
            a !== `recovery` && n.push(this.fault(o, `proto.frameAssemblySuperseded`)));
      }
      if (a === null)
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
          n
        );
      if (e.kind === `complete`) {
        if (!keysWithinFieldSet(e, completeFrameRequiredFields) || !Object.prototype.hasOwnProperty.call(e, `frame`))
          return (
            this.releaseAndSettle(r, e),
            n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
            n
          );
        if (frameEnvelopeBudgets(e).maxBytes > this.maxPhysicalFrameBytes)
          return (
            this.releaseAndSettle(r, e),
            n.push(this.fault(e, `proto.frameEnvelopeTooLarge`)),
            n
          );
        let t = this.assemblies.get(r);
        if (t)
          return (
            this.release(r, t),
            this.settle(r, t),
            n.push(this.fault(t, `proto.frameAssemblyMetadataMismatch`)),
            n
          );
        if (new TextEncoder().encode(JSON.stringify(e.frame)).byteLength > this.maxAssemblyBytes)
          return (this.settle(r, e), n.push(this.fault(e, `proto.frameAssemblyTooLarge`)), n);
        if (!frameMetadataMatches(e.frame, e))
          return (
            this.settle(r, e),
            n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
            n
          );
        let i = this.frameSchema.safeParse(e.frame);
        return i.success
          ? (this.settle(r, e), n.push({ kind: `complete`, frame: i.data, deliveryKind: a }), n)
          : (this.settle(r, e), n.push(this.fault(e, `proto.frameAssemblyInvalidPayload`)), n);
      }
      if (!hasFragmentFrameShape(e))
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
          n
        );
      if (frameEnvelopeBudgets(e).maxBytes > this.maxPhysicalFrameBytes)
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameEnvelopeTooLarge`)),
          n
        );
      if (e.fragmentCount > this.maxFragments)
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameFragmentCountExceeded`)),
          n
        );
      if (e.logicalBytes > this.maxAssemblyBytes)
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameAssemblyTooLarge`)),
          n
        );
      if (
        !Number.isInteger(e.fragmentCount) ||
        e.fragmentCount < 1 ||
        !Number.isInteger(e.fragmentIndex) ||
        e.fragmentIndex < 0 ||
        e.fragmentIndex >= e.fragmentCount ||
        !Number.isInteger(e.logicalBytes) ||
        e.logicalBytes < 1 ||
        e.fragmentCount > e.logicalBytes ||
        e.checksum.algorithm !== `crc32` ||
        !/^[0-9a-f]{8}$/u.test(e.checksum.value)
      )
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
          n
        );
      let s = decodeFrameBase64(e.dataBase64);
      if (!s)
        return (
          this.releaseAndSettle(r, e),
          n.push(this.fault(e, `proto.frameAssemblyInvalidBase64`)),
          n
        );
      let c = this.assemblies.get(r);
      if (c) {
        if (
          c.fragmentCount !== e.fragmentCount ||
          c.deliveryKind !== a ||
          c.logicalBytes !== e.logicalBytes ||
          c.checksum.algorithm !== e.checksum.algorithm ||
          c.checksum.value !== e.checksum.value
        )
          return (
            this.release(r, c),
            this.settle(r, c),
            n.push(this.fault(e, `proto.frameAssemblyMetadataMismatch`)),
            n
          );
      } else {
        if (this.assemblies.size >= this.maxConcurrentAssemblies)
          return (
            this.settle(r, e),
            n.push(this.fault(e, `proto.frameAssemblyConcurrentLimit`)),
            n
          );
        if (this.stagedDecodedBytes + s.byteLength > this.maxStagedDecodedBytes)
          return (this.settle(r, e), n.push(this.fault(e, `proto.frameAssemblyBudgetExceeded`)), n);
        ((c = {
          deliveryKind: a,
          logicalFrameId: e.logicalFrameId,
          logicalFrameOrdinal: e.logicalFrameOrdinal,
          topic: e.topic,
          subscriptionId: e.subscriptionId,
          fragmentCount: e.fragmentCount,
          logicalBytes: e.logicalBytes,
          checksum: { algorithm: `crc32`, value: e.checksum.value },
          fragments: Array.from({ length: e.fragmentCount }, () => void 0),
          receivedCount: 0,
          decodedBytes: 0,
          firstSeenAt: t,
        }),
          this.assemblies.set(r, c));
      }
      let l = c.fragments[e.fragmentIndex];
      if (l)
        return (
          bytesEqual(l, s) ||
            (this.release(r, c),
            this.settle(r, c),
            n.push(this.fault(e, `proto.frameAssemblyFragmentConflict`))),
          n
        );
      if (this.stagedDecodedBytes + s.byteLength > this.maxStagedDecodedBytes)
        return (
          this.release(r, c),
          this.settle(r, c),
          n.push(this.fault(e, `proto.frameAssemblyBudgetExceeded`)),
          n
        );
      if (c.decodedBytes + s.byteLength > c.logicalBytes)
        return (
          this.release(r, c),
          this.settle(r, c),
          n.push(this.fault(e, `proto.frameAssemblyLengthMismatch`)),
          n
        );
      if (
        ((c.fragments[e.fragmentIndex] = s),
        (c.receivedCount += 1),
        (c.decodedBytes += s.byteLength),
        (this.stagedDecodedBytes += s.byteLength),
        c.receivedCount !== c.fragmentCount)
      )
        return n;
      if ((this.release(r, c), c.decodedBytes !== c.logicalBytes))
        return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyLengthMismatch`)), n);
      let u = new Uint8Array(c.decodedBytes),
        d = 0;
      for (let e of c.fragments) {
        if (!e)
          return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyLengthMismatch`)), n);
        (u.set(e, d), (d += e.byteLength));
      }
      if (crc32Hex(u) !== c.checksum.value)
        return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyChecksumMismatch`)), n);
      let f;
      try {
        f = new TextDecoder(`utf-8`, { fatal: !0 }).decode(u);
      } catch {
        return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyInvalidUtf8`)), n);
      }
      let p;
      try {
        p = JSON.parse(f);
      } catch {
        return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyInvalidJson`)), n);
      }
      if (!frameMetadataMatches(p, c))
        return (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyMetadataMismatch`)), n);
      let m = this.frameSchema.safeParse(p);
      return m.success
        ? (this.settle(r, c),
          n.push({ kind: `complete`, frame: m.data, deliveryKind: c.deliveryKind }),
          n)
        : (this.settle(r, c), n.push(this.fault(c, `proto.frameAssemblyInvalidPayload`)), n);
    }
    expire(e: any = Date.now()) {
      let t: any[] = [];
      for (let [n, r] of this.assemblies)
        e - r.firstSeenAt < this.timeoutMs ||
          (this.release(n, r),
          this.settle(n, r),
          t.push(this.fault(r, `proto.frameAssemblyTimedOut`)));
      return t;
    }
    discard(e: any, t: any) {
      let n = assemblyRouteKey(e, t),
        r = this.assemblies.get(n);
      (r && this.release(n, r), this.settledByRoute.delete(n));
    }
    abort(e: any, t: any) {
      let n = assemblyRouteKey(e, t),
        r = this.assemblies.get(n);
      r && (this.release(n, r), this.settle(n, r));
    }
    clear() {
      (this.assemblies.clear(), this.settledByRoute.clear(), (this.stagedDecodedBytes = 0));
    }
    getStats() {
      return { assemblies: this.assemblies.size, stagedDecodedBytes: this.stagedDecodedBytes };
    }
    get nextExpiryAt() {
      let e = null;
      for (let t of this.assemblies.values()) {
        let n = t.firstSeenAt + this.timeoutMs;
        (e === null || n < e) && (e = n);
      }
      return e;
    }
    release(e: any, t: any) {
      this.assemblies.get(e) === t &&
        (this.assemblies.delete(e), (this.stagedDecodedBytes -= t.decodedBytes));
    }
    settle(e: any, t: any) {
      let n = this.settledByRoute.get(e);
      (n && n.logicalFrameOrdinal > t.logicalFrameOrdinal) ||
        this.settledByRoute.set(e, {
          logicalFrameId: t.logicalFrameId,
          logicalFrameOrdinal: t.logicalFrameOrdinal,
        });
    }
    releaseAndSettle(e: any, t: any) {
      let n = this.assemblies.get(e);
      (n &&
        n.logicalFrameOrdinal === t.logicalFrameOrdinal &&
        n.logicalFrameId === t.logicalFrameId &&
        this.release(e, n),
        this.settle(e, t));
    }
    fault(e: any, t: any) {
      let n = normalizeDeliveryKind(e.deliveryKind);
      return {
        kind: `fault`,
        fault: {
          ...(n === null ? {} : { deliveryKind: n }),
          reasonCode: t,
          logicalFrameId: e.logicalFrameId,
          logicalFrameOrdinal: e.logicalFrameOrdinal,
          topic: e.topic,
          subscriptionId: e.subscriptionId,
        },
      };
    }
  };
var hexByteTable = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, `0`));
function uuidV7(e: any = Date.now()) {
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
  for (let e of t) r += hexByteTable[e];
  return `${r.slice(0, 8)}-${r.slice(8, 12)}-${r.slice(12, 16)}-${r.slice(16, 20)}-${r.slice(20)}`;
}
var clientIdStorageKey = `zcode-v4-client-id:v1`,
  cachedClientId: any = null;
function resolveClientId() {
  if (cachedClientId) return cachedClientId;
  let e = null;
  try {
    e = localStorage.getItem(clientIdStorageKey);
  } catch {}
  let t = e ?? `client-${uuidV7()}`;
  if (!e)
    try {
      localStorage.setItem(clientIdStorageKey, t);
    } catch {}
  return ((cachedClientId = t), t);
}
var handshakePromiseByEndpoint = new WeakMap();
function sessionTransportHandshake(e: any) {
  let t = e,
    n = handshakePromiseByEndpoint.get(t);
  if (n) return n;
  let r = (async () => {
    let t = sessionHelloSchema.parse(await e.helloConversationV4());
    return (
      await e.initializeConversationV4({
        kind: `clientHello`,
        protocolVersion: 3,
        clientId: resolveClientId(),
        appVersion: `unknown`,
      }),
      t
    );
  })();
  return (
    handshakePromiseByEndpoint.set(t, r),
    r.catch(() => {
      handshakePromiseByEndpoint.get(t) === r && handshakePromiseByEndpoint.delete(t);
    }),
    r
  );
}
var inflightStagingFrameCap = 1024,
  inflightStagingByteCap = 32 * 1024 * 1024,
  inflightStagingOverflowReason = `fault.subscription.initialFrameStagingOverflow`;
function frameJsonUtf8Bytes(e: any) {
  return new TextEncoder().encode(JSON.stringify(e)).byteLength;
}
function sessionIndexInflightTracker(e: any) {
  let t = new Map(),
    n = new Map(),
    r = new Map(),
    i = new Map(),
    a = (e: any) => {
      let r = t.get(e.topic);
      (r?.delete(e),
        r?.size === 0 && t.delete(e.topic),
        e.subscriptionId && n.delete(e.subscriptionId),
        (e.frames.length = 0),
        (e.stagedBytes = 0));
    };
  return {
    begin(e: any) {
      let n = { topic: e, subscriptionId: null, frames: [], stagedBytes: 0, overflowReason: null },
        r = t.get(e) ?? new Set<any>();
      return (r.add(n), t.set(e, r), n);
    },
    bind(e: any, t: any) {
      let r = e;
      if (r.overflowReason) {
        let e = r.overflowReason;
        throw (a(r), Error(e));
      }
      ((r.subscriptionId = t), n.set(t, r));
    },
    cancel(e: any) {
      a(e);
    },
    activate(t: any) {
      let o = n.get(t);
      if (!o) return;
      let s = r.get(o.topic);
      (s && s !== t && i.delete(s), r.set(o.topic, t), i.set(t, o.topic));
      let c = o.frames.filter((e: any) => e.subscriptionId === t);
      a(o);
      for (let t of c) e(t);
      return { topic: o.topic, previousSubscriptionId: s ?? null };
    },
    forget(e: any) {
      let t = n.get(e);
      t && a(t);
      let o = i.get(e);
      (o && r.get(o) === e && r.delete(o), i.delete(e));
    },
    accept(n: any) {
      if (r.get(n.topic) === n.subscriptionId) {
        e(n);
        return;
      }
      let i = t.get(n.topic);
      if (!i) return;
      let a = frameJsonUtf8Bytes(n);
      for (let e of i)
        if (!e.overflowReason) {
          if (a > inflightStagingByteCap || e.frames.length + 1 > inflightStagingFrameCap || e.stagedBytes + a > inflightStagingByteCap) {
            ((e.frames.length = 0), (e.stagedBytes = 0), (e.overflowReason = inflightStagingOverflowReason));
            continue;
          }
          (e.frames.push(n), (e.stagedBytes += a));
        }
    },
    clear() {
      for (let e of t.values()) for (let t of e) ((t.frames.length = 0), (t.stagedBytes = 0));
      (t.clear(), n.clear(), r.clear(), i.clear());
    },
  };
}
function sessionFrameAssembly(e: any, t: any, n: any) {
  let r = null,
    i = new Set(),
    a = (e: any, t: any) => `${e}\0${t}`,
    o = (r: any) => {
      let o = r.filter((e: any) => e.kind === `fault`),
        s = new Set(),
        c = new Set();
      for (let e of r)
        e.kind === `complete` &&
          e.deliveryKind === `recovery` &&
          c.add(a(e.frame.topic, e.frame.subscriptionId));
      for (let { fault: t } of o) {
        let r = a(t.topic, t.subscriptionId);
        c.has(r) ||
          (s.add(r),
          i.add(r),
          e.abort(t.topic, t.subscriptionId),
          logger.warn(`[v4-topic-wire] physical assembly rejected`, t),
          n?.(t));
      }
      for (let e of r) {
        if (e.kind !== `complete`) continue;
        let n = a(e.frame.topic, e.frame.subscriptionId);
        (e.deliveryKind === `recovery` && i.delete(n),
          !(s.has(n) || i.has(n)) && t(e.frame, e.deliveryKind));
      }
    },
    s = () => {
      r &&= (clearTimeout(r), null);
      let t = e.nextExpiryAt;
      t !== null &&
        (r = setTimeout(
          () => {
            ((r = null), o(e.expire(Date.now())), s());
          },
          Math.max(0, t - Date.now()),
        ));
    };
  return {
    accept(t: any) {
      let n = a(t.topic, t.subscriptionId);
      if (i.has(n)) {
        if (t.deliveryKind !== `recovery`) return;
        (i.delete(n), e.abort(t.topic, t.subscriptionId));
      }
      (o(e.accept(t)), s());
    },
    recover(t: any, n: any) {
      (i.delete(a(t, n)), e.abort(t, n), s());
    },
    discard(t: any, n: any) {
      (i.delete(a(t, n)), e.discard(t, n), s());
    },
    clear() {
      (i.clear(), e.clear(), (r &&= (clearTimeout(r), null)));
    },
  };
}

export {
  sessionWireCapabilitiesSchema, sessionHelloSchema,
  frameEnvelopeHeadroomBytes, frameEnvelopeFramingBytes, varintByteLength, frameEnvelopeBudgets,
  jsonUtf8ByteLength, completeFrameRequiredFields, fragmentFrameRequiredFields, frameChecksumFields,
  keysWithinFieldSet, normalizeDeliveryKind, hasFragmentFrameShape, assemblyRouteKey, bytesEqual,
  frameMetadataMatches, resolveBudgetLimit, SessionIndexTopicMultiplexer,
  hexByteTable, uuidV7, clientIdStorageKey, cachedClientId, resolveClientId,
  handshakePromiseByEndpoint, sessionTransportHandshake,
  inflightStagingFrameCap, inflightStagingByteCap, inflightStagingOverflowReason, frameJsonUtf8Bytes,
  sessionIndexInflightTracker, sessionFrameAssembly,
  wireServerTimeSchema, // 〔A1-P3-B5〕sessionsIndexSchemaCore 消费（原 _i，src 块 If=E() 实体接线）
};
