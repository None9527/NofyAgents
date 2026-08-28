# DELETED-CLOUD-LEDGER — D5b v2（ZCode 内置云联路代码清除）

范围：`out/main/index.js`、`out/host/index.js`、`out/scheduler/index.js`、`out/preload/index.cjs`、`out/renderer/assets/styles-CdEGpc2x.js`。
行号均为**编辑前原始行号**。净删除约 **30,500 行**（main -8,317 / host -20,642 / scheduler -1,406 / preload ~-105；renderer 为点状改写）。
验证：`node --check` 四文件全过；renderer 用 `npx esbuild` 解析 0 错；重启截图 `/tmp/zcode-d5b-final2.png`（无登录墙、无 banner、直接主 UI）；host/main 日志无网络报错、无悬挂异常（仅存环境性 “ZCode Agent runtime is not running”，与云联路无关，系 dev 布局 agent 二进制解析问题，预先存在）。

接线缝（保留，非云桩）：`out/main/seam/nofy-backend.js`（CommonJS，导出 `{ brand:'Grok Build', agentTransport:'acp-ws', url:'ws://127.0.0.1:9800/ws', auth:'local' }` + `TODO(D5c)`；main 暂不 require）。

---

## 1. OAuth / 云登录（host 9 处、main 6 处、preload 2 处、renderer 0）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| host | 45224-46564 | bigmodelOAuth/zai 适配器、`oauthCredentialRepo`(wo)、token 校验/刷新/登出网络调用、`createOAuthService` 云实现、`createOAuthProviderLogoutHandler`、OAuth runtime config、redirect URI/env 构建 | 新 `createOAuthService` 本地实现：`restoreCachedSession/State` 返回冻结常量 `LOCAL_USER_PROFILE`（`{id:"local-user",username:"local",displayName:"Local User"}`，稳定引用防渲染循环）；`getProviders()=[]`；`logout*` 本地空操作。启动即已登录，登录墙不再出现 |
| host | 70416-70718 重写 | `createLocalServices` 中 wo repo、logout handler、node-api-client 云选项、repo-snapshot 机制、feedback 注册、bots 注册 | 组合根重写；`va` 通道注册本地 OAuth 服务 |
| host | 69680-69821 重写 | remote(SSH/WSL) 服务集合中的云 OAuth/logout/apiClient 接线 | remote 集合同样注册本地 OAuth 服务 |
| host | 71842-71859 | InitRemoteWorkspace 中 wo/logout/apiClient/zapi 探测接线 | 直接 `createRemoteHostModelProviderService({credentialService})` |
| main | 16094-17327（含） | main 侧 OAuth 服务/凭证库/事件上报(`zcode.z.ai/api/v1/event/report`)/telemetry-core/telemetry-user-id loader 及 lark SDK import | 无外部引用，整段删 |
| main | 25582-25607, 25975-26245 | deep-link OAuth/payment 路由、`parseOAuthStateRegistration`、`registerOAuthState`、`Ai/Eu/Au` 状态、payment 回调 | `handleDeepLink` 仅保留 workspace-open；`deliverPendingDeepLink` 仅投递 workspace；`isCompleteDeepLinkUrl` 仅 workspace 完整度 |
| main | 37198-37228 + registerRemoteIpcHandlers 内 OAuth 分支 | `R.OAuthRegisterState`/`R.OAuthCallbackHandled` handler、web-remote IPC 注册 | RendererReady 仅 `deliverPendingDeepLink` |
| preload | registerOAuthState / onOAuthCallback | OAuth state 注册 IPC | `registerOAuthState` 本地 no-op；回调订阅保留形状（永无事件） |
| renderer | — | 登录墙：无需改（host 恒 authenticated；先前 OFFLINE-PATCH-001 已放行启动门禁） | 底栏显示 Local User（UI 文案归品牌 agent） |

