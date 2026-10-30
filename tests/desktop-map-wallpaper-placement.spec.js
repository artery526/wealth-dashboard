const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('desktop command-center wallpaper matches the existing character districts', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_empire_unlocked_v1', 'ok');
  });
  await page.goto(dashboardUrl);

  const map = page.locator('.npc-web-scene-map');
  await expect(map).toHaveJSProperty('naturalWidth', 1536, { timeout: 15000 });
  await expect(map).toHaveJSProperty('naturalHeight', 1024);

  await expect(page.locator('.npc-web-scene .animated-character')).toHaveCount(5, { timeout: 15000 });
  const positions = await page.locator('.npc-web-scene .animated-character').evaluateAll(buttons =>
    buttons.map(button => ({
      character: button.getAttribute('aria-label'),
      top: button.style.top,
      left: button.style.left,
      width: button.style.width
    }))
  );

  expect(positions).toEqual([
    { character: '龐統，開啟角色面板', top: '13%', left: '45.5%', width: '9%' },
    { character: '諸葛亮，開啟角色面板', top: '49%', left: '18.5%', width: '9%' },
    { character: '陳群，開啟角色面板', top: '18%', left: '15%', width: '8.5%' },
    { character: '劉備，開啟角色面板', top: '26%', left: '74%', width: '8.5%' },
    { character: '滿寵，開啟角色面板', top: '56%', left: '75.5%', width: '10%' }
  ]);

  await page.screenshot({ path: path.join(__dirname, '..', 'test-results', 'desktop-map-placement.png') });
});
