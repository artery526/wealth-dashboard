const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const standaloneUrl = 'file:///' + path.resolve(__dirname, '..', 'war-room.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    window.isEmpireSessionUnlocked = () => true;
    window.API_URL = 'https://example.test/exec';
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) {
      loginOverlay.classList.remove('open');
      loginOverlay.style.display = 'none';
    }
    window.warRoomLoads = [];
    window.openAdvisorWorldSituation = () => warRoomLoads.push('briefing');
    window.loadBattleBrief = () => warRoomLoads.push('battle');
    window.loadMarketSectorRotation = () => warRoomLoads.push('sector');
    window.loadTaiwanMacro = () => warRoomLoads.push('taiwan');
  });
});

test('War Room opens on the briefing and fetches each other area only when selected', async ({ page }) => {
  await page.evaluate(() => {
    window.isWarRoomStandalone = () => true;
    openPanel('war-room');
  });
  await expect(page.locator('#p-zh')).toHaveText('戰情室');
  await expect(page.locator('#p-tabs .ptab')).toHaveText(['帝國晨報', '戰情總匯報', '產業輪動', '台灣總體經濟']);
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing']);

  await page.getByRole('button', { name: '戰情總匯報' }).click();
  await page.getByRole('button', { name: '產業輪動' }).click();
  await page.getByRole('button', { name: '台灣總體經濟' }).click();
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing', 'battle', 'sector', 'taiwan']);
  await expect(page.locator('#pane-war-taiwan-macro')).toHaveClass(/active/);
});

test('Military panel exposes only the Troop Roster tab', async ({ page }) => {
  await page.evaluate(async () => {
    await ensureMilitaryModule();
    window.hasMainApiCredentials = () => true;
    window.loadCouncilDashboard = () => {};
    window.renderCouncilPanel('battle-brief');
  });
  await expect(page.locator('#p-zh')).toHaveText('軍機處');
  await expect(page.locator('#p-tabs .ptab')).toHaveText(['部隊陣容']);
  await expect(page.locator('#pane-council-roster')).toBeVisible();
  await expect(page.locator('#pane-battle-brief')).toHaveCount(0);
});

test('legacy military shortcuts and voice routing now open the matching War Room tab', async ({ page }) => {
  const results = await page.evaluate(() => ({
    shortcut: (() => {
      let opened;
      const original = window.openPanel;
      const originalStandalone = window.isWarRoomStandalone;
      window.openPanel = (panel, tab) => { opened = { panel, tab }; };
      window.isWarRoomStandalone = () => true;
      openEmpireCardShortcut({ stopPropagation() {} }, 'council', 'battle-brief');
      window.openPanel = original;
      window.isWarRoomStandalone = originalStandalone;
      return opened;
    })(),
    parsed: advisorAIOpenTarget('戰情總匯報')
  }));
  expect(results.shortcut).toEqual({ panel: 'war-room', tab: 'war-battle-brief' });
  expect(results.parsed).toMatchObject({ panel: 'war-room', tab: 'war-battle-brief' });
});

test('standalone route keeps the same-origin session and opens the requested section', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_empire_unlocked_v1', 'ok');
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: '{}'
  }));
  await page.goto(`${standaloneUrl}?tab=war-battle-brief`);

  const app = page.frameLocator('#war-room-app');
  await expect(app.locator('#p-zh')).toHaveText('戰情室');
  await expect(app.locator('#p-tabs .ptab.active')).toHaveText('戰情總匯報');
  expect(await app.locator('body').evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('same-tab-session');
  await expect(app.locator('.panel')).toHaveCSS('width', `${await page.evaluate(() => window.innerWidth)}px`);
  const dimensions = await app.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('standalone route revalidates expired access then opens the requested section without the home scene', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now() - 8 * 24 * 60 * 60 * 1000));
    sessionStorage.removeItem('wealth_web_session_token');
    window.API_URL = 'https://example.test/exec';
    window.WRITE_TOKEN = 'test-write-token';
  });
  await page.route('https://example.test/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true, data: { sessionToken: 'renewed-session' } })
  }));

  await page.goto(`${standaloneUrl}?tab=war-taiwan-macro`);
  const app = page.frameLocator('#war-room-app');
  await expect(app.locator('#p-zh')).toHaveText('戰情室');
  await expect(app.locator('#p-tabs .ptab.active')).toHaveText('台灣總體經濟');
  await expect(app.locator('#web-login-overlay')).toHaveClass(/hidden/);
  await expect(app.locator('#npc-web-scene')).toBeHidden();
  expect(await app.locator('body').evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('renewed-session');
});
