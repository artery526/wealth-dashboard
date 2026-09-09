const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function openBriefs(page) {
  await page.evaluate(() => {
    window.xyNasCalls = [];
    medicalPost = () => Promise.resolve({status:'success',records:[
      {recordTime:currentYM().replace('/','-')+'-02 10:00'}, {recordTime:currentYM().replace('/','-')+'-02 21:00'},
      {recordTime:currentYM().replace('/','-')+'-03 08:00'}, {recordTime:'2020-01-01 09:00'}]});
    xyFixtures.storeRecords = {records:[{itemName:'舊物品',recordDate:'2020/01/01'},{itemName:'新物品',recordDate:today()}]};
    xyFixtures.macroOverview = {hasData:true,sourceDate:'2026-09-01',judgment:{summary:'總經觀察中',signal:'黃燈'},indicators:[
      {code:'yield10y',name:'美國10年債殖利率',displayValue:'4.20%',status:'綠燈'},
      {code:'cpi',name:'CPI年增率',displayValue:'2.80%',status:'綠燈'},
      {code:'unemployment',name:'失業率',displayValue:'4.10%',status:'綠燈'},
      {code:'vix',name:'VIX恐慌指數',displayValue:'16.20',status:'綠燈'}
    ]};
    xyFixtures.marketDashboard = {rows:[
      {code:'^TWII',name:'台灣股市加權指數 TAIEX',price:22000,changePct:0.86,signal:'進攻',isTWSE:true,updatedAt:'10:00'},
      {code:'^GSPC',name:'S&P 500',price:6500,changePct:-0.24,signal:'觀望',updatedAt:'08:00'}
    ]};
    eventChronicleApiRequest = () => Promise.resolve({rows:[{name:'新事件',date:today()}]});
    arkWallFetch = route => { xyNasCalls.push(route); return Promise.resolve(route.includes('expeditions') ? {entries:[
      {title:'舊紀錄',updatedAt:'2020-01-01'}, {title:'最近更新',updatedAt:'2026-09-08'}, {title:'次近更新',updatedAt:'2026-09-07'}
    ]} : {status:{state:'completed-with-errors'},items:[{title:'外部消息',publishedAt:'2026-09-06'}]}); };
    openXunyuPanel();
  });
  expect(await page.evaluate(() => xyNasCalls)).toEqual([]);
  await page.getByRole('button',{name:'各部摘要',exact:true}).click();
}

test('briefs show every department without display checkboxes and include dated summaries', async ({page}) => {
  await openBriefs(page);
  await expect(page.locator('[data-xy-source="medical"]')).toContainText('本月記錄 2 天');
  await expect(page.locator('[data-xy-source="medical"]')).toContainText('-03 08:00');
  await expect(page.locator('[data-xy-source="store"]')).toContainText('新物品');
  await expect(page.locator('[data-xy-source="wall"] li')).toHaveCount(2);
  await expect(page.locator('[data-xy-source="wall"] li').first()).toContainText('最近更新');
  await expect(page.locator('[data-xy-source="macro"]')).toContainText('2026-09-01');
  await expect(page.locator('[data-xy-source="macro"]')).toContainText('美國10年債殖利率');
  await expect(page.locator('[data-xy-source="market"]')).toContainText('台灣股市加權指數');
  await expect(page.locator('[data-xy-source="market"]')).toContainText('S&P 500');
  await expect(page.locator('[data-xy-source="intelligence"]')).toHaveCount(0);
  await expect(page.locator('.xy-options')).toHaveCount(0);
  await expect(page.locator('.xy-card').filter({hasText:'王府'})).toHaveCount(1);
  await expect(page.locator('.xy-card').filter({hasText:'總體經濟'})).toHaveCount(1);
  await page.getByRole('button',{name:'內政總覽',exact:true}).click();
  await expect(page.locator('.xy-table tbody tr')).toHaveCount(12);
  await page.getByRole('button',{name:'各部摘要',exact:true}).click();
  await expect(page.locator('[data-xy-source="medical"]')).toHaveCount(1);
});

test('brief source failure retains previous data, retries independently and supports mobile layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await openBriefs(page);
  await expect(page.locator('[data-xy-source="wall"]')).toContainText('最近更新');
  await page.evaluate(async () => { arkWallFetch = () => Promise.reject(new Error('NAS 離線')); await refreshXunyuPanel('wall'); });
  await expect(page.locator('[data-xy-source="wall"]')).toContainText('保留上次資料');
  await expect(page.locator('[data-xy-source="medical"]')).toContainText('本月記錄 2 天');
  await page.evaluate(() => { arkWallFetch = () => Promise.resolve({entries:[]}); });
  await page.locator('[data-xy-retry="wall"]').click();
  await expect(page.locator('[data-xy-source="wall"]')).toContainText('目前沒有記錄');
  expect(await page.locator('#xunyu-dashboard').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({path:'test-results/xunyu-briefs-mobile.png'});
  await page.evaluate(() => { renderCouncilPanel = tab => { document.getElementById('p-body').textContent = tab; }; });
  await page.locator('[data-xy-source="macro"] button[data-xy-detail]').click();
  await expect(page.locator('#p-body')).toHaveText('macro-overview');
});

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
  await expect(page.locator('.xy-agenda-grid > .xy-card')).toHaveCount(3);
  await expect(page.locator('.xy-calendar-card')).toContainText('月曆');
  await expect(page.locator('.xy-calendar-grid .xy-calendar-day')).toHaveCount(42);
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
