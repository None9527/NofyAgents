import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), appRoot = resolve(here, '..'), project = resolve(appRoot, '../..');
const temp = await mkdtemp(join(tmpdir(), 'nofy-browser-e2e-')), home = join(temp, 'home'), nofy = join(temp, 'nofy'), cwd = join(temp, 'workspace');
const output = join(project, 'output/playwright', 'browser-' + new Date().toISOString().replaceAll(':', '-'));
await Promise.all([home, nofy, cwd, output].map(path => mkdir(path, { recursive: true })));
const report = { source: 'isolated Electron + synthetic ACP + local http page; guest webContents inspected in the main process', cases: [], consoleErrors: [], output };
let app, page, server;
const serverReady = new Promise(resolveReady => {
  server = createServer((req, res) => {
    const title = req.url === '/second' ? 'nofy-browser-second' : 'nofy-browser-first';
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><title>' + title + '</title><p>' + title + '</p>');
  });
  server.listen(0, '127.0.0.1', () => resolveReady());
});
await serverReady;
const port = server.address().port;
const firstUrl = 'http://127.0.0.1:' + port + '/';
const secondUrl = 'http://127.0.0.1:' + port + '/second';
async function check(name, fn) {
  try { const details = await fn(); report.cases.push({ name, status: 'passed', details }); console.log('PASS ' + name); }
  catch (e) { report.cases.push({ name, status: 'failed', error: String(e) }); console.error('FAIL ' + name + ': ' + e); await page?.screenshot({ path: join(output, report.cases.length + '-failure.png') }).catch(() => {}); }
}
async function guest() {
  return app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const view = win.contentView.children.find(child => child.webContents && child.webContents.id !== win.webContents.id);
    if (!view) return null;
    const bounds = view.getBounds();
    return { url: view.webContents.getURL(), title: view.webContents.getTitle(), loading: view.webContents.isLoading(), visible: view.getVisible(), bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }, content: win.getContentSize() };
  });
}
async function guestZoom() {
  return app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const view = win.contentView.children.find(child => child.webContents && child.webContents.id !== win.webContents.id);
    return view ? view.webContents.getZoomFactor() : null;
  });
}
async function waitGuest(title) {
  let last = null;
  for (let i = 0; i < 80; i++) {
    last = await guest();
    if (last && last.title === title && !last.loading && last.visible) return last;
    await page.waitForTimeout(50);
  }
  throw new Error('guest did not reach ' + title + ': ' + JSON.stringify(last));
}
function overlaps(guestBounds, box, content) {
  assert.ok(box, 'viewport box');
  const [limitW, limitH] = content;
  const expected = {
    x: Math.max(0, box.x),
    y: Math.max(0, box.y),
    width: Math.min(box.x + box.width, limitW) - Math.max(0, box.x),
    height: Math.min(box.y + box.height, limitH) - Math.max(0, box.y),
  };
  for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(guestBounds[key] - expected[key]) <= 2, key + ' guest=' + guestBounds[key] + ' visible=' + expected[key]);
}
try {
  const { _electron } = await loadPlaywright();
  app = await _electron.launch({ executablePath: join(appRoot, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'), args: [appRoot, '--user-data-dir=' + join(temp, 'chromium')], env: { ...process.env, HOME: home, NOFY_HOME: nofy, NOFY_BIN: join(here, 'mock-kernel.mjs'), NOFY_WORKSPACE: cwd, NOFY_E2E_LOG: join(temp, 'wire.jsonl'), NOFY_ISOLATED_HOME: '0', NOFY_DEV_SERVER_URL: '', ELECTRON_RUN_AS_NODE: '' } });
  page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => report.consoleErrors.push(String(e)));
  await page.locator('textarea.composer__input:not(:disabled)').waitFor();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: '展开侧边面板', exact: true }).click();
  await page.locator('.browserpane').waitFor();
  await page.getByRole('tab', { name: '新标签页', exact: true }).waitFor();
  await check('B00 empty page disables find print and screenshot', async () => {
    await page.locator('.browserpane').getByRole('button', { name: '浏览器选项', exact: true }).click();
    const menu = page.getByRole('menu', { name: '浏览器选项' });
    await menu.waitFor();
    for (const label of ['在页面中查找', '打印', '截取屏幕截图']) assert.equal(await menu.getByRole('menuitem', { name: label, exact: true }).isDisabled(), true, label);
    assert.equal(await menu.getByText('密码和自动填充').count(), 0);
    await page.keyboard.press('Escape');
    await menu.waitFor({ state: 'hidden' });
    return { disabled: true };
  });
  await check('B01 user navigation loads a local page inside the right pane', async () => {
    await page.locator('.browserpane__address').fill(firstUrl);
    await page.locator('.browserpane__address').press('Enter');
    const loaded = await waitGuest('nofy-browser-first');
    assert.equal(loaded.url, firstUrl);
    overlaps(loaded.bounds, await page.locator('.browserpane__viewport').boundingBox(), loaded.content);
    await page.locator('.browserpane__address').fill(secondUrl);
    await page.locator('.browserpane__address').press('Enter');
    const next = await waitGuest('nofy-browser-second');
    assert.equal(next.url, secondUrl);
    await page.locator('.browserpane').getByRole('button', { name: '后退', exact: true }).click();
    const back = await waitGuest('nofy-browser-first');
    return { url: back.url, title: back.title, bounds: back.bounds };
  });
  await check('B02 file and script URLs are rejected without loading them', async () => {
    const before = await guest();
    await page.locator('.browserpane__address').fill('file:///etc/passwd');
    await page.locator('.browserpane__address').press('Enter');
    await page.getByRole('alert').filter({ hasText: '只打开 http 和 https 页面' }).waitFor();
    const afterFile = await guest();
    assert.equal(afterFile.url, before.url);
    assert.equal(afterFile.title, before.title);
    await page.locator('.browserpane__address').fill('javascript:alert(1)');
    await page.locator('.browserpane__address').press('Enter');
    await page.getByRole('alert').filter({ hasText: '只打开 http 和 https 页面' }).waitFor();
    const afterScript = await guest();
    assert.equal(afterScript.url, before.url);
    assert.ok(!String(afterScript.url).startsWith('javascript:'));
    assert.ok(!String(afterScript.url).startsWith('file:'));
    return { stayed: afterScript.url };
  });
  await check('B04 browser menus run zoom find extensions and clear confirmation', async () => {
    const before = await guest();
    assert.equal(before?.visible, true);
    await page.locator('.browserpane').getByRole('button', { name: '浏览器选项', exact: true }).click();
    const menu = page.getByRole('menu', { name: '浏览器选项' });
    await menu.waitFor();
    const box = await menu.boundingBox();
    assert.ok(box && box.height >= 2 && box.width >= 2 && box.width < 500, JSON.stringify(box));
    let covered = null;
    for (let i = 0; i < 40; i++) { covered = await guest(); if (covered && covered.visible === false) break; await page.waitForTimeout(50); }
    assert.equal(covered?.visible, false, 'guest stayed visible under the menu: ' + JSON.stringify(covered));
    for (const label of ['在页面中查找', '打印', '缩放', 'Device toolbar', '截取屏幕截图', '导入 Cookie 和密码…', '下载', '历史记录', '清除浏览数据', '浏览器设置']) await menu.getByText(label, { exact: true }).waitFor();
    assert.equal(await menu.getByText('密码和自动填充').count(), 0);
    await menu.getByRole('button', { name: '放大', exact: true }).click();
    await menu.getByText('110%', { exact: true }).waitFor();
    let factor = null;
    for (let i = 0; i < 40; i++) { factor = await guestZoom(); if (factor !== null && Math.abs(factor - 1.1) < 0.02) break; await page.waitForTimeout(50); }
    assert.ok(factor !== null && Math.abs(factor - 1.1) < 0.02, 'zoom ' + factor);
    await menu.getByRole('button', { name: '重置缩放', exact: true }).click();
    await menu.getByText('100%', { exact: true }).waitFor();
    await menu.getByRole('menuitem', { name: '在页面中查找', exact: true }).click();
    let restored = null;
    for (let i = 0; i < 40; i++) { restored = await guest(); if (restored && restored.visible === true) break; await page.waitForTimeout(50); }
    assert.equal(restored?.visible, true, 'guest stayed hidden after the menu closed: ' + JSON.stringify(restored));
    await page.getByRole('searchbox', { name: '在页面中查找' }).fill('nofy');
    await page.waitForFunction(() => { const node = document.querySelector('[data-find-count]'); return !!node && Number(node.getAttribute('data-find-count')) > 0; });
    await page.locator('.browserpane').getByRole('button', { name: '扩展程序', exact: true }).click();
    const extensions = page.getByRole('menu', { name: '扩展程序' });
    await extensions.getByText('未安装扩展程序', { exact: true }).waitFor();
    await extensions.getByRole('menuitem', { name: '从工具栏中隐藏', exact: true }).click();
    await page.locator('.browserpane').getByRole('button', { name: '扩展程序', exact: true }).waitFor({ state: 'hidden' });
    await page.locator('.browserpane').getByRole('button', { name: '浏览器选项', exact: true }).click();
    await page.getByRole('menuitem', { name: '显示扩展程序', exact: true }).click();
    await page.locator('.browserpane').getByRole('button', { name: '扩展程序', exact: true }).waitFor();
    await page.locator('.browserpane').getByRole('button', { name: '浏览器选项', exact: true }).click();
    await page.getByRole('menuitem', { name: '浏览器设置', exact: true }).click();
    const settings = page.getByRole('dialog', { name: '浏览器设置' });
    await settings.getByText('这个浏览器不保存密码，也不提供自动填充。', { exact: true }).waitFor();
    await settings.getByRole('button', { name: '关闭', exact: true }).click();
    await page.locator('.browserpane').getByRole('button', { name: '浏览器选项', exact: true }).click();
    await page.getByRole('menuitem', { name: '清除浏览数据', exact: true }).click();
    const clearDialog = page.getByRole('dialog', { name: '清除浏览数据' });
    await clearDialog.getByText('这里不保存密码').waitFor();
    await clearDialog.getByRole('button', { name: '取消', exact: true }).click();
    await clearDialog.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: '关闭查找', exact: true }).click();
    return { zoom: factor };
  });
  await check('B03 settings and collapsing the pane hide the native view', async () => {
    await page.locator('.sidebar__foot button').last().click();
    await page.getByRole('menuitem', { name: /设置…/ }).click();
    await page.locator('.set').waitFor();
    let hidden = null;
    for (let i = 0; i < 40; i++) { hidden = await guest(); if (hidden && hidden.visible === false) break; await page.waitForTimeout(50); }
    assert.equal(hidden.visible, false);
    await page.getByRole('button', { name: '返回工作区', exact: true }).click();
    await page.locator('.set').waitFor({ state: 'hidden' });
    const restored = await waitGuest('nofy-browser-first');
    overlaps(restored.bounds, await page.locator('.browserpane__viewport').boundingBox(), restored.content);
    await page.getByRole('button', { name: '收起右侧栏', exact: true }).click();
    let collapsed = null;
    for (let i = 0; i < 40; i++) { collapsed = await guest(); if (!collapsed || collapsed.visible === false) break; await page.waitForTimeout(50); }
    assert.equal(collapsed?.visible ?? false, false);
    return { hidden: hidden.visible, restored: restored.url };
  });
  await check('B05 closing the page tab returns to the homepage and keeps both sidebars', async () => {
    await page.getByRole('button', { name: '展开侧边面板', exact: true }).click();
    await page.locator('.browserpane__address').fill(secondUrl);
    await page.locator('.browserpane__address').press('Enter');
    const loaded = await waitGuest('nofy-browser-second');
    await page.getByRole('tab', { name: 'nofy-browser-second', exact: true }).waitFor();
    const sidebar = page.getByRole('button', { name: '切换侧边栏', exact: true });
    assert.equal(await sidebar.getAttribute('aria-expanded'), 'true');
    await page.getByRole('button', { name: '关闭 nofy-browser-second', exact: true }).click();
    await page.getByRole('tab', { name: '新标签页', exact: true }).waitFor();
    await page.locator('.aux .ui-pane-home').waitFor();
    await page.getByRole('button', { name: '收起右侧栏', exact: true }).waitFor();
    assert.equal(await sidebar.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.browserpane__address').inputValue(), '');
    let hidden = null;
    for (let i = 0; i < 40; i++) {
      hidden = await guest();
      if (!hidden || hidden.visible === false) break;
      await page.waitForTimeout(50);
    }
    assert.equal(hidden?.visible ?? false, false);
    assert.equal(await page.locator('.shell--sidebar-closed').count(), 0);
    return { home: true, closed: loaded.url, sidebar: await sidebar.getAttribute('aria-expanded') };
  });
} catch (e) {
  report.cases.push({ name: 'setup', status: 'failed', error: String(e) });
  console.error(e);
} finally {
  await app?.close().catch(() => {});
  await new Promise(resolveClose => server.close(() => resolveClose()));
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await rm(temp, { recursive: true, force: true });
  console.log('Report: ' + join(output, 'report.json'));
}
if (report.cases.some(item => item.status === 'failed') || report.consoleErrors.length) process.exitCode = 1;
