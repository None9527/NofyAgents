import { createRequire } from 'node:module';
/** Accept an explicit ESM/CJS override; normal checkout uses its pinned dev dependency. */
export async function loadPlaywright() {
  const module = process.env.PLAYWRIGHT_CORE_PATH ? await import(process.env.PLAYWRIGHT_CORE_PATH) : createRequire(import.meta.url)('playwright-core');
  const driver = module._electron ? module : module.default;
  if (!driver?._electron) throw new Error('Playwright Electron driver is unavailable');
  return driver;
}
