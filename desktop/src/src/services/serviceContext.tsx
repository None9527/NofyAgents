// A0-S4-5: 自 modules/services.tsx §C 总题 + §C.1 原样迁入（服务注册与钩子 + ServiceProvider/useServices，原 styles 2671–2681〔★A1-R161 勘误：旧记「js 2635–2645」误，实测该区间系 D5c TUI 编辑请求信箱 store（D5cSeq/D5cStore/requestOpen/consumeRequest）全无关；真值 us@2671 / ds@2672 / fs@2675 / ps@2680，以束符 word-boundary 定义扫描重定〕；原文件现为薄 re-export shim）。
// 含 JSX → .tsx；类型面自 ../modules/stores-core type-only 引入。
import * as React from "react";
import type { BaseServices, ResolvedBaseServices } from '../modules/stores-core';
/* ============================================================================
 * C. 服务注册与钩子
 * ==========================================================================*/

/* --- C.1 ServiceProvider / useServices（原 ds/fs/ps，styles 2671–2681〔★A1-R161 勘误：旧记 js 2635–2645 误，真值 us@2671 / ds@2672 / fs@2675 / ps@2680〕） --- */

const ServicesContext = React.createContext<BaseServices | null>(null);

export function ServiceProvider({ services, children }: { services: BaseServices; children: React.ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

/** 原 fs：useServices —— 必须在 ServiceProvider 内使用 */
export function useServices(): ResolvedBaseServices {
  const services = React.useContext(ServicesContext);
  if (!services) throw new Error("useServices 必须在 ServiceProvider 内使用");
  // A0-CLEANUP3 3b：热服务面运行期恒有值（启动注册/断开 Proxy 兜底），收窄返回型
  return services as ResolvedBaseServices;
}

/** 原 ps：useServicesOptional */
export function useServicesOptional(): BaseServices | null {
  return React.useContext(ServicesContext);
}
