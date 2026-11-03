const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    window.isEmpireSessionUnlocked = () => true;
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) { loginOverlay.classList.remove('open'); loginOverlay.style.display = 'none'; }
    window.linkPocketFixture = [{
      id: 'link-test-1',
      url: 'https://www.youtube.com/watch?v=abc123',
      title: 'AI 影片收藏',
      summary: '整理模型應用靈感。',
      tags: ['AI', '研究'],
      platform: 'youtube',
      createdAt: '2026-11-03T00:00:00.000Z'
    }];
    window.linkPocketRequest = async (method, requestPath, body) => {
      if (method === 'GET' && requestPath.startsWith('/api/link-pocket/preview?')) return { sourceUrl: new URLSearchParams(requestPath.split('?')[1]).get('url'), title: '台南餐廳分享', summary: '巷弄裡的定食店，附上菜單與店家資訊。', thumbnailUrl: 'https://cdn.example.test/food.jpg', platform: 'instagram' };
      if (method === 'GET') return { entries: window.linkPocketFixture, tags: [{ tag: 'AI', count: 1 }, { tag: '研究', count: 1 }, { tag: '美食', count: 1 }] };
      if (method === 'POST') {
        const entry = { ...body, id: 'link-test-2', platform: 'instagram', createdAt: '2026-11-03T00:00:00.000Z' };
        window.linkPocketFixture.unshift(entry);
        return { entry };
      }
      if (method === 'PUT') {
        const id = decodeURIComponent(requestPath.split('/').pop());
        const index = window.linkPocketFixture.findIndex((entry) => entry.id === id);
        window.linkPocketFixture[index] = { ...window.linkPocketFixture[index], ...body };
        return { entry: window.linkPocketFixture[index] };
      }
      if (method === 'DELETE') {
        window.linkPocketFixture = window.linkPocketFixture.filter((entry) => !requestPath.endsWith(entry.id));
        return { ok: true };
      }
      throw new Error('Unexpected test request');
    };
    openPanel('store', 'store-link-pocket');
  });
});

test('Store link pocket loads NAS-backed records into searchable tag cards', async ({ page }) => {
  await expect(page.locator('#pane-store-link-pocket')).toHaveClass(/active/);
  await expect(page.locator('#link-pocket-list .link-pocket-card')).toHaveCount(1);
  await expect(page.locator('#link-pocket-list')).toContainText('AI 影片收藏');
  await expect(page.locator('#link-pocket-tags')).toContainText('AI');
  await expect(page.getByRole('link', { name: 'AI 影片收藏' })).toHaveAttribute('target', '_blank');

  await page.locator('#link-pocket-tags').getByRole('button', { name: /研究/ }).click();
  await expect(page.locator('#link-pocket-count')).toHaveText('顯示 1 / 1 筆');
  await page.locator('#link-pocket-search').fill('不存在的內容');
  await expect(page.locator('#link-pocket-list')).toContainText('沒有符合標籤');
});

test('link pocket is the first Store tab and the default Store page', async ({ page }) => {
  await page.evaluate(() => openPanel('store'));
  await expect(page.locator('#pane-store-link-pocket')).toHaveClass(/active/);
  await expect(page.locator('#panel-title-menu .panel-menu-item').first()).toContainText('連結便貼');
  await expect(page.locator('#panel-title-menu .panel-menu-item')).toHaveText(['連結便貼', '事件編年', '物品總覽', '命盤總覽']);
});

test('link pocket form saves tags and summary and remains usable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#link-pocket-url').fill('https://www.instagram.com/p/example/');
  await expect(page.locator('#link-pocket-preview-copy')).toContainText('台南餐廳分享');
  await page.getByRole('button', { name: '#美食' }).click();
  await page.locator('#link-pocket-tags-input').fill('#美食 台南');
  await page.getByRole('button', { name: '快速儲存' }).click();

  await expect.poll(() => page.evaluate(() => window.linkPocketFixture[0].thumbnailUrl)).toBe('https://cdn.example.test/food.jpg');
  await expect(page.locator('#link-pocket-list .link-pocket-card')).toHaveCount(2);
  await expect(page.locator('#link-pocket-list')).toContainText('台南餐廳分享');
  await expect(page.locator('#link-pocket-list')).toContainText('#美食');
  await expect(page.locator('#link-pocket-list img').first()).toHaveAttribute('src', 'https://cdn.example.test/food.jpg');
  await expect(page.locator('#link-pocket-status')).toHaveText('已儲存便貼');
  const layout = await page.locator('#link-pocket-list').evaluate((el) => ({ columns: getComputedStyle(el).gridTemplateColumns, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(layout.columns.trim().split(/\s+/)).toHaveLength(1);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);

  const card = page.locator('.link-pocket-card').filter({ hasText: '台南餐廳分享' });
  await card.getByRole('button', { name: '編輯' }).click();
  await page.locator('#link-pocket-title').fill('台南餐廳分享（更新）');
  await page.getByRole('button', { name: '更新便貼' }).click();
  await expect(page.locator('#link-pocket-list')).toContainText('台南餐廳分享（更新）');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.link-pocket-card').filter({ hasText: '台南餐廳分享（更新）' }).getByRole('button', { name: '刪除' }).click();
  await expect(page.locator('#link-pocket-list')).not.toContainText('台南餐廳分享（更新）');
});
