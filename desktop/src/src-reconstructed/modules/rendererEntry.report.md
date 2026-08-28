# rendererEntry（index-ABImDspU）恢复决策记录

- **原始 chunk**：`out/renderer/assets/index-ABImDspU.js`（567 行，22,947 字节；
  pretty 版 jsx 438 行）
- **恢复产物**：`src-reconstructed/modules/rendererEntry.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 依赖 chunk 导出表逐一映射
- **定性**：**ZCode first-party 渲染进程入口**（全量恢复——567 行未超阈值，
  无需仅解 bootstrap 段；实际上本 chunk 也全部是 bootstrap 性质的代码）

---

## 1. 模块定性

入口副作用模块（无导出），按执行顺序分 8 段：

| 段 | 内容 |
|---|---|
| 1 | 启动闸门：splash logo 动画（或 1s 超时/减弱动效/更新小窗直通）× React 就绪事件（或 3s 超时）双信号汇合后加 `zcode-startup-ready`、500ms 后移除 `#loading` |
| 2 | `RendererServiceRegistry`：MessagePort 协议客户端 -> 34 个类型化服务代理 |
| 3 | 启动日志（本地禁用判定，避免与 logger 循环依赖）+ `connectViaMessagePort` |
| 4 | 平台桥：`embeddedBrowserPlatformBridge`（内嵌浏览器子桥）+ 会话服务合并/直通 |
| 5 | 启动标记（`__ZCODE_RENDERER_START__`/`__ZCODE_LAUNCH_MARKS__`）、E2E 桥按需动态加载、主题引导（`zcode-theme`）、平台类名 |
| 6 | 查询参数裁决（restoreSession/supportsSettings/initialWorkspace*/windowKind/locale） |
| 7 | `desktopPlatformBridge`：约 90 个方法的 `window.zcode` 门面 |
| 8 | `window.message` 总分发（提示音/会话端口/主端口）+ 根渲染（AppProviders→ZCodeIntlProvider→ZCodeApp；update-status 小窗独立渲染 UpdateStatusWindow） |

## 2. 符号决策表（摘要）

完整映射见恢复版尾符号表。关键判定：

### 2.1 styles 主 chunk 导入（45 个）

34 个服务通道描述符全部经 `styles-CdEGpc2x.jsx` 行 32084-32135 的
`PS(vt.<Service>)` 定义与 `src-HCld2afU.jsx` 行 8574 的 ServiceId 枚举
（`Pb`，34 个 `kebab-case` 通道名）双重对照命名，如：
`A->bAe->PS(vt.ZCodeSession)` = zcodeSessionChannel、`F->pAe->PS(vt.Setting)` =
settingChannel。其余 11 个：

| 别名 | 内部名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|---|
| `G` | `ise` | `MessagePortChannelClient` | **高** | `new o(e)`（e=MessagePort）后经 `ProtocolClient` 包装；`client.onDidInitialize` |
| `W` | `ase` | `ProtocolClient` | **高** | `new fe(new o(e))` + `onDidInitialize` + `getChannel` |
| `U` | `Us` | `ServiceProxy` | **高** | `Us.toService(...)` Proxy 化调用（`e.call(r, i)`/`e.listen`），styles jsx 2955-2975 |
| `H` | `xse` | `registerRemoteSession` | **高** | `Zs.getState().registerSession(e)` + zcodeAgentService 预热，styles jsx 3241 |
| `V` | `Sse` | `registerBaseServices` | **高** | `Zs.getState().registerBaseServices(e)`，styles jsx 3244 |
| `a` | `g8t` | `ZCodeApp` | **高** | 根组件，接收 services/platform/restoreSession/initialWorkspace* 全套 props |
| `i` | `v8t` | `UpdateStatusWindow` | **高** | update-status 小窗渲染，props {platform, initialLocale, onRequestClose} |
| `o` | `ekt` | `AppProviders` | **高** | 类组件（extends Component），isDesktop/isMacDesktop/isWindowsDesktop props |
| `n` | `C8t` | `recordArmsCustomEvent` | **高** | `__zcodeArmsCustomEventsE2E` 环形缓冲（上限 200），styles jsx 170377 |
| `r` | `x8t` | `playTaskNotificationSound` | **高** | `<audio>.pause()/currentTime=0/play()`，styles jsx 170369 |
| `s`/`t` | `WOt`/`T8t` | `setPlatformBridge`/`setRendererDeviceId` | **高** | 调用点 `d(X)`（平台门面对象）/`f(X.getDeviceId())`；T8t 生成 `renderer:<id>` 前缀，空值回退 `renderer:fallback-<随机>` |

