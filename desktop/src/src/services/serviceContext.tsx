// A0-S4-5: 自 modules/services.tsx §C 总题 + §C.1 原样迁入（服务注册与钩子 + ServiceProvider/useServices，原 js 2635–2645；原文件现为薄 re-export shim）。
// 含 JSX → .tsx；类型面自 ../modules/stores-core type-only 引入。
import * as React from "react";
import type { BaseServices, ResolvedBaseServices } from '../modules/stores-core';
/* ============================================================================
 * C. 服务注册与钩子
 * ==========================================================================*/

/* --- C.1 ServiceProvider / useServices（原 ds/fs/ps，js 2635–2645） --- */

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