## 2. 遥测 ARMS / 自上报（main 12 处、host 4 处、preload 3 处）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| main | 16534-16777 | `@arms/rum-electron` import、parseArmsViewName、deviceMid 同步、网络统计聚合器 | 无外部引用 |
| main | 17121-17462 | reportNetworkCustom/flush、ingestArms*、configureDesktopNetworkTelemetry、web-remote relay 遥测、crash 事件过滤、ARMS init(jv)、createArmsUserIdentitySync | 启动序列删除 `Mb.refresh()/configure*Telemetry/register*` 块 |
| main | 24592-24602 | createDesktopTelemetryFetch | 无引用 |
| main | 25284-25371 | createAppLaunchGate/Coordinator/AppTelemetryRuntime | 消费者($p/Rte/qb)同删 |
| main | 30850-31303 | 资源遥测（role 采样/聚合/report） | host 消息分支 `te.AgentResourceSample`、`te.NetworkTelemetryBatch`、`te.FeedbackLogArchiveRequest` 删除 |
| main | 37080-37198 | ARMS E2E final custom event 控制器 + reportRemoteUsageEventSafely | `R.Report*` handler、E2E preload 暴露同删 |
| main | 37485-38010 | stability ARMS（agent crash 上报、render-process crash 分类、ANR/freeze、窗口稳定性监控、registerDesktopStabilityMonitors） | createWindowInstance 去 `registerStabilityMainWindow`/`deviceMid`；quit 流程去 `notifyStabilityAppExit` |
| main | 38590-38634 | Ga(端点解析)/qb/$p 遥测运行时、syncAppTelemetryInteractiveState、reportRemoteUsageEventForRenderer | focus/blur 仅 `rebuildMenu()` |
| main | 39652-39659 | 启动 `configureDesktop*Telemetry/registerDesktop*` 块 | 直接删 |
| host | 380-407 | host 网络遥测注册/上报 | `registerHostNetworkTelemetry(tt)` 删除 |
| host | 68835-68855(orig) | buildAgentTelemetrySpawnEnv（OTEL/deviceMid spawn 环境） | resolveSpawnEnv 仅保留 proxy env |
| host | InitLocal agentTelemetry/feedback 选项 | deviceMid/feedback 选项 | 删除选项 |
| preload | 7-61 + 调用点 | arms:rum-bridge 转发、`__zcodeFinalArmsCustomEventsE2E` 暴露、shouldEnableE2ETestBridge | 整删 |
| preload | syncTelemetryContext/reportTelemetryEvent/reportArmsCustomEvent | 上报 IPC | 本地 no-op（renderer 3000+ 调用点免改，遥测不出 renderer 进程） |

## 3. electron-updater 云检查（main 10 处、preload 1 组）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| main | 24783-25867 | updater 状态机、initAutoUpdater、检查/下载/quitAndInstall、release channel、update-status 窗口数据 | 关于页版本信息保留静态值（`me`/`pe.getVersion()`） |
| main | 24592-24706 | requestForceAutoUpdate、checkForUpdateMenuClick | 菜单项删除 |
| main | 29391-30108 | 强制升级远端配置 fetch + 拦截启动门 + 提示窗 HTML | 启动序列删 `maybeBlockStartupForForceUpdate` 块；second-instance/open-url/canCreateWindow 去 `Up`/`focusForceUpdateGateWindow` |
| main | 33913-34091, 34552-34687 | Windows 更新进程清理链、prepareWindowsProcessesForUpdateInstall | quit 流程删调用 |
| main | 34486-34494, 34724-34845 | getAutoUpdatePreferences/setAutoDownloadAndInstallUpdates、update-status 窗口创建/同步 | IPC handler、平台接线、createWindowInstance 同步选项同删；`syncImmediateAppSettings` 去 receivePreviewUpdates 分支 |
| main | 菜单模板 | darwin/非 darwin CheckForUpdates、WhatsNew 项 | 删除 |
| preload | getUpdateState/downloadUpdate/openUpdateStatusWindow/quitAndInstallUpdate/… | 更新 IPC | 本地常量：`{kind:"idle"}`、`{autoDownloadAndInstallUpdates:false}`、no-op；订阅保留形状 |

