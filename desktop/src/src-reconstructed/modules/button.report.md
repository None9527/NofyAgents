# button 恢复决策记录

- **原始 chunk**：`out/renderer/assets/button-laUijeDG.js`（186 行，7,451 字节）
- **恢复产物**：`src-reconstructed/modules/button.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 逐行对照 node_modules 上游
- **定性**：**混合件** —— vendored lucide-react@1.17.0（工具函数 + Icon 基建 +
  4 个图标）+ vendored class-variance-authority@0.7.1（内联副本）+
  **ZCode first-party 的 buttonVariants 与 Button**（chunk 得名于此）

---

## 1. 模块定性

| 成分 | 来源定性 | 证据 |
|---|---|---|
| `mergeClasses`/`toKebabCase`/`toCamelCase`/`toPascalCase`/`hasA11yProp` | vendor：lucide-react@1.17.0 `dist/esm/shared/src/utils/*.mjs` | 逐字节一致 |
| `defaultAttributes` | vendor：lucide-react `defaultAttributes.mjs` | 逐字节一致 |
| `LucideContext`/`LucideProvider`/`useLucideContext` | vendor：lucide-react `context.mjs` | 逐语句一致 |
| `Icon` | vendor：lucide-react `Icon.mjs` | 逐语句一致（含 absoluteStrokeWidth 换算与 aria-hidden 短路） |
| `createLucideIcon` | vendor：lucide-react `createLucideIcon.mjs` | 逐语句一致 |
| `ChevronLeft/ChevronRight/ZoomIn/ZoomOut` | vendor：lucide-react `icons/*.mjs` | iconNode 逐字节一致（含 key 哈希） |
| `cvaValue`/`cva` | vendor：class-variance-authority@0.7.1（**内联副本**，未走 bundle-mjs 中的 cva 导出 `n`） | 与 cva 0.7.1 dist 逐语句一致 |
| `buttonVariants`/`Button` | **ZCode first-party** | shadcn/ui 风格 data-slot 约定 + ZCode 设计系统类名（`text-ui-base`、`warning` 变体、`icon-*` 尺寸族、`has-data-[icon=...]` 间距规则） |

## 2. 符号决策表

### 2.1 导入符号

| chunk 内名 | 导出别名 | 语义名 | 来源 | 把握度 |
|---|---|---|---|---|
| `r` | `t`（dist-vnZIbudW.js） | `Slot` | @radix-ui/react-slot@1.2.3 打包件（`dist-vnZIbudW.jsx` 含 composeRefs/useComposedRefs/Slot） | **高** |
| `i` | `r`（bundle-mjs-D8tLE0rB.js） | `clsx` | clsx@2.1.1（bundle-mjs 头部即 clsx 的 toVal/clsx 双函数） | **高** |
| `a` | `t`（utils-CEEH0K_K.js） | `cn` | tailwind-merge@3.5.0 `extendTailwindMerge` 定制实例（新增 `text-ui-*` 字号组），包一层 clsx | **高** |

### 2.2 本地定义符号

| 原名 | 语义名 | 导出别名 | 把握度 | 依据 |
|---|---|---|---|---|
| `s` | `mergeClasses` | （未导出） | **高** | 与上游逐字节一致 |
| `c` | `toKebabCase` | （未导出） | **高** | 同上 |
| `l` | `toCamelCase` | （未导出） | **高** | 同上（上游经 toPascalCase 间接引用） |
| `u` | `toPascalCase` | （未导出） | **高** | 同上 |
| `d` | `defaultAttributes` | （未导出） | **高** | 同上 |
| `f` | `hasA11yProp` | （未导出） | **高** | 同上 |
| `p` | `LucideContext` | （未导出） | **高** | context.mjs |
| `m` | `LucideProvider` | `l` | **高** | context.mjs |
| `h` | `useLucideContext` | （未导出） | **高** | context.mjs |
| `g` | `Icon` | （未导出） | **高** | Icon.mjs |
| `_` | `createLucideIcon` | `c` | **高** | createLucideIcon.mjs |
| `v` | `ChevronLeft` | `s` | **高** | icons/chevron-left.mjs（d 路径 `m15 18-6-6 6-6`，key `1wnfg3`） |
| `y` | `ChevronRight` | `o` | **高** | icons/chevron-right.mjs |
| `b` | `ZoomIn` | `a` | **高** | icons/zoom-in.mjs（4 元素 iconNode 全对） |
| `x` | `ZoomOut` | `i` | **高** | icons/zoom-out.mjs |
| `S` | `cvaValue` | （未导出） | **高** | cva 0.7.1 toValue |
| `C` | `cx`（clsx 别名） | （未导出） | **高** | 原码 `C = i`（clsx 导入） |
| `w` | `cva` | `r` | **高** | cva 0.7.1 逐语句一致 |
| `E` | `buttonVariants` | `n` | **高** | `w(base, config)` 实例；base/variants 类名为 ZCode 设计系统字面量 |
| `D` | `Button` | `t` | **高** | `asChild ? Slot : 'button'` + data-slot/data-variant/data-size + `cn(buttonVariants(...))`，shadcn/ui 新版约定 |
| `T` | jsxRuntime | （未导出） | **高** | `n()` 互操作 |

## 3. 把握度分布

**命名决策（共 24 个符号 = 3 导入 + 21 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **24** | 全部（lucide/cva 段有上游逐行证据；buttonVariants/Button 有类名与 data-* 约定自证） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 2 | `IconNode`、`ButtonProps` 核心字段 |
| 中（`// TODO(infer)`） | 1 | `cva` 泛型签名（按 0.7.1 宽松版建模，未还原其条件类型） |

## 4. JSX 还原说明

原 chunk 全部经 `React.createElement` 调用（minify 产物）。恢复版把
`LucideProvider`/`Icon`/`createLucideIcon` 内层、`Button` 的
`createElement(Component, {...})` 还原为 JSX 书写；`Icon` 的 children
数组拼接（`[...iconNode.map(...), ...children]`）因形状特殊保留
表达式形式（等价）。

## 5. 行为等价性说明

- lucide 段：`??` 链、`Number()` 换算、`!children && !hasA11yProp(rest) && {...}`
  短路、`mergeClasses` 去重逐字保留。
- cva 段：`variantProp === null` 跳过、`toValue` 规范化、compoundVariants 的
  `every` + 数组 `includes` 匹配、`{...defaultVariants, ...propsWithoutVariants}`
  合并顺序逐字保留。
- Button：`asChild ? Slot : 'button'`、三个 data-* 属性、`cn` 包裹逐字保留。

## 6. 运行时等价性验证（已通过，12/12）

验证方式：恢复版 `.tsx` 经 esbuild（jsx=automatic）机械转换为
`button.verify.mjs`（`react`/`react/jsx-runtime` 经桩模块解析到
`out/renderer/assets/react-BQLj9xdT.js` 同一 React 19 实例，
`clsx` 解析 node_modules@2.1.1，radix Slot/cn 解析原构建产物），
与原始 chunk 在 Node ESM 中并排执行。

| # | 检查项 | 结果 |
|---|---|---|
| 1 | 两侧导出键均为 `{a,c,i,l,n,o,r,s,t}` | PASS |
| 2 | cva：无 config 早退路径等价 | PASS |
| 3 | cva：variants + defaultVariants 10 种取值组合逐值相等（含 null/true/0/缺省） | PASS |
| 4 | cva：compoundVariants 标量与数组匹配 5 种组合逐值相等 | PASS |
| 5 | buttonVariants：7 variant × 10 size 全组合 + className 叠加逐值相等 | PASS |
| 6 | 四图标 displayName 一致（ChevronLeft/ChevronRight/ZoomIn/ZoomOut） | PASS |
| 7 | createLucideIcon 工厂 displayName 派生一致（'arrow-up-right'→'ArrowUpRight'） | PASS |
| 8 | 图标 $$typeof / forwardRef 形状一致 | PASS |
| 9 | Button 默认渲染元素等价（type='button'、data-slot/variant/size、className） | PASS |
| 10 | Button variant/size/className 4 组组合元素逐值等价 | PASS |
| 11 | Button asChild 时 type 为 radix Slot（displayName 'Slot.Slot'，结构等价*） | PASS |
| 12 | Button 其余 props（disabled/aria-label/id）透传一致 | PASS |

\* 验证用 bundle 将 `dist-vnZIbudW.js` 收录两次（orig/rec 各一份），模块对象
不具引用同一性；真实应用中两者导入同一模块实例，故按结构比对。

验证用 `button.verify.mjs` 已于验证后删除；harness 存于 `/tmp/verify-button.mjs`。

## 7. vendor 登记

- **lucide-react@1.17.0**（ISC）：本 chunk 内联其 10 个符号（工具 5 + 上下文 3 +
  Icon + 工厂 + 4 图标）。
- **class-variance-authority@0.7.1**（MIT）：内联副本（`cvaValue` + `cva`）。
- **@radix-ui/react-slot@1.2.3**（MIT）：经 `dist-vnZIbudW.js` 引入 Slot。

## 8. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
