const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('TaiCang screenshot tab reuses Threads article tags and filename rules', async ({ page }) => {
  await page.goto(dashboardUrl);
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(() => {
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) { loginOverlay.classList.remove('open'); loginOverlay.style.display = 'none'; }
    window.isEmpireSessionUnlocked = () => true;
    window.API_URL = 'https://example.test/exec';
    window.arkWallReadToken = () => 'test-token';
    window.screenshotRequests = [];
    window.screenshotRules = [];
    window.fetchWithTimeout = async (url, options = {}) => {
      const method = options.method || 'GET';
      if (url.endsWith('/api/link-pocket')) {
        return { ok: true, status: 200, json: async () => ({ entries: [{ platform: 'threads', tags: ['Threads美食'] }, { platform: 'web', tags: ['網頁收藏'] }], tags: [{ tag: 'Threads美食', count: 1 }, { tag: '網頁收藏', count: 1 }] }) };
      }
      if (url.endsWith('/api/screenshot-library') && method === 'GET') {
        return { ok: true, status: 200, json: async () => ({ entries: [], folders: ['股票梗圖', '養生', '待整理'], rules: [], tags: [{ tag: 'Threads美食', count: 1 }] }) };
      }
      if (url.endsWith('/api/admin/screenshot-library/rules')) {
        const body = JSON.parse(options.body);
        window.screenshotRules = body.rules;
        window.screenshotRequests.push({ kind: 'rules', body });
        return { ok: true, status: 200, json: async () => ({ rules: body.rules }) };
      }
      if (url.endsWith('/api/admin/screenshot-library')) {
        const body = options.body;
        const names = body.getAll('images').map(file => file.name);
        window.screenshotRequests.push({ kind: 'upload', folder: body.get('folder'), tags: JSON.parse(body.get('tags')), autoClassify: body.get('autoClassify'), names });
        const matchedFolder = window.screenshotRules.find(rule => rule.folder && names[0].toLowerCase().includes(rule.keyword.toLowerCase()))?.folder;
        const entry = { id: 'shot-1-0123456789ab', fileName: names[0], title: 'Threads-food', folder: body.get('folder') || matchedFolder || '待整理', tags: ['Threads美食'], url: '/media/screenshot-library/shot-1-0123456789ab' };
        return { ok: true, status: 201, json: async () => ({ entries: [entry] }) };
      }
      if (url.includes('/api/admin/screenshot-library/') && method === 'PUT') {
        const body = JSON.parse(options.body);
        window.screenshotRequests.push({ kind: 'update', body });
        return { ok: true, status: 200, json: async () => ({ entry: { id: 'shot-1-0123456789ab', fileName: 'Threads-food.png', title: body.title, folder: body.folder, tags: body.tags, url: '/media/screenshot-library/shot-1-0123456789ab' } }) };
      }
      if (url.includes('/api/admin/screenshot-library/') && method === 'DELETE') {
        window.screenshotRequests.push({ kind: 'delete', id: url.split('/').pop() });
        return { ok: true, status: 200, json: async () => ({ ok: true, id: url.split('/').pop() }) };
      }
      if (url.endsWith('/api/admin/runtime/restart') && method === 'POST') {
        window.screenshotRequests.push({ kind: 'restart' });
        return { ok: true, status: 202, json: async () => ({ ok: true, restarting: true }) };
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
  await expect(page.locator('#screenshot-quick-tags')).not.toContainText('#網頁收藏');
  await expect(page.locator('#screenshot-rules-panel')).toContainText('檔名自動分類規則');

  await page.locator('#screenshot-rules-panel summary').click();
  await page.getByRole('button', { name: /新增規則/ }).click();
  await page.locator('.screenshot-rule-keyword').fill('Threads-food');
  await page.locator('.screenshot-rule-tag').fill('Threads美食');
  await page.locator('.screenshot-rule-folder').selectOption('養生');
  await page.getByRole('button', { name: '儲存規則' }).click();
  await expect(page.locator('#screenshot-rules-status')).toHaveText('規則已儲存');

  await page.locator('#screenshot-upload-files').setInputFiles({
    name: 'Threads-food.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQ8sAAAAASUVORK5CYII=', 'base64')
  });
  await page.getByRole('button', { name: '上傳至 NAS' }).click();
  await expect(page.locator('#screenshot-upload-status')).toHaveText('已上傳 1 張截圖');
  await expect(page.locator('[data-screenshot-folder="養生"]')).toBeVisible();
  await page.locator('[data-screenshot-folder="養生"]').click();
  await expect(page.locator('#screenshot-filter-tags')).toContainText('養生');
  await expect(page.locator('#screenshot-library-list')).toContainText('Threads-food.png');
  const downloadHref = await page.locator('.screenshot-download').getAttribute('href');
  expect(downloadHref).toContain('/media/screenshot-library/shot-1-0123456789ab');
  expect(downloadHref).toContain('download=1');
  await page.locator('.screenshot-card-folder').selectOption('股票梗圖');
  await page.getByRole('button', { name: '儲存分類' }).click();
  await expect(page.locator('#screenshot-library-list')).toContainText('這個資料夾目前沒有截圖');
  await page.locator('[data-screenshot-folders-back]').click();
  await expect(page.locator('[data-screenshot-folder="股票梗圖"]')).toBeVisible();
  await page.locator('#screenshot-search').fill('Threads-food');
  await expect(page.locator('#screenshot-filter-tags')).toContainText('搜尋結果');
  await expect(page.locator('#screenshot-library-list')).toContainText('Threads-food.png');
  await page.locator('[data-screenshot-folders-back]').click();
  await page.locator('[data-screenshot-folder="股票梗圖"]').click();
  await page.locator('.screenshot-delete-button').click();
  await expect(page.locator('#screenshot-library-status')).toHaveText('截圖與 NAS 原圖已刪除');
  await expect(page.locator('#screenshot-library-list')).toContainText('這個資料夾目前沒有截圖');
  await page.locator('[data-screenshot-folders-back]').click();
  await page.locator('[data-screenshot-restart]').click();
  await expect(page.locator('#screenshot-restart-status')).toContainText('已送出重啟命令');
  const requests = await page.evaluate(() => window.screenshotRequests);
  expect(requests).toEqual([
    { kind: 'rules', body: { rules: [{ keyword: 'Threads-food', tag: 'Threads美食', folder: '養生' }] } },
    { kind: 'upload', folder: '', tags: [], autoClassify: 'true', names: ['Threads-food.png'] },
    { kind: 'update', body: { title: 'Threads-food', folder: '股票梗圖', tags: ['Threads美食'] } },
    { kind: 'delete', id: 'shot-1-0123456789ab' },
    { kind: 'restart' }
  ]);

  await page.evaluate(() => { closePanel(); openPanel('store'); });
  await page.waitForTimeout(10);
  await page.evaluate(() => {
    document.getElementById('p-zh').click();
    document.querySelector('#panel-title-menu [data-panel-tab="store-screenshot-library"]').click();
  });
  await expect(page.locator('[data-screenshot-folder="股票梗圖"]')).toBeVisible();
  await expect(page.locator('.screenshot-rule-keyword')).toHaveValue('Threads-food');
});
