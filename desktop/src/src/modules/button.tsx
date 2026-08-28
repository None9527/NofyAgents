/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/button-laUijeDG.js（186 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原 + 逐行对照上游源码
 *    · vendor 段（lucide-react@1.17.0）与
 *      node_modules/lucide-react/dist/esm/{defaultAttributes.mjs, Icon.mjs,
 *      context.mjs, createLucideIcon.mjs, shared/src/utils/*.mjs,
 *      icons/{chevron-left,chevron-right,zoom-in,zoom-out}.mjs}
 *      逐行对照确认身份（把握度：高）；
 *    · first-party 段（cva 副本 + buttonVariants + Button）依据：
 *      cva 实现与 class-variance-authority@0.7.1 逐语句一致（内联 vendored
 *      副本，未走 bundle-mjs 中的 cva 导出）；Button 的 data-slot/data-variant/
 *      data-size 与 shadcn/ui 新版 Button 约定一致；变体类名为 ZCode 自有
 *      设计系统（text-ui-base、bg-primary、warning 变体、icon-* 尺寸族）。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为等价——
 *    1) lucide 段所有函数体逐字保留（含 `??` 链、`Number()` 换算、
 *       `!children && !hasA11yProp(rest) && { 'aria-hidden': 'true' }` 短路）；
 *    2) cva 段 `toValue`/variant 解析/compoundVariants 归并逐字保留；
 *    3) Button 的 `asChild ? Slot : 'button'` 分支与 data-* 属性逐字保留；
 *    4) 导出面 9 个符号一一对应（见尾符号表）。
 *  唯一文本级差异：minified 逗号表达式/三元展开为常规语句，无可观察差异。
 * ════════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
// @ts-expect-error 原始构建产物为 minified JS、无类型声明
import { t as Slot } from '../../out/renderer/assets/dist-vnZIbudW.js';
// @ts-expect-error 同上；bundle-mjs 导出 r=clsx
import { r as clsx } from '../../out/renderer/assets/bundle-mjs-D8tLE0rB.js';
// @ts-expect-error 同上；utils 导出 t=cn（extendTailwindMerge 定制版）
import { t as cn } from '../../out/renderer/assets/utils-CEEH0K_K.js';

/* ════════════════════════ vendor 段：lucide-react@1.17.0 ════════════════════════
 * 以下 10 个符号全部来自 lucide-react，逐一对照上游源码（逐字节一致）：
 *   mergeClasses      <- shared/src/utils/mergeClasses.mjs
 *   toKebabCase       <- shared/src/utils/toKebabCase.mjs
 *   toCamelCase       <- shared/src/utils/toCamelCase.mjs（上游经 toPascalCase 间接引用）
 *   toPascalCase      <- shared/src/utils/toPascalCase.mjs
 *   defaultAttributes <- defaultAttributes.mjs
 *   hasA11yProp       <- shared/src/utils/hasA11yProp.mjs
 *   LucideContext / LucideProvider / useLucideContext <- context.mjs
 *   Icon              <- Icon.mjs
 *   createLucideIcon  <- createLucideIcon.mjs
 *   ChevronLeft / ChevronRight / ZoomIn / ZoomOut <- icons/*.mjs
 * ════════════════════════════════════════════════════════════════════════════ */

/** lucide mergeClasses：去空、去重、去首尾空白后以空格连接。 */
const mergeClasses = (...classes: Array<string | false | null | undefined>) =>
  classes
    .filter((className, index, array) => !!className && className.trim() !== `` && array.indexOf(className) === index)
    .join(` `)
    .trim();

/** lucide toKebabCase：camelCase -> kebab-case。 */
const toKebabCase = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase();

/** lucide toCamelCase：kebab/snake/space 分隔 -> camelCase。 */
const toCamelCase = (value: string) =>
  value.replace(/^([A-Z])|[\s-_]+(\w)/g, (_match, firstChar, charAfterSeparator) =>
    charAfterSeparator ? charAfterSeparator.toUpperCase() : firstChar.toLowerCase(),
  );

/** lucide toPascalCase：先 camelCase 再首字母大写。 */
const toPascalCase = (value: string) => {
  const camelCase = toCamelCase(value);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

/** lucide defaultAttributes：24x24 viewBox、currentColor 描边等 SVG 缺省属性。 */
const defaultAttributes = {
  xmlns: `http://www.w3.org/2000/svg`,
  width: 24,
  height: 24,
  viewBox: `0 0 24 24`,
  fill: `none`,
  stroke: `currentColor`,
  strokeWidth: 2,
  strokeLinecap: `round`,
  strokeLinejoin: `round`,
} as const;

/** lucide hasA11yProp：props 中是否存在 aria- 前缀属性或 role / title（决定是否自动 aria-hidden）。 */
const hasA11yProp = (props: Record<string, unknown>) => {
  for (const prop in props) if (prop.startsWith(`aria-`) || prop === `role` || prop === `title`) return true;
  return false;
};

/** lucide LucideContext：图标全局缺省（size/color/strokeWidth/...）。 */
const LucideContext = React.createContext<LucideContextValue>({});

/** lucide LucideProvider（原导出别名 l）：为子树内图标提供全局缺省值。 */
function LucideProvider({
  children,
  size,
  color,
  strokeWidth,
  absoluteStrokeWidth,
  className,
}: {
  children?: React.ReactNode;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  className?: string;
}) {
  const value = React.useMemo(
    () => ({ size, color, strokeWidth, absoluteStrokeWidth, className }),
    [size, color, strokeWidth, absoluteStrokeWidth, className],
  );
  return <LucideContext.Provider value={value}>{children}</LucideContext.Provider>;
}

interface LucideContextValue {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  className?: string;
}

/** lucide useLucideContext：读取图标全局缺省上下文。 */
const useLucideContext = () => React.useContext(LucideContext);

/** lucide iconNode 元素：[标签名, 属性表]。 */
type IconNode = Array<[string, Record<string, unknown>]>;

/**
 * lucide Icon（内部基础组件）：渲染 <svg>，合并上下文缺省、
 * 计算 absoluteStrokeWidth 缩放后的线宽，并在无 children 且无 a11y 属性时
 * 自动补 aria-hidden。
 */
const Icon = React.forwardRef<SVGSVGElement, Record<string, unknown> & { iconNode: IconNode }>(
  (
    {
      color,
      size,
      strokeWidth,
      absoluteStrokeWidth,
      className: classNameFromProps = ``,
      children,
      iconNode,
      ...rest
    },
    ref,
  ) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = `currentColor`,
      className: contextClass = ``,
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = (absoluteStrokeWidth ?? contextAbsoluteStrokeWidth)
      ? (Number(strokeWidth ?? contextStrokeWidth) * 24) / Number(size ?? contextSize)
      : (strokeWidth ?? contextStrokeWidth);
    return (
      <svg
        ref={ref}
        {...defaultAttributes}
        width={size ?? contextSize ?? defaultAttributes.width}
        height={size ?? contextSize ?? defaultAttributes.height}
        stroke={color ?? contextColor}
        strokeWidth={calculatedStrokeWidth}
        className={mergeClasses(`lucide`, contextClass, classNameFromProps)}
        {...(!children && !hasA11yProp(rest) && { 'aria-hidden': `true` })}
        {...rest}
      >
        {[...iconNode.map(([tag, attrs]) => React.createElement(tag, attrs)), ...(Array.isArray(children) ? children : [children])]}
      </svg>
    );
  },
);

/**
 * lucide createLucideIcon（原导出别名 c）：由图标名 + iconNode 生成
 * forwardRef 图标组件，className 追加 `lucide-<kebab>` 与 `lucide-<原名>`。
 */
const createLucideIcon = (iconName: string, iconNode: IconNode) => {
  const Component = React.forwardRef<SVGSVGElement, Record<string, unknown>>(
    ({ className, ...props }, ref) => (
      <Icon
        ref={ref}
        iconNode={iconNode}
        className={mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className as string | undefined)}
        {...props}
      />
    ),
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

/** lucide ChevronLeft 图标（原导出别名 s）。 */
const ChevronLeft = createLucideIcon(`chevron-left`, [[`path`, { d: `m15 18-6-6 6-6`, key: `1wnfg3` }]]);
/** lucide ChevronRight 图标（原导出别名 o）。 */
const ChevronRight = createLucideIcon(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]);
/** lucide ZoomIn 图标（原导出别名 a）。 */
const ZoomIn = createLucideIcon(`zoom-in`, [
  [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
  [`line`, { x1: `21`, x2: `16.65`, y1: `21`, y2: `16.65`, key: `13gj7c` }],
  [`line`, { x1: `11`, x2: `11`, y1: `8`, y2: `14`, key: `1vmskp` }],
  [`line`, { x1: `8`, x2: `14`, y1: `11`, y2: `11`, key: `durymu` }],
]);
/** lucide ZoomOut 图标（原导出别名 i）。 */
const ZoomOut = createLucideIcon(`zoom-out`, [
  [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
  [`line`, { x1: `21`, x2: `16.65`, y1: `21`, y2: `16.65`, key: `13gj7c` }],
  [`line`, { x1: `8`, x2: `14`, y1: `11`, y2: `11`, key: `durymu` }],
]);

/* ════════════════════════ first-party 段：cva + Button ════════════════════════ */

/**
 * cva toValue：把变体取值规范化为字符串键（布尔 -> 'true'/'false'，
 * 0 -> '0'，其余原样）。与 class-variance-authority@0.7.1 逐字一致。
 */
const cvaValue = (value: unknown) => (typeof value === `boolean` ? `${value}` : value === 0 ? `0` : value);

/** cx = clsx（原码 `C = i`，i 为 bundle-mjs 的 clsx 导出）。 */
const cx = clsx as (...inputs: unknown[]) => string;

/**
 * cva（class-variance-authority）的 **内联 vendored 副本**（原导出别名 r）。
 * 与 class-variance-authority@0.7.1 dist 逐语句一致（含 `t?.variants == null`
 * 早退、`variantProp === null` 跳过、compoundVariants 的 every/includes 匹配）。
 * // TODO(infer): 类型签名按 cva 0.7.1 的宽松版建模。
 */
const cva = (
  base?: string,
  config?: {
    variants?: Record<string, Record<string, string | null | undefined>>;
    defaultVariants?: Record<string, string>;
    compoundVariants?: Array<Record<string, unknown> & { class?: string; className?: string }>;
  },
) => {
  return (props?: Record<string, unknown> & { class?: string; className?: string }) => {
    if (config?.variants == null) return cx(base, props?.class, props?.className);
    const { variants, defaultVariants } = config;
    const variantClassNames = Object.keys(variants).map((variant) => {
      const variantProp = props?.[variant];
      const defaultVariantProp = defaultVariants?.[variant];
      if (variantProp === null) return null;
      const variantValue = cvaValue(variantProp) || cvaValue(defaultVariantProp);
      return variants[variant][variantValue as string];
    });
    const propsWithoutVariants =
      props &&
      Object.entries(props).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (value === undefined) return acc;
        acc[key] = value;
        return acc;
      }, {});
    return cx(
      base,
      variantClassNames,
      config?.compoundVariants?.reduce<Array<string | null | undefined>>((acc, compoundVariant) => {
        const { class: compoundClass, className: compoundClassName, ...compoundVariantOptions } = compoundVariant;
        return Object.entries(compoundVariantOptions).every(([key, value]) => {
          const resolved = { ...defaultVariants, ...propsWithoutVariants }[key];
          return Array.isArray(value) ? value.includes(resolved) : resolved === value;
        })
          ? [...acc, compoundClass, compoundClassName]
          : acc;
      }, []),
      props?.class,
      props?.className,
    );
  };
};

/**
 * ZCode 设计系统 Button 的变体类名表（原导出别名 n）。
 * base 类 + 7 种 variant（含 ZCode 特有的 warning）+ 10 种 size
 * （含 icon-xs/sm/md/lg 方形图标按钮族）。类名逐字保留。
 */
const buttonVariants = cva(
  `group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui-base/relaxed whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground hover:bg-primary/80`,
        outline: `border-border text-foreground hover:border-border-hover hover:bg-input/50 hover:text-foreground aria-expanded:bg-input/50 aria-expanded:text-foreground`,
        secondary: `bg-secondary text-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-foreground`,
        ghost: `text-foreground hover:bg-hover hover:text-foreground aria-expanded:bg-hover aria-expanded:text-foreground`,
        destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 aria-expanded:bg-destructive aria-expanded:text-destructive-foreground`,
        warning: `bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:border-warning/40 focus-visible:ring-warning/20 aria-expanded:bg-warning aria-expanded:text-warning-foreground`,
        link: `text-primary underline-offset-4 hover:underline`,
      },
      size: {
        default: `h-7 gap-1 px-2 text-ui-base has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5`,
        xs: `h-5 gap-1 rounded-sm px-2 text-ui-base has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5`,
        sm: `h-6 gap-1 px-2 text-ui-base/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3`,
        lg: `h-8 gap-1 rounded-lg px-2.5 text-ui-base has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4`,
        icon: `size-7 [&_svg:not([class*='size-'])]:size-4`,
        'icon-xs': `size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5`,
        'icon-sm': `size-6 [&_svg:not([class*='size-'])]:size-3`,
        'icon-md': `size-7 rounded-lg [&_svg:not([class*='size-'])]:size-4`,
        'icon-lg': `size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4`,
      },
    },
    defaultVariants: { variant: `default`, size: `default` },
  },
);

/** Button props（variant/size/asChild 之外的属性透传给底层元素）。 */
export interface ButtonProps extends Record<string, unknown> {
  className?: string;
  variant?: string;
  size?: string;
  /** true 时以 radix Slot 渲染（把属性合并给唯一子元素）。 */
  asChild?: boolean;
  children?: React.ReactNode;
}

/**
 * ZCode Button（原导出别名 t，本 chunk 得名的 first-party 组件）。
 * shadcn/ui 风格：data-slot="button" + data-variant/data-size 供
 * `has-data-[...]` 类选择；asChild 时经 radix Slot 渲染。
 */
function Button({ className, variant = `default`, size = `default`, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? (Slot as React.ElementType) : `button`;
  return (
    <Component
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { ZoomIn as a, createLucideIcon as c, ZoomOut as i, LucideProvider as l, buttonVariants as n, ChevronRight as o, cva as r, ChevronLeft as s, Button as t };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（9 个）：
 *   a -> b -> ZoomIn                 lucide 图标
 *   c -> _ -> createLucideIcon       lucide 图标工厂
 *   i -> x -> ZoomOut                lucide 图标
 *   l -> m -> LucideProvider         lucide 图标全局缺省 Provider
 *   n -> E -> buttonVariants         ZCode Button 变体类名表（cva 实例）
 *   o -> y -> ChevronRight           lucide 图标
 *   r -> w -> cva                    class-variance-authority 内联副本
 *   s -> v -> ChevronLeft            lucide 图标
 *   t -> D -> Button                 ZCode Button 组件
 * 模块内局部符号（12 个，未导出）：
 *   - -> s  -> mergeClasses          lucide 类名合并
 *   - -> c  -> toKebabCase           lucide 命名工具
 *   - -> l  -> toCamelCase           lucide 命名工具
 *   - -> u  -> toPascalCase          lucide 命名工具
 *   - -> d  -> defaultAttributes     lucide SVG 缺省属性
 *   - -> f  -> hasA11yProp           lucide a11y 探测
 *   - -> p  -> LucideContext         lucide 上下文
 *   - -> h  -> useLucideContext      lucide 上下文 hook
 *   - -> g  -> Icon                  lucide 基础 <svg> 组件
 *   - -> S  -> cvaValue              cva 取值规范化
 *   - -> C  -> cx                    clsx 别名
 *   - -> T  -> jsxRuntime            （`n()`，jsx-runtime 命名空间）
 * 导入符号（3 个）：
 *   dist-vnZIbudW.js: t -> f -> Slot               @radix-ui/react-slot
 *   bundle-mjs-D8tLE0rB.js: r -> t -> clsx         clsx@2.1.1
 *   utils-CEEH0K_K.js: t -> r -> cn                tailwind-merge 定制 cn
 *
 * vendor 登记：lucide-react@1.17.0（ISC），class-variance-authority@0.7.1（内联副本）
 * ════════════════════════════════════════════════════════════════════════ */
