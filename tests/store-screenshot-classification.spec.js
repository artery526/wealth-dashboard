const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('TaiCang screenshot tab reuses Link Pocket tags and filename rules', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) { loginOverlay.classList.remove('open'); loginOverlay.style.display = 'none'; }
    window.isEmpireSessionUnlocked = () => true;
    window.API_URL = 'https://example.test/exec';
    window.arkWallReadToken = () => 'test-token';
    window.screenshotRequests = [];
    window.fetchWithTimeout = async (url, options = {}) => {
      const method = options.method || 'GET';
      if (url.endsWith('/api/link-pocket')) {
        return { ok: true, status: 200, json: async () => ({ entries: [], tags: [{ tag: 'Threads美食', count: 1 }] }) };
      }
      if (url.endsWith('/api/screenshot-library') && method === 'GET') {
        return { ok: true, status: 200, json: async () => ({ entries: [], rules: [], tags: [{ tag: 'Threads美食', count: 1 }] }) };
      }
      if (url.endsWith('/api/admin/screenshot-library/rules')) {
        const body = JSON.parse(options.body);
        window.screenshotRequests.push({ kind: 'rules', body });
        return { ok: true, status: 200, json: async () => ({ rules: body.rules }) };
      }
      if (url.endsWith('/api/admin/screenshot-library')) {
        const body = options.body;
        window.screenshotRequests.push({ kind: 'upload', tags: JSON.parse(body.get('tags')), autoClassify: body.get('autoClassify'), names: body.getAll('images').map(file => file.name) });
        const entry = { id: 'shot-1-0123456789ab', fileName: 'Threads-food.png', title: 'Threads-food', tags: ['Threads美食'], url: '/media/screenshot-library/shot-1-0123456789ab' };
        return { ok: true, status: 201, json: async () => ({ entries: [entry] }) };
      }
      throw new Error('Unexpected request: ' + url);
    };
    openPanel('store');
  });
  await page.waitForTimeout(10);
  const navigation = await page.evaluate(() => {
    document.getElementById('p-zh').click();
    const screenshotTab = document.querySelector('#panel-title-menu [data-panel-tab="store-screenshot-library"]');
    screenshotTab.click();
    return { paneClass: document.getElementById('pane-store-screenshot-library').className, currentTab, menuExists: !!screenshotTab };
  });

  expect(navigation).toEqual({ paneClass: 'pane active', currentTab: 'store-screenshot-library', menuExists: true });
  await page.waitForTimeout(250);
  const settledState = await page.evaluate(() => ({ className: document.getElementById('pane-store-screenshot-library').className, currentTab }));
  expect(settledState).toEqual({ className: 'pane active', currentTab: 'store-screenshot-library' });
  await expect(page.locator('#pane-store-screenshot-library')).toHaveClass(/active/);
  await expect(page.locator('#screenshot-quick-tags')).toContainText('#Threads美食');
  await expect(page.locator('#screenshot-rules-panel')).toContainText('檔名自動分類規則');

  await page.locator('#screenshot-rules-panel summary').click();
  await page.getByRole('button', { name: /新增規則/ }).click();
  await page.locator('.screenshot-rule-keyword').fill('Threads-food');
  await page.locator('.screenshot-rule-tag').fill('Threads美食');
  await page.getByRole('button', { name: '儲存規則' }).click();
  await expect(page.locator('#screenshot-rules-status')).toHaveText('規則已儲存');

  await page.locator('#screenshot-upload-files').setInputFiles({
    name: 'Threads-food.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQ8sAAAAASUVORK5CYII=', 'base64')
  });
  await page.getByRole('button', { name: '上傳至 NAS' }).click();
  await expect(page.locator('#screenshot-upload-status')).toHaveText('已上傳 1 張截圖');
  await expect(page.locator('#screenshot-library-list')).toContainText('Threads-food.png');
  const requests = await page.evaluate(() => window.screenshotRequests);
  expect(requests).toEqual([
    { kind: 'rules', body: { rules: [{ keyword: 'Threads-food', tag: 'Threads美食' }] } },
    { kind: 'upload', tags: [], autoClassify: 'true', names: ['Threads-food.png'] }
  ]);

  await page.evaluate(() => { closePanel(); openPanel('store'); });
  await page.waitForTimeout(10);
  await page.evaluate(() => {
    document.getElementById('p-zh').click();
    document.querySelector('#panel-title-menu [data-panel-tab="store-screenshot-library"]').click();
  });
  await expect(page.locator('#screenshot-library-list')).toContainText('Threads-food.png');
  await expect(page.locator('.screenshot-rule-keyword')).toHaveValue('Threads-food');
});
