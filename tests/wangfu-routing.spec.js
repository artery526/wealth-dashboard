const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const dashboardUrl = 'file:///' + path.join(projectRoot, 'index.html').replace(/\\/g, '/');

test('Wangfu shortcuts always route to the standalone page, including before unlock', async ({ page }) => {
  await page.goto(dashboardUrl);

  const routes = await page.evaluate(() => {
    const originalOpenArkWall = window.openArkWall;
    const originalOpenPanel = window.openPanel;
    const originalUnlocked = window.isEmpireSessionUnlocked;
    const result = [];
    window.openArkWall = (tab) => result.push({ route: 'standalone', tab: tab || null });
    window.openPanel = () => result.push({ route: 'legacy-panel' });
    window.isEmpireSessionUnlocked = () => false;
    openEmpireCardShortcut({ stopPropagation() {}, preventDefault() {} }, 'wall', 'journal');
    originalOpenPanel('wall', 'journal');
    window.openArkWall = originalOpenArkWall;
    window.openPanel = originalOpenPanel;
    window.isEmpireSessionUnlocked = originalUnlocked;
    return result;
  });

  expect(routes).toEqual([
    { route: 'standalone', tab: 'journal' },
    { route: 'standalone', tab: 'journal' }
  ]);
});

test('service worker returns successful navigation responses before waiting for cache writes', () => {
  const sw = fs.readFileSync(path.join(projectRoot, 'sw.js'), 'utf8');
  const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

  expect(sw).toContain("const CACHE_NAME = 'empire-shell-v15'");
  expect(sw).toContain('event.respondWith(networkResponse.then(response => {');
  expect(sw).toContain('return cachedResponse.then(cached => cached || Response.error());');
  expect(html).toContain("./sw.js?v=20260929-shell-v15");
});
