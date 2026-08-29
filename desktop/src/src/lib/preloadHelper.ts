/**
 * Vite preload helper —— out/renderer/assets/preload-helper-BHSF1fZ9.js（60 行）的
 * 工程化转录版（A0.1 S2-a）。
 *
 * 定性：vite 构建注入的 `__vitePreload` 包装器（vendor 构建件，非业务代码）。
 * 原 chunk 导出面：`export { r as t }` —— 唯一导出即三参预加载器
 *   t(loader, deps, baseUrl)
 * 本文件以语义名 `preloadModule` 导出同一函数，行为逐字等价：
 *   1) `modulepreload` link 注入 + 已见 URL 去重表（seen map）；
 *   2) CSS 依赖返回 load/error Promise（`Unable to preload CSS for <url>`）；
 *   3) CSP nonce 透传（meta[property=csp-nonce]）；
 *   4) 失败时派发可取消事件 `vite:preloadError`（payload=错误），
 *      未被 preventDefault 则重新抛出。
 */

const MODULE_PRELOAD_REL = 'modulepreload';

const resolvePreloadUrl = (dep: string, baseUrl: string | undefined): string => {
  return new URL(dep, baseUrl).href;
};

/** 已注入过 preload link 的 URL 去重表（原 chunk 模块级 `n = {}`）。 */
const preloadedUrls: Record<string, boolean> = {};

interface PreloadSettledResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
}

/**
 * 三参预加载器（原导出别名 t）：
 * @param loader    动态 import 包装（() => import(...)）
 * @param deps      需要预载的静态依赖列表（可空）
 * @param baseUrl   解析依赖 URL 的基准（import.meta.url）
 */
export const preloadModule = function <T>(
  loader: () => Promise<T>,
  deps: string[] | undefined,
  baseUrl: string | undefined,
): Promise<T> {
  let pending: Promise<Array<PreloadSettledResult<unknown>> | void> = Promise.resolve();
  if (deps && deps.length > 0) {
    let links = document.getElementsByTagName('link');
    const nonceMeta = document.querySelector<HTMLMetaElement>('meta[property=csp-nonce]');
    const nonce = nonceMeta?.nonce || nonceMeta?.getAttribute('nonce');
    function settleAll(items: Array<Promise<unknown> | unknown>): Promise<Array<PreloadSettledResult<unknown>>> {
      return Promise.all(
        items.map((item) =>
          Promise.resolve(item).then(
            (value) => ({ status: 'fulfilled' as const, value }),
            (reason) => ({ status: 'rejected' as const, reason }),
          ),
        ),
      );
    }
    pending = settleAll(
      deps.map((dep) => {
        dep = resolvePreloadUrl(dep, baseUrl);
        if (dep in preloadedUrls) return;
        preloadedUrls[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        if (baseUrl)
          for (let i = links.length - 1; i >= 0; i--) {
            let link = links[i];
            if (link.href === dep && (!isCss || link.rel === 'stylesheet')) return;
          }
        else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
        const newLink = document.createElement('link');
        newLink.rel = isCss ? 'stylesheet' : MODULE_PRELOAD_REL;
        if (!isCss) newLink.as = 'script';
        newLink.crossOrigin = '';
        newLink.href = dep;
        if (nonce) newLink.setAttribute('nonce', nonce);
        document.head.appendChild(newLink);
        if (isCss)
          return new Promise((resolve, reject) => {
            newLink.addEventListener('load', resolve);
            newLink.addEventListener('error', () => reject(new Error(`Unable to preload CSS for ${dep}`)));
          });
      }),
    );
  }
  function dispatchPreloadError(err: unknown) {
    let event = new Event('vite:preloadError', { cancelable: true }) as Event & { payload?: unknown };
    event.payload = err;
    window.dispatchEvent(event);
    if (!event.defaultPrevented) throw err;
  }
  return pending.then((settled): Promise<T> => {
    for (let item of settled || []) if (item.status === 'rejected') dispatchPreloadError(item.reason);
    // 与原 vite preload-helper 一致：vite:preloadError 被 preventDefault 时吞错，解析值可为空
    return loader().catch(dispatchPreloadError) as unknown as Promise<T>;
  });
};
