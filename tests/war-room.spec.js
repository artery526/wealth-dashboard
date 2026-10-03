const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

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
  await page.evaluate(() => openPanel('war-room'));
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
      window.openPanel = (panel, tab) => { opened = { panel, tab }; };
      openEmpireCardShortcut({ stopPropagation() {} }, 'council', 'battle-brief');
      window.openPanel = original;
      return opened;
    })(),
    parsed: advisorAIOpenTarget('戰情總匯報')
  }));
  expect(results.shortcut).toEqual({ panel: 'war-room', tab: 'war-battle-brief' });
  expect(results.parsed).toMatchObject({ panel: 'war-room', tab: 'war-battle-brief' });
});