## 4. 模型供应商云同步 / 可用性网络检查（host 8 处、main 1 处、renderer 0）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| host | 42063-42314, 42358-42531 | remote-only preset 模型合并链、OAuth preset upsert | readProviders 迁移链不再触碰 OAuth preset |
| host | 42532-42579, 42610-42637 | deviceMid/ZCode-source 请求头、zcode-endpoint 头特判 | `Lp.request` 简化为 `withRequestIdHeader(n?.headers)` |
| host | 42711-43160 | 连接性测试(testOpenaiEndpoint/testModelProviderConnectivity/testSingleEndpoint)、createModelProviderPresetSync、filterUnavailableZapiProvider | **testModelConnectivity 返回常量 `{results:[{success:!0}]}`（状态常量 usable）** |
| host | 43161-44307 | coding-plan 可用性域（client-configs fetch、zai/bigmodel 权益校验、team-plan API key、entry-status 缓存） | 模型服务重写：`getAll/getAllCached` 仅本地读 + family domain；`getEndpointSuggestions/getModelsByEndpoint` 空；`refreshCodingPlanApiKey/clearCodingPlanApiKey` 空 |
| host | 44735-45297 重写 | buildProviderRegistrySnapshot 云密钥解析、createModelProviderService 云同步 | 快照仅 family 过滤 + runtime headers + revision；**供应商列表只从本地 `resources/model-providers` 目录读（getCatalogProviders 保留）；`markLocalProvidersUsable` 将 `apiKeyRequired` 置 false（本地常量 usable，home 门禁 ready，无“无可用模型”banner）** |
| host | 23805 补丁 | `forceCodingPlan: !!MM(n)` | 常量 `!1` |
| main | 16689-16892 区域 | main 侧副本（随 16094-17327 整段） | 无引用 |
| renderer | — | 无需改（可用性不再依赖网络；connectivity 常量 usable） | — |

## 5. 移动端远程控制 / web-remote（main 6 处、host 1 处、preload 1 组、renderer 1 处）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| main | 28257-29864 | createWebRemoteControlManager、relay WS 类、relay auth provider/storage、feature gate、reconnect/status 推送 | `Kb.current` 恒 null（`?.` 守护）；窗口 closed 去 `disposeWindow` |
| main | 31409-31498 | createWebRemoteControlSharedHostAttachments | mt/启动接线删除 |
| main | 37198-37228 + 平台 IPC | registerWebRemoteControlIpcHandlers、SyncWindowTabs 内 restore、SyncWebRemoteControl* handler | 删除（修掉 `e.restorePreviouslyEnabledWebRemoteControl is not a function` 悬挂） |
| main | mt/createWindowInstance 接线 | webRemoteControlManagerRef、bot handler、off-peak 回调、ARMS 回调 | 选项删除（spawnHostProcess 全为 `?.` 可选） |
| host | off-peak/bot relay 消息分支保留为协议守护 | — | 无消息源 |
| preload | start/stop/get/refresh WebRemoteControl | 控制 IPC | 本地常量 `{status:"idle"}`/no-op |
| renderer | 150100 `iRt = !0` → `!1` | web-remote 功能门默认值 | 侧栏段/设置项/quickpick 命令全部隐藏（同一 context 门） |

