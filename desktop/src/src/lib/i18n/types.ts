// A0-S4-2: 自 modules/I18n.tsx §0 原样迁入（canonical 声明；intlProvider.tsx 中同形声明一并归此；原两文件现为薄 re-export shim）。

/** i18n 文案目录：key → 文案（可含 {placeholder} 占位符）。 */
export type MessageCatalog = Record<string, string>;
