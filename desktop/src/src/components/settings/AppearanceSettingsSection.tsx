// A0-S4-4a: 自 modules/Settings.tsx 外观分区（§9，原 $2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 2257–2515；§0 CodePreviewSettings 接口随族迁入；ThemeMode 为 shim 导出型别（type import）。
// §5 外观数据（选项表/解析器）经 shim import。
import * as React from "react";
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { CodeBlock } from '../../modules/SettingsPanelsData'; // gk（48634）
import { SettingsCard, SettingsCardContent, SettingsRow, PixelNumberInput, Select, SelectValue, SelectTrigger, SelectContent, SelectItem, Switch } from './SettingsRowPrimitives';
import { THEME_MODE_OPTIONS, CODE_THEME_OPTIONS, CODE_THEME_PREVIEW_SAMPLE, resolveCodeThemeForMode, resolveCodeThemeLabel, resolveThemeMode, type ThemeMode } from '../../modules/Settings';

/* §0 声明群随族迁入（原 328–334） */
interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}

/* ============================================================================
 * 9. 外观分区（原 $2t，js 204566–204775 / jsx 163104）
 *    界面（主题模式 + UI 字号）+ 代码（亮/暗主题 + 行号 + 换行 + 字号）+ 双预览卡
 * ==========================================================================*/

/** 原 wMt（js 135262）：代码主题下拉（10 主题，w-64 触发器） */
export function CodeThemeSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next)}>
      <SelectTrigger size="lg" className="w-64 min-w-0 justify-between">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CODE_THEME_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** 原 TMt（js 135278）：代码主题预览卡（亮/暗；激活徽章 `bg-selected`；
 *  容器变量覆写背景/卡片/前景三色） */