## 6. off-peak 云算力 / 订阅 / 计费 / 权益（host 6 处、main 3 处、scheduler 6 处、preload 0）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| host | 52564-53430 区域 | Vo/Iv client-configs/支付/计费/team 产品、`resolveOffPeakClientConfig`、`unwrapClientConfigForceUpdate`、captcha clientconfig | 本地 `createCodingPlanSubscriptionService`：产品空、`getOffPeakClientConfig()=null`（**banner 数据源消失**）、`getModelContextBudgetStrategy()=ds`、`getCaptchaConfig()=null`、`getForceUpdateConfig()=null` |
| host | 51426-52563 | bigmodel/zai 用量监控 fetch、Pv/Iv | 本地 usage 服务：app 用量走本地 agent 统计；**权益 = 一行常量 `LOCAL_USAGE_ENTITLEMENT = "unlimited"`**（冻结快照返回） |
| host | 56196-58062 | off-peak sqlite repo(Sc)、mock gateway、ticket client(`/api/v1/off-peak/ticket/*`)、凭证解析、Gm 服务、buildAgentTelemetrySpawnEnv | 本地 `createOffPeakTaskService`：`list()=[]`、`getCodingPlanSupport()={supported:!1}`、takeNumber 不可用（冻结引用） |
| host | 55646-55861 + 消息分支 | dispatchOffPeakRun/ensureOffPeakRuntime/settle/`OffPeakRun` handler、dispose | 删除；cron dispatch 保留 |
| main | 38563-38574, 39490 选项, mt 接线 | forwardOffPeakRunResult/wakeOffPeakScheduler、spawn 选项 | 删除 |
| scheduler | 35283-35786, 35789-35861, 35888-35937, 36052-36089, tick/dispose/main 分支 | off-peak repo、ticket schema、claim/settle、offpeak-dispatch 处理 | tick 仅 cron manual runs；main() 仅 cron |
| renderer | — | banner：`getOffPeakClientConfig()=null` → grayConfig null → `kit` banner 不渲染 | 截图确认无 banner |

## 7. Aliyun captcha（host 1 处、renderer 3 处）

| 文件 | 行范围 | 删了什么 | 调用点收尾 |
|---|---|---|---|
| host | 44571-44592 区域（随 44426-44734 删除） | `omitAliyunCaptchaHeaderFromProviderHeaders`、start-plan/team-plan 运行时头注入 | buildProviderRegistrySnapshot 重写后不再注入/剥离任何 captcha 头 |
| renderer | 40521 `Cw` | 3007/CAPTCHA 错误分类 | 恒 `undefined` → 重试流永不触发 |
| renderer | vNe `3007: \`retry-captcha\`` | 错误横幅动作 | `null` |
| renderer | `kSt` 脚本注入器 | `o.alicdn.com/.../AliyunCaptcha.js` `<script>` 注入 | 直接 `Promise.reject`；且 `getCaptchaConfig()=null` 使流程前置退出 |

## 8. 其余出站调用点验（逐条）

| 调用 | 结论 | 处理 |
|---|---|---|
| `zcode.z.ai` / `chatglm.cn` / `bigmodel.cn` 业务 API（oauth token、event report、client/configs、snapshot upload-credential、off-peak ticket、feedback） | 纯云 | 全删（见上） |
| `aliyuncs` / `arms` ingest | 纯云遥测 | 全删 |
| `accounts.feishu.cn` / `accounts.larksuite.com`（bot 注册向导） | 纯云（bots） | 删 |
| `api.telegram.org` / `open.feishu.cn` / webhook（bot 通道） | 纯云（bots） | 删（bots 域整体） |
| node-api-client 通用 fetch | 非纯云：repo-wiki 模型调用走用户自配供应商 endpoint | 保留通用 client，剥离 ZCode 端点特判/deviceMid 头 |
| SSH/WSL/Docker remote 资产 CDN（`cdn.codegeex.cn` 等）与 CUA helper 下载 | 本地功能供给链（F10/CUA），非账号/遥测/计费联路 | **保留**（记档） |
| 模型供应商 endpoint（moonshot/deepseek/… 目录 baseURL） | 用户本地配置的 LLM 推理目标，D5c 将切 nofy | 保留 |
| `zcode.invalid`（crash 占位 URL） | 无网络 | 保留 |
| scheduler `13041-13156` 端点常量块 | 纯云端点解析 | 删 |

## 遗留悬挂

0。`node --check` ×4、esbuild renderer 解析、运行时日志（无 ReferenceError/TypeError/is-not-a-function、无 ENOTFOUND/ECONNREFUSED）三重验证。
