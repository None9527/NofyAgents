// A0-S5 boot shim: reconstructed I18n surface, but ZCodeIntlProvider resolves to the
// ORIGINAL IntlProvider chunk's provider — single-instance discipline: the styles chunk's
// useZCodeIntl (IntlProvider-C321H7m8.js export n) reads that chunk's own React context,
// so the provider populating it must be the same chunk's component.
export * from '/Users/mac/nofy-build/desktop/src/src/modules/I18n.tsx';
import { t as OriginalZCodeIntlProvider } from '/Users/mac/nofy-build/desktop/src/out/renderer/assets/IntlProvider-C321H7m8.js';
export { OriginalZCodeIntlProvider as ZCodeIntlProvider };