### 2.2 其余导入

| 来源 | 别名 | 语义名 | 把握度 |
|---|---|---|---|
| imeComposition-DEYFkwWm.js | `P`->`ae` | `reactDomClient`（createRoot） | **高**（`e.createRoot = function...` 定义在 jsx 8139） |
| IntlProvider-C321H7m8.js | `t` | `ZCodeIntlProvider` | **高**（本批次已恢复该模块） |
| src-HCld2afU.js | `Ps/St/ct/ft/no/st/ut` | `DEFAULT_LOCALE`/`RendererMessage`/`parseLaunchMarks`/`DesktopCommand`/`transportFrameLimits`/`LAUNCH_MARKS_QUERY_PARAM`/`createRendererTelemetryContext` | **高**（逐个经源码行确认：行 1/8612/8804/8745/6932/8803/8774） |
| preload-helper-BHSF1fZ9.js | `t` | `preloadModule`（动态 import 包装） | **高** |

### 2.3 本地符号（42 个）

全部高把握度（函数体自证）：启动闸门 9 个、服务/协议 9 个、平台桥 5 个、
查询参数 8 个、其余 11 个（见恢复版尾符号表）。

## 3. 把握度分布

**命名决策（共 87 个符号 = 45 styles 导入 + 7 src/其它导入 + 35 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **86** | 通道描述符（枚举双重对照）、协议/服务（调用点自证）、启动逻辑（字面量自证） |
| 中（`// TODO(infer)`） | **1** | `DesktopBridge`（window.zcode 约 90 个方法的完整类型——接口在 preload 脚本，按调用点建模为 any 门面） |
| 低 | **0** | — |

## 4. JSX 还原说明

两处 `createRoot(...).render(...)` 树还原为 JSX（AppProviders→
ZCodeIntlProvider→ReactStartupReadyMarker→ZCodeApp；update-status 分支
AppProviders→ReactStartupReadyMarker→UpdateStatusWindow）。props 逐字保留
（含 `initialWorkspacePurpose === 'conversation' ? 'conversation' : 'project'`
的归一化）。

## 5. 行为等价性说明

- 启动闸门的信号顺序、`{once: true}`、1s/3s 超时、500ms 移除延迟逐字保留；
- 主端口一次性闭锁（`Z`）与会话端口队列（`Y`）语义逐字保留；
- `target.kind === 'server'` 直通 vs 会话合并分支逐字保留；
- 主题引导的 system/dark/light/zai-* 归一化链逐字保留；
- E2E 桥动态加载的 `__vite__mapDeps` 依赖清单（6 个 chunk）以数组形式保留；
- 唯一文本级差异：逗号表达式展开（`window.__ZCODE_RENDERER_START__ = Le,
  window.__ZCODE_LAUNCH_MARKS__ = Re, ze()` -> 三条语句），无可观察差异。

## 6. 验证

- **esbuild 解析**：0 错。
- **运行时等价检查不可行的原因**：入口模块在导入期即执行 DOM 操作
  （`document.querySelector/.getElementById`、`window.matchMedia`、
  `localStorage`、`navigator.userAgent`、`window.addEventListener`），
  Node ESM 无法加载原始 chunk（无 DOM）；其等价性由逐语句对照承担。
  模块内可独立加载的纯逻辑（查询参数裁决、主题归一化）已逐行核对。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
