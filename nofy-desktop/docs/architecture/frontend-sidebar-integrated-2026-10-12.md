# 左栏极限折叠、整体页脚与命中区域（2026-10-12）

用户明确撤销缩小控件的做法，并反馈底部设置独立悬浮、顶部按钮在真实窗口仍不能使用。上一轮仅验证DOM点击与CSS属性，未覆盖原生命中，不能据此宣称该问题完全修复。

## 当前实现

- 移除导航/工具行的缩小容器查询，保留28px导航按钮、24px工具按钮、32px页脚按钮的原尺寸。
- 最小左栏宽240px。拖到下限以下直接折叠，仍保留展开入口；过窄旧偏好读入时折叠并保存有效宽度。窗口空间不足以保留530px主列时折叠，并将下次展开宽度限制到默认264px。
- 诊断与设置共用sidebar__footer-card背景、边框、圆角与布局，设置仍可操作；版本长度限制在本行内。
- WindowNavigation改为普通absolute no-drag岛：移除container-type、pointer-events:none，固定Mac交通灯之后的位置。在DOM中位于侧栏与卡片拖动区域之后。该调整针对拖动区域覆盖命中的可能机制，尚不能替代真实OS点击验证。

## 验证与限制

GitNexus SidebarFoot/loadLayoutInner/App LOW，ShellLayout/WindowNavigation UNKNOWN，实际调用点已核对。未改内核、协议或凭证。

pnpm verify：423单测、类型/架构/样式、构建与三类smoke通过。隔离Electron：左栏8/8、主页12/12通过；验证极限折叠、图标原尺寸、持久化、布局、菜单、新建/前进/后退与命中区DOM属性。主页modal场景先恢复默认宽左栏，以适配新增自动折叠策略。

真实原生UI工具 getApp 因ScreenCaptureKit -3811失败；按bundle id选择又发现Nofy/Nofy 2共用id，已确认实际运行进程来自release/mac-arm64/Nofy.app。没有删除副本，也没有将副本问题冒充原因。原生鼠标点击未验证，不能声称20项Electron/CDP验收覆盖了该项。

GUI报告：output/playwright/sidebar-2026-10-12T06-51-03.697Z/report.json；output/playwright/homepage-2026-10-12T06-51-07.402Z/report.json。使用隔离profile和模拟ACP，没有真实模型请求。

发布包两次隔离启动通过，已重启。新窗口原生UI检查仍返回-3811，因此原生点击复验仍未完成。证据索引：frontend-sidebar-integrated-2026-10-12-evidence.json。
