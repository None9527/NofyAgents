# A1 阶段计划：适配 × 重建 并行（A0 收官后）

用户指令：适配（facade/内核原生接线）与重建（styles chunk 源码化）同时推进。

## 政策变更（记录）
- **renderer 原始 chunk 仍是 ground truth**：`out/renderer/assets/` md5 基线不变，facade/重建只改"消费方"，不写原始 chunk。
- **out/main/ 自本阶段起为移植工作面**（PORTING-PLAN 阶段 A「不拆旧路」）；out-md5.manifest 的校验范围收窄为 `out/renderer/assets/`（A1 起新基线 = 现 manifest 中 renderer 子集）。
- 三轨范围互斥：F = boot harness + facade 新文件；A = main 进程 seam + desktop/scripts 探针；R = modules/ 新重建文件 + declare 改指。

## 轨 F —— src-chunk facade（适配）
- F1：提取 src chunk 原始导出面（bundle export 语句 + styles chunk 对 `./src-HCld2afU.js` 的 import 面）× rendererEntry 头注 SYMBOLS 表 × a0-wiring-data/a0-symbols.tsv → 生成 facade 模块（minified 名 → 语义名再导出）；boot harness 接线，styles chunk 改消费 facade。
- F2：IntlProvider chunk facade：重建 intlProvider 作单实例（S5 首启 i18n 上下文缺陷从源头消解，取代 harness 级 shim）。
- F3：boot 复验（React 挂载、完整 shell、零控制台异常、截图）+ 与 S5 基线行为对照。
- 终点语义：facade 尺寸 = 未重建余量；R 轨每收一块，facade 对应条目退役；styles 全量源码化日 facade 整删。

## 轨 A —— 内核 ACP（PORTING-PLAN 阶段 A 原文执行）
- A1：main 内 `NofyKernelClient` 单例（WS JSON-RPC；吸收 seam/acp-client.js 已验证部分；修正 cancel=notification、`_nofy/*` 前缀）；kernel-supervisor 发现端点接入；旧 ZCodeProtocolClient 暂留服务 renderer（不拆旧路）。
- A2：收编 seam/workspace-registry.js 的第二条 ACP 连接入单例（枚举逻辑含 dir-scan/标题回退链保留）。
- A3：探针入库 desktop/scripts/acp-probe*.mjs；验证：initialize（clientIdentifier=nofy-desktop）、modelState/roster、全进程对内核只剩一条 WS。

## 轨 R —— styles chunk 源码化（重建）
- R0 清点：1,354 个一方名 → bundle 区域归属（styles 行段/他 chunk），按被消费数排序，产出区域→名表。
- R1+ 解码批：B5 约定（语义名 + 头注映射表 + 尾部符号表；函数体内局部名保留）；declare→import 改指；逐批门禁（esbuild 逐文件、tsc 不增、renderer md5 不变、适用处 emit-diff）。
- 首批取消费最高的区域。

## 纪律（沿用 A0）
零新增 @ts-expect-error/@ts-ignore/as any；报告 A1-<track><n>.report.md；编排者逐批独立复验后入库提交；任何轨不得编辑他轨范围文件。
