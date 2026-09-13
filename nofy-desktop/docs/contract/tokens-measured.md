# 设计令牌实测账（S0）

采集：2026-09-09。提取器 `apps/desktop/scripts/extract-tokens.ts`，
源 `/Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-BxSv8qTx.css`（只读参照）。
产物：`apps/desktop/renderer/ui/themes/zcode.json`（数据）与
`apps/desktop/renderer/ui/tokens.css`（由 JSON 同源重生成，**不手改**）。

干净室边界：只提取「自定义属性名 → 值」这一事实层；**一条选择器规则都不搬**。
界面所有布局/组件规则是本项目手写的（`renderer/ui/styles.css`），只消费变量。

---

## 1. 规模与作用域

源内自定义属性 **1176** 条，解析到 **1176**（解析器两处历史 bug 已修：块尾无分号声明、
Tailwind 选择器里的反斜杠转义）。跳过 `--tw-*` 框架内部量 401 条，
distinct 令牌 **330** 个，作用域 **9** 个（**源码首见序**，即级联序）：

| # | 作用域（含 at-rule 包裹） | 令牌数 | 语义 |
|---|---|---|---|
| 1 | `@layer theme` → `:root, :host` | 302 | 亮色基线 |
| 2 | `@layer theme` → `@supports(color-mix)` → `:root, :host` | 18 | 亮色的 color-mix 精修 |
| 3 | `:root`（unlayered） | 1 | `--ui-font-size: 14px` |
| 4 | `.dark`（unlayered） | 131 | 暗色覆盖层 |
| 5 | `@supports(color-mix)` → `.dark` | 35 | 暗色的 color-mix 精修 |
| 6 | `.theme-zai-light` | 131 | zai 亮 |
| 7 | `@supports(color-mix)` → `.theme-zai-light` | 8 | |
| 8 | `.theme-zai-dark` | 131 | zai 暗 |
| 9 | `@supports(color-mix)` → `.theme-zai-dark` | 8 | |

主题切换 = 往 `<html>` 挂 class（`renderer/ui/theme.ts`）：`dark` / `theme-zai-light` /
`theme-zai-dark` / 不挂（亮）。浏览器自己的层叠就是主题引擎，不另造运行时注入。

## 2. ⚠ 级联层（@layer）是令牌语义的一部分——拍平即坏

**症状**（首屏截图抓到）：暗色下所有 plain chip「看得见灰块、看不见字」；
左栏会话副标题几乎不可读。数据全对、布局全对，只有颜色错——最难查的一类。

**取证**：`NOFY_DEBUG_DOM=1` 让 main 用 `webContents.executeJavaScript` 打
`getComputedStyle`。结果：`html.dark` 下 `--color-foreground-subtle` 的计算值是
**亮色作用域**的 `oklab(37.1% 0 0 / .6)`，而 `.dark` 明明声明了 `oklab(92.2% …)`。

**根因**：提取器第一版只发叶子选择器，把 `@layer theme` / `@supports` 包裹丢了。
源里 `.dark` 的 color-mix 覆盖是 **unlayered**，`:root` 的同名覆盖在
`@layer theme` 里；按 CSS 规则 **unlayered 压过 layered**，与文档序无关。
拍平后两者同特异性、按文档序决胜，而源序里 `:root` 的那份在后 ⇒ `:root` 赢 ⇒ 暗色失效。

**修复**：提取器按源保留 at-rule 包裹链（`extract-tokens.ts` 的 emit 段），
作用域序改为首见序（原先按令牌数排序，同样是改写级联）。

**纪律**：任何「优化」令牌产出的改动（合并块、排序、去重、minify 配置）都必须先问一句
「这会不会改变级联决胜？」。令牌不是数据表，是带优先级的样式声明。

## 3. 构建产物里的降级双发（读 dist 时别误判）

vite 的 CSS 管线（lightningcss）会把 `oklab()` 降級成 hex 回退 +
`@supports (color: lab(0% 0 0))` 里的 lab() 精值**双发**。故 dist 的 CSS 里每个作用域
出现两次。这是等价变换，不影响语义；但用 grep 读构建产物核对令牌时要知道这件事，
否则会把「两条同名声明」当成提取器重复发块。

## 4. 视觉自检工作流（S0 起成为常规手段）

1. `NOFY_SCREENSHOT=/tmp/x.png NOFY_SCREENSHOT_DELAY=8000` 启动 ⇒ main 在首屏后
   `capturePage` 落盘。`NOFY_SCREENSHOT_QUIT=1` 截完即退（CI 用）。
2. `NOFY_WINDOW_X/Y` 给窗口一个确定锚点，便于把截图像素换算成屏幕坐标做点击自检。
3. `NOFY_DEBUG_DOM=1` 打计算样式——截图只能告诉你「不对」，它告诉你「为什么」。
   （该钩子已用完即删；流程留档，需要时按同一形状临时加回。）
4. 真键盘路径用 CUA 走元素级操作（AX 树完整暴露了输入框/按钮/脊柱），
   验的是「用户真的能这么用」，不是「渲染函数跑得通」。

## 5. 改视觉的正确顺序

改 `themes/zcode.json` → `pnpm tokens` → 看截图。只有**结构**变化才动
`styles.css`。不在 `styles.css` 里写死颜色值（写死＝绕过主题引擎＝暗色下再出一次 §2）。
