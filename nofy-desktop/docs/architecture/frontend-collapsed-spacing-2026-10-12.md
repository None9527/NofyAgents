# 折叠左栏后的边距（2026-10-12）

修改前隔离Electron复现：1280px窗口、左栏折叠时，卡片x=0，正文/输入仍限宽896px；输入左边距约190px。原因是展开态的中等宽度规则延用到折叠后的全窗口内容列。

## 当前规则

- 折叠左栏后，main增加4px左padding，与窗口右侧/底部间隔一致。
- conversation容器≥864px时，折叠态正文、输入、审批、队列共用calc(100% - 64px)宽度与1152px上限。小容器沿用原16px边距；空会话的672px引导列保留。
- 标题栏的导航让位只影响标题栏，不作为正文的左padding。

变更只有共享CSS与隔离验收脚本，没有修改TS函数、内核或协议。样式所有者检查、构建、5种窗口宽度专项与12项主页GUI通过。专项核对卡片4px边距、正文/输入对齐、最大宽度与1280px左留白；结果输入宽1152px，窗口左留白约64px（内容容器内59px）。

修改前报告：output/playwright/collapsed-spacing-2026-10-12T08-27-43.306Z/report.json。
修改后报告：output/playwright/collapsed-spacing-2026-10-12T08-28-42.983Z/report.json。
主页报告：output/playwright/homepage-2026-10-12T08-28-46.147Z/report.json。

截图使用合成对话和隔离profile，不含真实模型请求。本轮没有重复声明旧单测/性能基准。

发布包两次隔离启动通过，已重开新版Nofy.app。证据索引：frontend-collapsed-spacing-2026-10-12-evidence.json。
