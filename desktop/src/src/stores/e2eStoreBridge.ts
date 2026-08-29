// A0-S4-3: 自 modules/SkillStore.tsx §2 原样迁入（jsx 40–52 E2E 门控与环境快照；原文件现为薄 re-export shim）。
/* ============================================================================
 * 2. E2E 门控与环境快照（原 ee/v，jsx 40–52）
 * ==========================================================================*/

interface ZCodeRendererEnv {
  BASE_URL: string;
  DEV: boolean;
  MODE: string;
  PROD: boolean;
  SSR: boolean;
  VITE_ZCODE_BASE_URL: string;
  VITE_ZCODE_E2E_STORE_BRIDGE: string;
  VITE_ZCODE_ENDPOINT_ORIGIN: string;
}

/** 原 ee（jsx 40）：构建期 import.meta.env 快照（逐字内联）。 */
function readBuildEnvSnapshot(): ZCodeRendererEnv {
  return {
    BASE_URL: `./`,
    DEV: false,
    MODE: `production`,
    PROD: true,
    SSR: false,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  };
}

/** 原 v（jsx 50）：E2E store 桥门控（导出 K）。
 *  原码 `typeof window < 'u'` = minified `typeof window !== 'undefined'`（逐字保留）。 */
function isE2EStoreBridgeEnabled(env = readBuildEnvSnapshot()): boolean {
  return typeof window < `u` && env.VITE_ZCODE_E2E_STORE_BRIDGE === `1`;
}


/* ============================================================================
 * 导出（A0-S4-3：原 SkillStore 导出块 K 项；readBuildEnvSnapshot 保持模块局部）
 * ==========================================================================*/

export { isE2EStoreBridgeEnabled };
