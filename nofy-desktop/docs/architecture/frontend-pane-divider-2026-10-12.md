# 中右栏单线分隔（2026-10-12）

按用户提供的Codex截图，将中栏和右栏接缝改为简单通顶直线：分隔占位1px、拖拽热区8px；默认边框色，悬停加深。中栏右边框和右栏左边框去掉，接缝侧圆角为0，外部窗口角保留。小窗口modal不采用该并排接缝规则。

改动限于共享布局CSS和PANE_HANDLE_WIDTH常量（2→1）。GitNexus未收录该常量；实际使用点为resolveConversationSplit的可用宽度计算。未修改函数或协议。

样式所有权检查、构建通过。布局契约8/8；主页GUI12/12，验证1px净占位、单边框、无接缝圆角、通顶热区、拖拽、各窗口/左右栏组合及modal行为。GUI报告：output/playwright/homepage-2026-10-12T08-38-55.671Z/report.json；截图thin-pane-gap.png。隔离合成对话，无模型请求。

发布包两次隔离启动通过，已重开新版Nofy.app。证据索引：frontend-pane-divider-2026-10-12-evidence.json。
