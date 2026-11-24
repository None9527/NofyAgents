# Markdown 渲染与 Mermaid 图表

## 概述

Grok Build 的 Markdown 渲染系统是一个流式增量渲染引擎，专为终端 UI 中展示 LLM 响应而优化。支持语法高亮、LaTeX 数学公式、Mermaid 图表和超链接。

---

## 一、Markdown 渲染（`xai-grok-markdown` + `xai-grok-markdown-core`）

### 设计理念

- **流式渲染** — Markdown 随着 LLM 输出 chunk-by-chunk 增量渲染，不需要等待完整响应
- **检查点冻结** — 只重新渲染稳定边界后的"尾部"，已确认的内容不再重绘
- **颜色自适应** — 自动检测终端颜色能力，从 truecolor 降级到 256 色或 16 色
- **LaTeX 数学** — `$...$`、`$$...$$`、`\(...\)` 和 `\[...\]` 转换为 Unicode 近似（`$E=mc^2$` → `E=mc²`）

### 核心 API

```rust
// 创建渲染器
let syntect = Syntect::new(include_bytes!("theme.tmTheme"));
let style = MarkdownStyle::default();
let mut renderer = StreamingMarkdownRenderer::new(style, true);

// 流式渲染
for token in stream {
    renderer.push_and_render(&token, Some(&syntect));
    let view = renderer.view();
    // display view.lines
}

// 一次性完整渲染
let (output, checkpoint) = render_markdown_ratatui_full(
    text, style, pretty, Some(&syntect)
);
```

### 模块结构

```
src/
├── lib.rs               # 入口 + 公共 API
├── streaming.rs          # StreamingMarkdownRenderer（核心）
├── parse.rs              # MarkdownParser, ParsedMarkdown
├── render.rs             # 渲染逻辑
├── output.rs             # MarkdownRenderOutput, MarkdownRenderView
├── buffers.rs            # MarkdownBuffers
├── checkpoint.rs         # Checkpoint, CheckpointKind
├── colors.rs             # 颜色检测和适配
├── syntax.rs             # Syntect 语法高亮
├── latex.rs              # LaTeX 数学渲染
├── latex_delimiters.rs   # LaTeX 分隔符规范化
├── mermaid.rs            # Mermaid 集成
├── hyperlinks.rs         # 超链接处理
├── url_scan.rs           # URL 扫描
├── source_map.rs         # SourceMap
├── style.rs              # MarkdownStyle, TableBorders
├── open_code_highlighter.rs # OpenCode 高亮器
└── fuzz/                 # Fuzzing 目标
```

### 流式渲染管道

```
LLM 输出 token "## Hello **wor"
    │
    ▼
StreamingMarkdownRenderer::push_and_render(token)
    │
    ▼
parse.rs → MarkdownParser 解析为 AST
    │
    ▼
render.rs → 渲染 AST 为 ratatui Lines
    │
    ├── 检查是否有新的稳定 checkpoint
    │   ├── 是 → 冻结已确认的内容
    │   └── 否 → 只重新渲染尾部
    │
    ▼
output.rs → MarkdownRenderOutput
    │
    ├── lines: Vec<Line> — ratatui 行
    ├── hyperlinks: Vec<HyperlinkTarget> — 检测到的链接
    └── code_blocks: Vec<CodeBlockSpan> — 代码块
    │
    ▼
view() → MarkdownRenderView
    │
    └── TUI 渲染
```

### 检查点系统

`Checkpoint` 是流式渲染的核心——标记 Markdown 中的稳定边界：

- **CheckpointKind** — 不同类型的检查点（段落结束、代码块结束等）
- 只有检查点之后的内容需要重新渲染
- 检查点之前的内容被"冻结"，不再修改

### 语法高亮（`syntax.rs`）

使用 **syntect** 引擎进行代码语法高亮：

- `Syntect::new(theme_bytes)` — 创建高亮器
- 支持主题文件（`.tmTheme`）
- 使用 `two-face` crate 提供语法定义集
- 颜色适配：truecolor → 256 → 16 色自动降级

