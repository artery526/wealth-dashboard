const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    prefetchBattleBrief = prefetchMarketDashboard = prefetchFinanceDashboard = prefetchStarsPanelData = () => {};
    API_URL = 'https://example.test/exec'; WRITE_TOKEN = 'test-only';
    setWebVerifyStatus('ok','測試已驗證');
    window.xyCalls = [];
    window.xyFixtures = {
      accounts: [{name:'總資產/總計',value:900000}],
      monthly: {ym:currentYM(),income:60000,expense:20000}, transactions: [], bills: {bills:[]},
      assetSnapshot: {latestTotalAssetValue:1000000,latest:{date:today(),totalAssetValue:1000000}},
      holdingsOverview: Array.from({length:12}, (_,i) => ({symbol:'A'+String(i+1).padStart(2,'0'),cost:100000+i*1000,totalReturn:20000-i*100,marketValue:120000-i*1000})),
      todayCalendar: {events:[{title:'今日會議',timeText:'10:00'}]},
      todayTasks: {tasks:[1,2,3,4].map(i => ({title:'任務'+i,dueText:'9/10'}))}
    };
    apiGet = params => { xyCalls.push(params.action); return Promise.resolve(xyFixtures[params.action]); };
  });
});

test('Xunyu scene entry renders reconciled first-version overview and working drilldowns', async ({ page }) => {
  await page.getByRole('button',{name:'荀彧，開啟角色面板'}).click();
  await expect(page.locator('#p-zh')).toHaveText('尚書臺');
  const kpis = page.locator('.xy-kpi strong');
  await expect(kpis).toHaveText(['$1,000,000','$40,000','$1,374,000','+18.4%']);
  await expect(page.locator('.xy-table tbody tr')).toHaveCount(12);
  await expect(page.locator('.xy-table')).toContainText('A01');
  await expect(page.locator('#xunyu-dashboard')).toContainText('今日會議');
  await expect(page.locator('.xy-list').last().locator('li')).toHaveCount(3);
  await page.getByRole('button',{name:'查看全部 4 項'}).click();
  await expect(page.locator('.xy-list').last().locator('li')).toHaveCount(4);
  await page.getByRole('button',{name:'隱藏數字'}).click();
  await expect(kpis).toHaveText(['••••','••••','••••','••••']);
  await page.getByRole('button',{name:'顯示數字'}).click();
  await page.evaluate(() => { renderCouncilPanel = tab => { document.getElementById('p-body').textContent='部隊明細 '+tab; }; });
  await page.getByRole('button',{name:'全部部隊 →'}).click();
  await expect(page.locator('#p-body')).toContainText('部隊明細 council-roster');
  expect(await page.evaluate(() => councilReviewMode)).toBe('compare');
});

test('repeated refresh deduplicates requests and failed section retains its data', async ({ page }) => {
  await page.evaluate(async () => { openXunyuPanel(); await refreshXunyuPanel(); });
  const results = await page.evaluate(async () => {
    xyCalls = [];
    apiGet = params => { xyCalls.push(params.action); return params.action === 'todayTasks' ? Promise.reject(new Error('待辦離線')) : Promise.resolve(xyFixtures[params.action]); };
    await Promise.all([refreshXunyuPanel(),refreshXunyuPanel()]);
    return xyCalls;
  });
  expect(results.filter(key => key === 'todayTasks')).toHaveLength(1);
  expect(results.filter(key => key === 'accounts')).toHaveLength(1);
  await expect(page.locator('#xunyu-dashboard')).toContainText('保留上次資料');
  await expect(page.locator('#xunyu-dashboard')).toContainText('任務1');
  await page.evaluate(() => { xyCalls=[]; apiGet=params => {xyCalls.push(params.action);return Promise.resolve(xyFixtures[params.action]);}; });
  await page.locator('[data-xy-retry="tasks"]').click();
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('待辦離線');
  expect(await page.evaluate(() => xyCalls)).toEqual(['todayTasks']);
});

test('partial finance failure shows unknown monthly result and zero-cost ROI remains unknown', async ({ page }) => {
  await page.evaluate(async () => {
    xyFixtures.holdingsOverview=[{symbol:'ZERO',cost:0,totalReturn:0,marketValue:0}];
    apiGet=params => params.action === 'monthly' ? Promise.reject(new Error('monthly failed')) : Promise.resolve(xyFixtures[params.action]);
    openXunyuPanel();await refreshXunyuPanel();
  });
  await expect(page.locator('.xy-kpi strong')).toHaveText(['$1,000,000','—','$0','—']);
  await expect(page.locator('#xunyu-dashboard')).toContainText('部分國庫來源未完成');
  await expect(page.locator('#xunyu-dashboard')).toContainText('今日會議');
});

test('locked entry never requests protected data', async ({ page }) => {
  await page.evaluate(() => { WRITE_TOKEN='';setWebVerifyStatus('err','未驗證');xyCalls=[];openXunyuPanel(); });
  await expect(page.locator('#xunyu-dashboard')).toHaveCount(0);
  expect(await page.evaluate(() => xyCalls)).toEqual([]);
});

test('mobile overview fits panel and calendar/task text is escaped', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(async () => {xyFixtures.todayTasks.tasks[0].title='<img src=x onerror=alert(1)>';openXunyuPanel();await refreshXunyuPanel();});
  await expect(page.locator('.xy-list').last()).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#xunyu-dashboard img')).toHaveCount(0);
  const geometry=await page.locator('#xunyu-dashboard').evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,client:el.clientWidth}));
  expect(geometry.width).toBeLessThanOrEqual(390);
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);
  await page.screenshot({path:'output/xunyu-mobile.png',animations:'disabled'});
});

test('desktop layout displays four core metrics and rejects malformed tasks', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1050});
  await page.evaluate(async () => {xyFixtures.todayTasks={};openXunyuPanel();await refreshXunyuPanel();});
  await expect(page.locator('#xunyu-dashboard')).toContainText('資料格式不完整');
  await expect(page.locator('#xunyu-dashboard')).not.toContainText('目前沒有未完成待辦');
  const tops=await page.locator('.xy-kpi').evaluateAll(items=>items.map(el=>el.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
  await page.screenshot({path:'output/xunyu-desktop.png',animations:'disabled'});
});

test('desktop layout gives the complete roster more width than monthly affairs', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1050});
  await page.evaluate(async () => { openXunyuPanel(); await refreshXunyuPanel(); });
  const widths = await page.locator('.xy-grid > .xy-card').evaluateAll(cards => cards.slice(0,2).map(el => el.getBoundingClientRect().width));
  expect(widths[1]).toBeGreaterThan(widths[0]);
  await expect(page.locator('.xy-table tbody tr')).toHaveCount(12);
});
