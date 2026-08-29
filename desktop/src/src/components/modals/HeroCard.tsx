// A0-S4-4a: 自 modules/ModalsLeaves.tsx §A Onboarding hero 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §0 局部声明（resolveSystemThemeIsDark）+ §A 全段（109–189）。导入路径按 components/modals/ 深度改指 ../../modules/。
import * as React from "react";
import { useSettingsStore } from '../../modules/stores-core';
import { cn } from '../../modules/UtilsCn';

/** 设置 store（原 ko，stores-core.tsx）：主题字段 */
/** 原 xo（1103，stores-core 域）：system 主题的暗色解析 */
declare function resolveSystemThemeIsDark(theme: string): boolean;

/* ============================================================================
 * §A. Onboarding hero（原 js 206054–206119）
 * ==========================================================================*/

export interface HeroThemeStyles {
  panel: string;
  glowPrimary: string;
  glowSecondary: string;
  heading: string;
  description: string;
}

/** 原 x4t（206054）：主题 → hero 样式（light / zai-light / zai-dark / 缺省暗色） */
export function resolveHeroThemeStyles(theme: string): HeroThemeStyles {
  switch (theme) {
    case "light":
      return {
        panel:
          "bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_34%,#bfdbfe_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(125,211,252,0.42),transparent_26%),radial-gradient(circle_at_68%_80%,rgba(96,165,250,0.24),transparent_28%)]",
        glowPrimary: "bg-sky-200/70 mix-blend-screen",
        glowSecondary: "bg-blue-200/70 mix-blend-multiply",
        heading: "text-slate-900",
        description: "text-slate-700/80",
      };
    case "zai-light":
      return {
        panel:
          "bg-[linear-gradient(180deg,#ffffff_0%,#f8f8f8_42%,#ebf4ff_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(11,127,255,0.2),transparent_26%),radial-gradient(circle_at_70%_84%,rgba(128,190,255,0.2),transparent_30%)]",
        glowPrimary: "bg-[#80BEFF]/45 mix-blend-multiply",
        glowSecondary: "bg-[#EBF4FF]/80 mix-blend-multiply",
        heading: "text-[#0D0D0D]",
        description: "text-[#5C5C5C]",
      };
    case "zai-dark":
      return {
        panel:
          "bg-[linear-gradient(180deg,#161616_0%,#202020_42%,#001d3d_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_18%,rgba(64,153,255,0.18),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(128,190,255,0.2),transparent_26%),radial-gradient(circle_at_66%_84%,rgba(153,199,255,0.16),transparent_28%)]",
        glowPrimary: "bg-[#4099FF]/22 mix-blend-screen",
        glowSecondary: "bg-[#80BEFF]/16 mix-blend-screen",
        heading: "text-[#F8F8F8]",
        description: "text-[#ADADAD]",
      };
    default:
      return {
        panel:
          "bg-[linear-gradient(180deg,#060816_0%,#0b1333_38%,#12245a_72%,#173474_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_16%_20%,rgba(165,243,252,0.14),transparent_22%),radial-gradient(circle_at_82%_14%,rgba(96,165,250,0.18),transparent_24%),radial-gradient(circle_at_68%_84%,rgba(56,189,248,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]",
        glowPrimary: "bg-cyan-300/22 mix-blend-screen",
        glowSecondary: "bg-blue-400/18 mix-blend-screen",
        heading: "text-slate-50",
        description: "text-slate-200/72",
      };
  }
}

/** 原 S4t（206090）：当前主题 → hero 样式（system 经暗色判定归一） */
export function useHeroThemeStyles(): HeroThemeStyles {
  const theme = useSettingsStore((state) => state.theme);
  return resolveHeroThemeStyles(theme === "system" ? (resolveSystemThemeIsDark(theme) ? "dark" : "light") : theme);
}

/** 原 C4t（206094）：Hero 卡片壳（双光晕 blur-3xl 绝对定位 + 面板渐变） */
export function HeroCard(props: { className?: string; contentClassName?: string; children: React.ReactNode }) {
  const styles = useHeroThemeStyles();
  return (
    <div className={cn("relative overflow-hidden", styles.panel, props.className)}>
      <div
        className={cn(
          "pointer-events-none absolute left-[-12%] top-[18%] h-[42rem] w-[42rem] rounded-full blur-3xl",
          styles.glowPrimary,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute right-[-18%] bottom-[-14%] h-[36rem] w-[36rem] rounded-full blur-3xl",
          styles.glowSecondary,
        )}
      />
      <div className={cn("relative", props.contentClassName)}>{props.children}</div>
    </div>
  );
}
