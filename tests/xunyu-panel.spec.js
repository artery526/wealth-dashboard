const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function loadPanel(page) {
  await page.addStyleTag({path:path.resolve(__dirname,'..','xunyu-panel.css')});
  await page.addScriptTag({path:path.resolve(__dirname,'..','xunyu-panel.js')});
  await page.evaluate(() => {
    renderXunyuPanel();
    document.getElementById('overlay').classList.add('open');
    document.getElementById('panel').classList.add('council-wide');
    document.getElementById('npc-web-scene').style.display = 'none';
  });
}

test.beforeEach(async ({page}) => {
  await page.goto(url);
  await page.evaluate(() => {
    prefetchBattleBrief = prefetchMarketDashboard = prefetchFinanceDashboard = prefetchStarsPanelData = () => {};
    API_URL = 'https://example.test/exec'; WRITE_TOKEN = 'test-only';
    setWebVerifyStatus('ok','測試已驗證');
    setWebLoginVisible(false);
    window.xyCalls = [];
    window.xyFixtures = {
      todayCalendar:{events:[{title:'今日會議',timeText:'10:00'}]},
      todayTasks:{tasks:[1,2,3,4].map(i=>({title:'任務'+i,dueText:'9/10'}))}
    };
    apiGet = (params) => { xyCalls.push(params.action); return Promise.resolve(xyFixtures[params.action]); };
  });
});

test('尚書臺開啟時不預載行程與待辦，使用者點擊後才讀取', async ({page}) => {
  await loadPanel(page);
  await expect(page.locator('.xy-agenda-grid > .xy-card')).toHaveCount(3);
  await expect(page.locator('#xunyu-dashboard')).toContainText('月曆');
  await expect(page.locator('#xunyu-dashboard')).toContainText('今日行程');
  await expect(page.locator('#xunyu-dashboard')).toContainText('待辦事項');
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('內政總覽');
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('各部摘要');
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('國庫');
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('部隊簡報');
  await expect(page.locator('.xy-calendar-grid .xy-calendar-day')).toHaveCount(42);
  await expect(page.locator('#xunyu-dashboard')).toContainText('今日行程尚未載入');
  await expect(page.locator('#xunyu-dashboard')).toContainText('待辦事項尚未載入');
  expect(await page.evaluate(() => xyCalls)).toEqual([]);
  await page.locator('[data-xy-load="calendar"]').click();
  await expect(page.locator('#xunyu-dashboard')).toContainText('今日會議');
  expect(await page.evaluate(() => xyCalls)).toEqual(['todayCalendar']);
  await page.locator('[data-xy-load="tasks"]').click();
  await expect(page.locator('.xy-list').last().locator('li')).toHaveCount(3);
  expect(await page.evaluate(() => xyCalls)).toEqual(['todayCalendar','todayTasks']);
  await page.getByRole('button',{name:'查看全部 4 項'}).click();
  await expect(page.locator('.xy-list').last().locator('li')).toHaveCount(4);
});

test('設定未完成時不發出行事曆或待辦請求', async ({page}) => {
  await page.evaluate(() => { API_URL=''; WRITE_TOKEN=''; setWebVerifyStatus('err','尚未完成設定'); });
  await loadPanel(page);
  await expect(page.locator('#xunyu-dashboard')).toContainText('設定需在每台裝置各自完成');
  expect(await page.evaluate(() => xyCalls)).toEqual([]);
});

test('待辦 API 失敗時顯示錯誤並可單獨重試', async ({page}) => {
  await page.evaluate(() => { apiGet = params => params.action === 'todayTasks' ? Promise.reject(new Error('待辦離線')) : Promise.resolve(xyFixtures[params.action]); });
  await loadPanel(page);
  await page.evaluate(async () => { await refreshXunyuPanel(); });
  await expect(page.locator('#xunyu-dashboard')).toContainText('待辦離線');
  await page.evaluate(() => { apiGet = params => Promise.resolve(xyFixtures[params.action]); });
  await page.locator('[data-xy-retry="tasks"]').click();
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('待辦離線');
  await expect(page.locator('#xunyu-dashboard')).toContainText('任務1');
});

test('手機尺寸不橫向溢出，事件與待辦文字安全跳脫', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(() => { xyFixtures.todayTasks.tasks[0].title='<img src=x onerror=alert(1)>'; });
  await loadPanel(page);
  await page.evaluate(async () => { await refreshXunyuPanel(); });
  await expect(page.locator('.xy-list').last()).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#xunyu-dashboard img')).toHaveCount(0);
  const geometry=await page.locator('#xunyu-dashboard').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);
});
