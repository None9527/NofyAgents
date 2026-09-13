**生态面解剖与裁定（阶段 C 取解剖批，2026-09-12）**

## 1. 形态裁定：生态面住设置面，不做独立滑入面板

旧 PLAN 记「活壳是侧栏 translate-x-full 滑入面板」，本轮拿 3.7.6 逆向树复核后**更正**：
市场/技能/插件/MCP 四面在活壳里是**设置面的分区**，不是独立面板：

| 证据 | 位置（逆向树 desktop/src/src） |
|---|---|
| 设置面根视图 SettingsView | modules/Settings.tsx:879 |
| 分区组件 | components/settings/{Plugins,Skills,Mcp,Commands,Subagents,Hooks,Usage,…}SettingsSection.tsx |
| 「插件市场」是插件分区里的子标题 | lib/i18n/zh-CN.ts:2879 settings.plugins.marketplaces.title |
| 侧栏动作行开设置分区（sessionStorage intent + CustomEvent） | components/shell/Home.tsx:4243 openSettingsSection |
| 插件/市场状态机与 13 个 action | stores/pluginsStore.ts（PluginService 接口逐字可读） |

⇒ 阶段 C 与阶段 D 的 #6 设置面**合并施工**：先立设置面壳（左分区导航 + 右分区体），
首批分区 = 插件（含市场子表）/ 技能 / MCP，全部只读；安装/卸载/启停写路径未实测，
灰按钮 + title 写明（纪律不变）。侧栏「插件市场」行接线 = 开设置面插件分区。

## 2. 四条读路径的线路契约（内核代码为准 + 探针实测双证据）

| 方法 | 参数 | 响应（camelCase） | 证据 |
|---|---|---|---|
| _nofy/skills/list | {cwd} | {skills:[{name,description,path,scope,enabled,userInvocable,disableModelInvocation,hasUserSpecifiedDescription}]} | nofy-shell extensions/skills.rs:101 SkillsListResponse；探针 155 条 |
| _nofy/plugins/list | {sessionId} | {plugins:[PluginInfo{name,id,root,scope,trusted,enabled,version?,description?,skillCount,skillNames[],agentCount,agentNames[],hookStatus,hookCount,mcpServerCount,mcpStatus,marketplaceSource?,origin?,conflict?}]} | nofy-hooks-plugins-types/src/lib.rs:231/279 |
| _nofy/marketplace/list | {} | {sources:[{sourceName,sourceKind,sourceUrlOrPath,error?,plugins:[{name,version?,description?,category?,author?,tags[],keywords[],domains[],homepage?,relativePath,skillCount,hasHooks,hasAgents,hasMcp,installStatus,installedVersion?,components?}]}]} | 同上 :1103 起；探针 292 条 |
| _nofy/mcp/list | {sessionId,cache:false} | {servers:[{name,source,enabled,status?,toolCount,tools[{name,description?}][],configSource?}]} | 同上 :321/337 |

**两处实测与源码不一致，读取器两边都收（已在 readers.ts 注记）**：
1. skills 探针键是 snake（user_invocable / has_user_specified_description），codegen 型是 camel；
2. mcp 探针（装机内核）给 type/command/args/session{status} 族，crates 源码给 enabled/status/toolCount/tools/configSource——装机二进制旧于源码树。

刷新事件：_nofy/mcp/tools_changed 与 _nofy/mcp_initialized（EXT_KERNEL_EVENT，methods.ts:154-155）
⇒ 设置面 MCP 分区订阅这两条做活刷新，不轮询。

## 3. 本批已落（数据层）

- readers.ts：readSkills / readPlugins / readMarketplace / readMcpServers 四纯函数 + 行型；
  脏条目跳过、缺字段兜底（设置面不因一条坏数据白屏）。
- effects.ts：eco/skills、eco/plugins、eco/marketplace、eco/mcp 四请求 effect
  （EXT_CLIENT_REQUEST.skills_list / plugins_list / marketplace_list / mcp_list）。
- 门禁：test/readers-eco5.test.ts 4 例（snake/camel 双键、status 双键、脏条目、计数字段兜底）。
- 下一批（UI）：设置面壳 + 三分区只读列表 + 侧栏「插件市场」接线 + 像素门/亮色走查。
