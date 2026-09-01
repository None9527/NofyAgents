/* ============================================================================
 * wireFrameSchemaCore.ts —— A1-P3-B7：wire 帧包壳 / workspace-config 帧 schema 域逐字补面
 * （styles js 四子区 148 行；aS 链余尾闭合子簇之二——协议信封族）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（四子区，非连续）：
 *   33321–33376（vke…tS 配置/校验和/投递种/非受信信封族，完整 var 语句）
 *   + 33377–33440（nS 受信 wire 帧包壳工厂，function 声明）
 *   + 33497–33504（Dke/Oke conversation wire 帧/信封）+ 33509–33528（kke…Mke
 *     sessions-index/workspace-config wire 帧/信封族）——后两片自 aS var 语句
 *     绕已录声明位 oS(33505)/aS(33493) S19 切出。
 * 消费面：nS/tS/Dke/Oke/kke/Ake/sS/jke/Mke 区外消费位 = 33529 丢弃式死元组
 *   （批 5/6 墓碑在案）+ wire 传输域（留批）——只立实体，canonical 立档。
 * 转录机制：AST 精确改名（119 处），往返核对 ROUNDTRIP[w] EXACT（148 行）在案
 *   （/tmp/a1r0-p3/p3b7w-roundtrip.js）；缝剥离 SEAMSTRIP[w] EXACT（p3b7w-seamstrip.js）。
 * 映射表（minified → 语义名 → bundle 定义行，17 符）：
 *   vke→configOptionValueShape(33321) | yke→configOptionShape(33331) | bke→slashCommandShape(33340)
 *   $x→workspaceConfigShape(33346) | xke→workspaceConfigLogicalFrame(33347) | Ske→workspaceConfigOps(33348)
 *   Cke→wireChecksumSchema(33349) | eS→wireDeliveryKindEnum(33350) | tS→untrustedWireEnvelopeSchema(33351)
 *   nS→buildWireFrameSchema(33377) | Dke→conversationWireFrameSchema(33497)
 *   Oke→conversationWireEnvelopeSchema(33501) | kke→sessionsIndexWireFrameSchema(33509)
 *   Ake→sessionsIndexWireEnvelopeSchema(33513) | sS→workspaceConfigFrameSchema(33517)
 *   jke→workspaceConfigWireFrameSchema(33521) | Mke→workspaceConfigWireEnvelopeSchema(33525)
 * 跨块直连：ji/K/Jr/Fi/Li/Oi/_t/$r/Yn/Tt→SrcSharedA zod 面；
 *   bi→protocolLimits=STREAM_TRANSPORT_LIMITS（SrcSharedB；〔A1-P3-B6〕实体化接线，
 *     函数体消费——nS 工厂调用时读，模块初始化不读）；Iee→Base64StringSchema（SrcSharedB，
 *     二跳 styles 632 `ao as Iee` ← facade ao）；iS→buildTopicFrameSchema /
 *   oS→sessionIndexFrameSchema（sessionsIndexSchemaCore）；aS→conversationFrameSchema
 *   （conversationFrameSchemaCore）。
 * 墓碑（同区留批/不录，边界证据见 A1-P3-B7.report.md §六）：
 *   33441–33466 wke/Tke——wire 叶（conversationWireCore）批 4 已录，跳过；
 *   33467–33473 丢弃式死语句——批 4 墓碑在案，不录；
 *   33474–33479 Eke/rS——区外消费位仅 33531–33553 死元组区（同批 5 Tt 族例），不录；
 *   33529 死元组 + 33530–33553 Nke/死元组区——不录（Nke 仅死元组消费）。
 * 型缝（全型层，禁抑制符）×19：S19 语句切分 ×2（aS var 语句两片切：片一头 var 前缀；
 *   片一尾 ,→; 且片二头 var 前缀）+ P1 顶层函数参数 :any ×1（buildWireFrameSchema e）
 *   + S16 any 接收面回调参数 :any ×16（nS/Dke/Oke/kke/Ake/sS/jke/Mke 八处 superRefine e/t）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zLiteral, zBoolean, zArray, zNumber, zDiscriminatedUnion, zUnknown, zUnion } from "../modules/SrcSharedA";
import { STREAM_TRANSPORT_LIMITS as protocolLimits, Base64StringSchema } from "../modules/SrcSharedB";
import { buildTopicFrameSchema, sessionIndexFrameSchema } from "./sessionsIndexSchemaCore";
import { conversationFrameSchema } from "./conversationFrameSchemaCore";

var configOptionValueShape = zObject({
    value: zString(),
    name: zString(),
    description: zString().optional(),
    origin: zEnum([`native`, `injected`]).optional(),
    modelProviderId: zString().optional(),
    modelProviderName: zString().optional(),
    modelThoughtLevels: zArray(zString()).optional(),
    modelDefaultThoughtLevel: zString().optional(),
  }),
  configOptionShape = zObject({
    id: zString(),
    name: zString(),
    description: zString().optional(),
    category: zString().optional(),
    type: zEnum([`select`, `boolean`]),
    currentValue: zUnion([zString(), zBoolean()]),
    options: zArray(configOptionValueShape).optional(),
  }),
  slashCommandShape = zObject({
    name: zString(),
    description: zString(),
    inputHint: zString().optional(),
    source: zEnum([`builtin`, `custom`]).optional(),
  }),
  workspaceConfigShape = zObject({ configOptions: zArray(configOptionShape), slashCommands: zArray(slashCommandShape) }),
  workspaceConfigLogicalFrame = zObject({ protocolVersion: zLiteral(1), workspaceId: zString(), logEpoch: zString(), config: workspaceConfigShape }),
  workspaceConfigOps = zDiscriminatedUnion(`op`, [zObject({ op: zLiteral(`config.updated`), config: workspaceConfigShape })]),
  wireChecksumSchema = zObject({ algorithm: zLiteral(`crc32`), value: zString().regex(/^[0-9a-f]{8}$/u) }).strict(),
  wireDeliveryKindEnum = zEnum([`initial`, `online`, `recovery`]),
  untrustedWireEnvelopeSchema = zDiscriminatedUnion(`kind`, [
    zObject({
      wireVersion: zLiteral(3),
      kind: zLiteral(`complete`),
      deliveryKind: zUnknown().optional(),
      logicalFrameId: zString().min(1),
      logicalFrameOrdinal: zNumber(),
      topic: zString().min(1),
      subscriptionId: zString().min(1),
      frame: zUnknown().optional(),
    }).passthrough(),
    zObject({
      wireVersion: zLiteral(3),
      kind: zLiteral(`fragment`),
      deliveryKind: zUnknown().optional(),
      logicalFrameId: zString().min(1),
      logicalFrameOrdinal: zNumber(),
      topic: zString().min(1),
      subscriptionId: zString().min(1),
      fragmentIndex: zUnknown().optional(),
      fragmentCount: zUnknown().optional(),
      logicalBytes: zUnknown().optional(),
      checksum: zUnknown().optional(),
      dataBase64: zUnknown().optional(),
    }).passthrough(),
  ]);
function buildWireFrameSchema(e: any) {
  return zDiscriminatedUnion(`kind`, [
    zObject({
      wireVersion: zLiteral(3),
      kind: zLiteral(`complete`),
      deliveryKind: wireDeliveryKindEnum,
      logicalFrameId: zString().min(1),
      logicalFrameOrdinal: zNumber()
        .int()
        .positive()
        .max(2 ** 53 - 1),
      topic: zString().min(1),
      subscriptionId: zString().min(1),
      frame: e,
    }).strict(),
    zObject({
      wireVersion: zLiteral(3),
      kind: zLiteral(`fragment`),
      deliveryKind: wireDeliveryKindEnum,
      logicalFrameId: zString().min(1),
      logicalFrameOrdinal: zNumber()
        .int()
        .positive()
        .max(2 ** 53 - 1),
      topic: zString().min(1),
      subscriptionId: zString().min(1),
      fragmentIndex: zNumber().int().nonnegative(),
      fragmentCount: zNumber().int().positive().max(protocolLimits.logicalFrameAssemblyMaxFragments),
      logicalBytes: zNumber().int().positive(),
      checksum: wireChecksumSchema,
      dataBase64: Base64StringSchema,
    }).strict(),
  ]).superRefine((e: any, t: any) => {
    let n = e;
    if (n.kind === `fragment`) {
      (n.fragmentIndex >= n.fragmentCount &&
        t.addIssue({
          code: `custom`,
          message: `fragmentIndex must be smaller than fragmentCount`,
          path: [`fragmentIndex`],
        }),
        n.fragmentCount > n.logicalBytes &&
          t.addIssue({
            code: `custom`,
            message: `fragmentCount cannot exceed logicalBytes`,
            path: [`fragmentCount`],
          }));
      return;
    }
    let r = n.frame;
    (r.topic !== n.topic &&
      t.addIssue({
        code: `custom`,
        message: `complete wire topic must match logical frame topic`,
        path: [`topic`],
      }),
      r.subscriptionId !== n.subscriptionId &&
        t.addIssue({
          code: `custom`,
          message: `complete wire subscriptionId must match logical frame subscriptionId`,
          path: [`subscriptionId`],
        }));
  });
}
var conversationWireFrameSchema = buildWireFrameSchema(conversationFrameSchema).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`conversation/`) || e.topic.length === 13) &&
      t.addIssue({ code: `custom`, message: `invalid conversation topic`, path: [`topic`] });
  }),
  conversationWireEnvelopeSchema = untrustedWireEnvelopeSchema.superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`conversation/`) || e.topic.length === 13) &&
      t.addIssue({ code: `custom`, message: `invalid conversation topic`, path: [`topic`] });
  });
var sessionsIndexWireFrameSchema = buildWireFrameSchema(sessionIndexFrameSchema).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`sessions-index/`) || e.topic.length === 15) &&
      t.addIssue({ code: `custom`, message: `invalid sessions-index topic`, path: [`topic`] });
  }),
  sessionsIndexWireEnvelopeSchema = untrustedWireEnvelopeSchema.superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`sessions-index/`) || e.topic.length === 15) &&
      t.addIssue({ code: `custom`, message: `invalid sessions-index topic`, path: [`topic`] });
  }),
  workspaceConfigFrameSchema = buildTopicFrameSchema(workspaceConfigLogicalFrame, workspaceConfigOps).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`workspace-config/`) || e.topic.length === 17) &&
      t.addIssue({ code: `custom`, message: `invalid workspace-config topic`, path: [`topic`] });
  }),
  workspaceConfigWireFrameSchema = buildWireFrameSchema(workspaceConfigFrameSchema).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`workspace-config/`) || e.topic.length === 17) &&
      t.addIssue({ code: `custom`, message: `invalid workspace-config topic`, path: [`topic`] });
  }),
  workspaceConfigWireEnvelopeSchema = untrustedWireEnvelopeSchema.superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`workspace-config/`) || e.topic.length === 17) &&
      t.addIssue({ code: `custom`, message: `invalid workspace-config topic`, path: [`topic`] });
  });

export {
  configOptionValueShape, configOptionShape, slashCommandShape,
  workspaceConfigShape, workspaceConfigLogicalFrame, workspaceConfigOps,
  wireChecksumSchema, wireDeliveryKindEnum, untrustedWireEnvelopeSchema,
  buildWireFrameSchema,
  conversationWireFrameSchema, conversationWireEnvelopeSchema,
  sessionsIndexWireFrameSchema, sessionsIndexWireEnvelopeSchema,
  workspaceConfigFrameSchema, workspaceConfigWireFrameSchema, workspaceConfigWireEnvelopeSchema,
};
