// A1-F1 boot shim: i18n single-instance via the IntlProvider chunk FACADE.
// The boot entry's ./I18n imports resolve here; this re-exports the semantic
// surface from the facade chunk that replaces ./IntlProvider-C321H7m8.js, so the
// entry's ZCodeIntlProvider and the styles chunk's useZCodeIntl (alias n) share
// ONE reconstructed React context (fixes the A0-S5 harness-level shim at the source).
// The scratch-path import is externalized by build.mjs to './IntlProvider-C321H7m8.js'.
export { t as ZCodeIntlProvider, n as useZCodeIntl, i as ZH_CN_MESSAGES, r as EN_US_MESSAGES, a as getWritableStorage, o as readLocalStorageItem, s as writeLocalStorageItem } from '/tmp/a1-f1-boot/renderer/assets/IntlProvider-C321H7m8.js';
