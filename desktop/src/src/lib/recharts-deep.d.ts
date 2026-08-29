/**
 * recharts 深路径导入的环境声明（A0.1 S2-a）。
 *
 * recharts@3.8.0 的 npm 包没有 "exports" 字段，`recharts/es6/*` 深路径在
 * moduleResolution=bundler 下可解析到真实 JS，但包内未随附相邻 .d.ts
 * （类型只挂在根入口），逐路径导入会报 TS7016。
 *
 * 重建模块（用量图等）从 bundle 恢复时保留了对这些内部模块的逐字依赖；
 * 此处统一以 any 声明，类型契约由各消费文件内的既有 cast 约束
 * （与原 minified 无类型产物的处理方式一致）。
 */
declare module 'recharts/es6/*';
