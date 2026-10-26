# Codex 视觉对照与本轮表面升级

日期：2026-10-14。对象是本机 `/Applications/ChatGPT.app`，版本 26.1007.30912（CFBundleVersion 20156）。只读 `app.asar` 样式，没有启动 Codex，也没有读取会话或凭据。上一轮中栏调研对应的是更早的 build 20052。

## 实测并采用的样式

来源是 `webview/assets/app-shared-9a94b907ed47.css`、`app-initial-99e8b4b455fa.css` 和 `home-49f9c30a8c63.css`。

- 用户气泡：右对齐，最大宽度 70%，圆角 22px，内边距 10px 16px，行高 24px。背景是文字色 5%（浅色）或 8%（深色），没有描边。
- 输入岛：圆角 24px（`--radius-4xl`）。浅色阴影是 `0 0 0 1px #0000000a, 0 2px 8px #0000000a, 0 4px 80px 8px #00000006`。深色另加 `inset 0 0 1px #fff3`。聚焦不再画成表单输入框。
- 空态：标题 28px / 400 / 34px。建议是 44px 高的胶囊，不是三列描边卡片。
- 正文字距约 -0.011em，行高 26px。界面字体是 `-apple-system, BlinkMacSystemFont, "Segoe UI"`。
- 侧栏行高是 `0.25rem * 9`，即 36px。

聊天产品里的蓝色紧凑气泡没有用到本地线程。本轮只改现有选择器的表面，没有加占位功能。
