const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    document.getElementById('overlay').classList.add('open');
    document.getElementById('panel').classList.add('council-wide');
    document.getElementById('p-body').innerHTML = '<div id="council-content"></div><div id="battle-brief-content"></div><div id="market-content"></div>';
    loadBattleFinanceSnapshots = () => Promise.resolve(null);
    loadMarketSectorRotation = () => {};
    window.reviewRows = [
      {symbol:'AAA',heroName:'甲軍',holding:{symbol:'AAA',cost:100,marketValue:300,totalReturn:20,monthlyDiv:8,dataDate:'2026-09-08'}},
      {symbol:'BBB',heroName:'乙軍',holding:{symbol:'BBB',cost:100,marketValue:100,totalReturn:50,monthlyDiv:0}},
      {symbol:'CCC',heroName:'丙軍',holding:{symbol:'CCC',cost:0,marketValue:0,totalReturn:0,monthlyDiv:''}}
    ];
    renderCouncilRoster(reviewRows,document.getElementById('council-content'),{latest:{investmentMarketValue:9999}},null);
  });
});

test('comparison uses holding denominator, sorts returns and opens details', async ({ page }) => {
  await page.getByRole('button', {name:'精簡比較',exact:true}).click();
  const rows = page.locator('.council-review-table tbody tr');
  await expect(rows.first()).toContainText('75.0%');
  await expect(rows.nth(1)).toContainText('25.0%');
  await expect(rows.nth(2)).toContainText('—');
  await page.getByLabel('持股比較排序').selectOption('returnPct');
  await expect(rows.first()).toContainText('BBB');
  await page.getByRole('button',{name:'BBB',exact:true}).click();
  await expect(page.locator('#council-review-detail')).toContainText('乙軍');
  await page.evaluate(() => renderCouncilRoster(reviewRows,document.getElementById('council-content'),null,null));
  await expect(page.getByRole('button',{name:'精簡比較',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel('持股比較排序')).toHaveValue('returnPct');
});

test('unknown market values suppress weights without treating missing as zero', async ({ page }) => {
  await page.evaluate(() => { reviewRows[1].holding.marketValue=''; setCouncilReview('compare'); });
  await expect(page.locator('.council-review-note')).toContainText('暫不計算占比');
  const weights = await page.locator('.council-review-table tbody tr td:nth-child(3)').allTextContents();
  expect(weights).toEqual(['—','—','—']);
  await expect(page.locator('.council-review-table tbody tr').last()).toContainText('BBB');
});

test('summary chooses actual largest absolute changes, escapes text, and handles no data', async ({ page }) => {
  await page.evaluate(() => renderBattleBrief({funds:[{name:'小變化',changePct:1},{name:'<大變化>',changePct:-3,dataDate:'2026-09-07'}],holdings:[{name:'BBB',changePct:2}],summary:{}},document.getElementById('battle-brief-content')));
  await expect(page.locator('.battle-review-summary')).toContainText('<大變化> -3.00%');
  await expect(page.locator('.battle-review-summary')).toContainText('2026-09-07');
  await expect(page.locator('.battle-review-summary button')).toHaveCount(2);
  await page.locator('.battle-review-summary button').first().click();
  await expect(page.locator('#battle-fund-snapshot-host')).toBeFocused();
  await page.evaluate(() => renderBattleBrief({funds:[{name:'missing',changePct:''}],summary:{}},document.getElementById('battle-brief-content')));
  await expect(page.locator('.battle-review-summary button')).toHaveCount(0);
  await expect(page.locator('.battle-review-summary')).toContainText('比較資料不足');
});

test('market missing values are distinct from genuine zeros', async ({ page }) => {
  await page.evaluate(() => renderMarketDashboard({rows:[{name:'缺值',code:'MISSING',price:'',ma20:null,change:'',changePct:null,maGapPct:''},{name:'零值',code:'ZERO',price:0,ma20:0,change:0,changePct:0,maGapPct:0}],summary:{}},document.getElementById('market-content')));
  await expect(page.locator('.market-row').first()).toContainText('— / —');
  await expect(page.locator('.market-row').nth(1)).toContainText('0.00 / 0.00%');
});

test('mobile comparison stays inside panel with horizontal table scrolling', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'精簡比較',exact:true}).click();
  const dimensions = await page.locator('.council-review-scroll').evaluate(el => ({width:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  expect(dimensions.width).toBeLessThanOrEqual(390);
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await page.screenshot({path:'output/council-review-mobile.png'});
});