export function CodeThemePreviewCard({
  mode,
  title,
  themeName,
  theme,
  isActive,
  showLineNumbers,
  wrapLongLines,
  fontSizePx,
}: {
  mode: "light" | "dark";
  title: string;
  themeName: string;
  theme: unknown;
  isActive: boolean;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}) {
  const { intl } = useIntlContext();
  const ringClass = mode === "light" ? "ring-1 ring-black/5" : "ring-1 ring-white/8";
  const previewVars: React.CSSProperties = {
    "--color-background": mode === "light" ? "#f8f8f8" : "#161616",
    "--color-card": mode === "light" ? "#f8f8f8" : "#161616",
    "--color-foreground": mode === "light" ? "#0d0d0d" : "#ffffff",
  } as React.CSSProperties;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <div className="text-ui-base font-semibold text-foreground">{title}</div>
          <div className="text-ui-base text-foreground-subtle">{themeName}</div>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-ui-xs font-medium ${isActive ? "bg-selected text-foreground" : "bg-surface text-foreground-subtle"}`}
        >
          {intl.formatMessage({ id: isActive ? "settings.previewBadge.active" : `settings.previewBadge.${mode}` })}
        </span>
      </div>
      <div className="p-2">
        <CodeBlock
          code={CODE_THEME_PREVIEW_SAMPLE}
          language="typescript"
          theme={theme}
          showLineNumbers={showLineNumbers}
          wrapLongLines={wrapLongLines}
          fontSizePx={fontSizePx}
          className={`overflow-hidden border-0 bg-background ${ringClass}`}
          style={previewVars}
        />
      </div>
    </div>
  );
}

export function AppearanceSettingsSection({
  codePreviewSettings,
  setCodePreviewSettings,
  theme,
  setTheme,
  uiFontSizePx,
  setUiFontSizePx,
}: {
  codePreviewSettings: CodePreviewSettings;
  setCodePreviewSettings: (patch: Partial<CodePreviewSettings>) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  uiFontSizePx: number;
  setUiFontSizePx: (px: number) => void;
}) {
  const { intl } = useIntlContext();
  const resolvedMode = resolveThemeMode(theme);
  return (
    <>
      {/* ── 界面：主题模式 + UI 字号（204578–204649） ── */}
      <div className="min-w-0 space-y-3">
        <div>
          <h3 className="text-ui-lg font-semibold text-foreground">
            {intl.formatMessage({ id: "settings.appearance.interfaceTitle" })}
          </h3>
          <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
            {intl.formatMessage({ id: "settings.appearance.interfaceDescription" })}
          </p>
        </div>
        <SettingsCard className="border border-border bg-card py-0 shadow-none">
          <SettingsCardContent className="space-y-0 px-0">
            <SettingsRow
              label={intl.formatMessage({ id: "settings.themeMode" })}
              description={intl.formatMessage({ id: "settings.themeModeDescription" })}
              control={
                <Select value={theme} onValueChange={(value) => setTheme(value as ThemeMode)}>
                  <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_MODE_OPTIONS.map(({ mode, icon: ModeIcon }) => (
                      <SelectItem key={mode} value={mode}>
                        <div className="flex items-center gap-2">
                          <ModeIcon className="size-4" />
                          {intl.formatMessage({ id: `settings.themeMode.${mode}` })}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.uiFontSize" })}
              description={intl.formatMessage({ id: "settings.uiFontSizeDescription" })}
              control={
                <PixelNumberInput
                  key={uiFontSizePx}
                  min={12}
                  max={20}
                  value={uiFontSizePx}
                  onChange={setUiFontSizePx}
                  ariaLabel={intl.formatMessage({ id: "settings.uiFontSize" })}
                />
              }
            />
          </SettingsCardContent>
        </SettingsCard>
      </div>

      {/* ── 代码：主题/行号/换行/字号 + 预览（204650–204774） ── */}
      <div className="space-y-6">
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-ui-lg font-semibold text-foreground">
              {intl.formatMessage({ id: "settings.appearance.codeTitle" })}
            </h3>
            <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
              {intl.formatMessage({ id: "settings.appearance.codeDescription" })}
            </p>
          </div>
          <SettingsCard className="border border-border bg-card py-0 shadow-none [&_[data-slot=select-trigger]]:w-full">
            <SettingsCardContent className="space-y-0 px-0">
              <SettingsRow
                label={intl.formatMessage({ id: "settings.lightTheme" })}
                description={intl.formatMessage({ id: "settings.lightThemeDescription" })}
                control={
                  <CodeThemeSelect
                    value={codePreviewSettings.lightTheme}
                    onValueChange={(value) => setCodePreviewSettings({ lightTheme: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.darkTheme" })}
                description={intl.formatMessage({ id: "settings.darkThemeDescription" })}
                control={
                  <CodeThemeSelect
                    value={codePreviewSettings.darkTheme}
                    onValueChange={(value) => setCodePreviewSettings({ darkTheme: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.showLineNumbers" })}
                description={intl.formatMessage({ id: "settings.showLineNumbersDescription" })}
                control={
                  <Switch
                    checked={codePreviewSettings.showLineNumbers}
                    onCheckedChange={(value) => setCodePreviewSettings({ showLineNumbers: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.wrapLongLines" })}
                description={intl.formatMessage({ id: "settings.wrapLongLinesDescription" })}
                control={
                  <Switch
                    checked={codePreviewSettings.wrapLongLines}
                    onCheckedChange={(value) => setCodePreviewSettings({ wrapLongLines: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.fontSize" })}
                description={intl.formatMessage({ id: "settings.fontSizeDescription" })}
                control={
                  <PixelNumberInput
                    key={codePreviewSettings.fontSizePx}
                    min={12}
                    max={20}
                    value={codePreviewSettings.fontSizePx}
                    onChange={(value) => setCodePreviewSettings({ fontSizePx: value })}
                    ariaLabel={intl.formatMessage({ id: "settings.fontSize" })}
                  />
                }
              />
            </SettingsCardContent>
          </SettingsCard>
        </div>

        {/* 预览：亮/暗双卡（204725–204770） */}
        <div className="min-w-0 space-y-4">
          <div>
            <h3 className="text-ui-base font-semibold text-foreground">
              {intl.formatMessage({ id: "settings.previewSectionTitle" })}
            </h3>
            <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
              {intl.formatMessage({ id: "settings.previewDescription" })}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CodeThemePreviewCard
              mode="light"
              title={intl.formatMessage({ id: "settings.previewLight" })}
              themeName={resolveCodeThemeLabel(codePreviewSettings.lightTheme)}
              theme={resolveCodeThemeForMode("light", codePreviewSettings)}
              isActive={resolvedMode === "light"}
              showLineNumbers={codePreviewSettings.showLineNumbers}
              wrapLongLines={codePreviewSettings.wrapLongLines}
              fontSizePx={codePreviewSettings.fontSizePx}
            />
            <CodeThemePreviewCard
              mode="dark"
              title={intl.formatMessage({ id: "settings.previewDark" })}
              themeName={resolveCodeThemeLabel(codePreviewSettings.darkTheme)}
              theme={resolveCodeThemeForMode("dark", codePreviewSettings)}
              isActive={resolvedMode === "dark"}
              showLineNumbers={codePreviewSettings.showLineNumbers}
              wrapLongLines={codePreviewSettings.wrapLongLines}
              fontSizePx={codePreviewSettings.fontSizePx}
            />
          </div>
        </div>
      </div>
    </>
  );
}