**关键函数：**
- `adapt_color()` — 适配颜色到终端能力
- `adapt_style()` — 适配样式
- `detect_color_level()` — 检测颜色级别
- `get_color_level()` — 获取当前颜色级别
- `set_color_level_cap()` — 设置颜色级别上限
- `polarity_safe_syntax()` — 极性安全语法（亮色/暗色主题）

### LaTeX 数学渲染（`latex.rs`）

将 LaTeX 数学公式转换为 Unicode 近似：

| 输入 | 输出 |
|------|------|
| `$E=mc^2$` | `E=mc²` |
| `$\alpha + \beta$` | `α + β` |
| `$$\sum_{i=1}^{n} x_i$$` | 多行 Unicode 近似 |

**分隔符规范化（`latex_delimiters.rs`）：** `LatexDelimiterNormalizer` 将混合分隔符（`$...$`、`$$...$$`、`\(...\)`、`\[...\]`）统一处理。

### 超链接处理（`hyperlinks.rs` + `url_scan.rs`）

- 检测 Markdown 链接和裸 URL
- `url_scan.rs` — 后处理扫描，检测 pretty-mode 的 `(url)` 后缀
- `HyperlinkTarget` — 链接目标类型

### 表格渲染

`TableBorders` — 控制表格边框样式，适配不同终端宽度。

### 模糊测试（`fuzz/`）

Markdown 解析器有专门的 fuzzing 目标，确保解析器对任意输入不会 panic。

---

## 二、Markdown 核心（`xai-grok-markdown-core`）

提取出的 Markdown 解析核心，不依赖 ratatui 或终端特定类型。使用 **pulldown-cmark** 作为底层解析器。

---

## 三、Mermaid 图表渲染

### `xai-grok-mermaid`

Mermaid 图表渲染集成，将 Mermaid 语法转换为终端可显示的格式。

### 第三方库

```
third_party/
├── dagre_rust/           # Dagre 图布局算法
├── graphlib_rust/        # 图数据结构库
├── mermaid-to-svg/       # Mermaid → SVG 转换
└── ordered_hashmap/      # 有序哈希表
```

**渲染流程：**

```
LLM 输出 ```mermaid 代码块
    │
    ▼
mermaid-to-svg 解析 Mermaid 语法
    │
    ▼
dagre_rust + graphlib_rust 计算图布局
    │
    ▼
生成 SVG
    │
    ▼
转换为终端可显示格式（或离线程 SVG 渲染）
    │
    ▼
TUI 显示
```

### 离线程渲染

Mermaid 渲染在独立的 worker 线程中执行（`xai-grok-pager/src/app/mermaid_worker.rs`），避免阻塞 TUI 主循环。每个会话有独立的 Mermaid 缓存。

---

## 四、渲染原语（`xai-grok-pager-render`）

从 pager 中提取的表示层原语：

| 模块 | 职责 |
|------|------|
| `appearance` | 外观/主题配置 |
| `theme` | 主题系统（明/暗、颜色方案、系统外观监控） |
| `syntax` | 语法高亮管理 |
| `terminal` | 终端能力检测（Kitty 协议等） |
| `glyphs` | 图标/字形 |
| `clipboard` | 剪贴板集成（arboard、wl-clipboard） |
| `link_opener` | 链接打开（webbrowser） |
| `host` | 宿主环境信息 |
| `render` | 渲染辅助函数 |
| `modal_window_state` | 模态窗口状态管理 |
| `prompt_images` | 提示词中的图片处理 |
| `util` | 渲染工具函数 |

---

## 五、ratatui 扩展

### `xai-ratatui-inline`

ratatui 的内联渲染扩展，支持在滚动历史中内联渲染内容。

### `xai-ratatui-textarea`

自定义文本区域输入组件，支持：
- 多行编辑
- 光标移动
- 文本选择
- 剪贴板操作
- 自动缩进
- 括号匹配

---

## 六、编辑 Diff 高亮

`xai-grok-pager/src/app/edit_highlight_worker.rs` — 离线程的语法高亮升级器，用于编辑 diff 的完整文件语法高亮。避免在主线程中阻塞 TUI 渲染。
