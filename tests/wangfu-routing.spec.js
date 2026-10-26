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

test('embedded Wangfu reader renders > and \\> lines as dashed quote blocks on desktop and mobile', async ({ page }) => {
  await page.goto(dashboardUrl);

  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const result = await page.evaluate(() => {
      const html = arkWallMarkdownHtml('> 以瓦注者巧，以鉤注者憚，以黃金注者殙。\n> 其巧一也，而有所矜，則重外也。凡外重者內拙。\n\n\\> 第二段引用');
      const host = document.createElement('div');
      host.className = 'ark-wall-detail-text';
      host.innerHTML = html;
      document.body.appendChild(host);
      const quote = host.querySelector('blockquote.ark-wall-quote');
      const output = {
        quoteCount: host.querySelectorAll('blockquote.ark-wall-quote').length,
        text: host.innerText,
        borderStyle: quote ? getComputedStyle(quote).borderLeftStyle : null,
        borderWidth: quote ? getComputedStyle(quote).borderLeftWidth : null
      };
      host.remove();
      return output;
    });

    expect(result.quoteCount).toBe(2);
    expect(result.text).toContain('以瓦注者巧，以鉤注者憚，以黃金注者殙。');
    expect(result.text).toContain('其巧一也，而有所矜，則重外也。凡外重者內拙。');
    expect(result.text).not.toContain('>');
    expect(result.borderStyle).toBe('dashed');
    expect(result.borderWidth).toBe('3px');
  }
});

test('service worker returns successful navigation responses before waiting for cache writes', () => {
  const sw = fs.readFileSync(path.join(projectRoot, 'sw.js'), 'utf8');
  const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const warRoom = fs.readFileSync(path.join(projectRoot, 'war-room.html'), 'utf8');

  expect(sw).toMatch(/const CACHE_NAME = 'empire-shell-v\d+'/);
  expect(sw).toContain("'./war-room.html'");
  expect(sw).toContain('await cache.put(cacheKey, response.clone())');
  expect(sw).toContain('event.respondWith(networkResponse.then(response => {');
  expect(sw).toContain("url.pathname.endsWith('/war-room.html') ? null : caches.match('./index.html')");
  expect(html).toMatch(/\.\/sw\.js\?v=\d{8}-[a-z0-9-]+/);
  expect(warRoom).toContain('data-tab="war-taiwan-macro"');
});
