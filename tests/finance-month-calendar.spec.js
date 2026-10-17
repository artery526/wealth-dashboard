const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('finance monthly calendar groups daily income and expenses with totals', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div>');
    const current = new Date();
    const ym = current.getFullYear() + '/' + String(current.getMonth() + 1).padStart(2, '0');
    renderFinanceMonthlyCalendar({ ym, days: { [current.getDate()]: { expenseCount: 2, expenseAmount: 500, incomeCount: 1, incomeAmount: 900 } } }, false);
    const key = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
    const cell = document.getElementById('finance-calendar-day-' + key);
    return {
      text: cell.textContent,
      countText: cell.querySelector('.finance-month-calendar-counts').textContent,
      expenseColor: getComputedStyle(cell.querySelector('.finance-month-calendar-expense')).color,
      incomeColor: getComputedStyle(cell.querySelector('.finance-month-calendar-income')).color,
      title: document.querySelector('.finance-month-calendar-title').textContent
    };
  });

  expect(result.title).toContain('本月收支');
  expect(result.countText).toBe('21');
  expect(result.countText).not.toMatch(/[支收]/);
  expect(result.text).toContain('$500');
  expect(result.text).toContain('$900');
  expect(result.text).not.toContain('$5,000');
  expect(result.expenseColor).toBe('rgb(93, 225, 162)');
  expect(result.incomeColor).toBe('rgb(255, 139, 139)');
});

test('finance calendar uses a complete monthly summary independently of recent transactions', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div><div id="recent-content"></div>');
    API_URL = 'https://example.test/web-app';
    localStorage.removeItem(bookingRecentCacheKey());
    localStorage.removeItem(financeMonthCalendarCacheKey());
    const requests = [];
    apiGet = params => {
      requests.push(params);
      const current = new Date();
      if (params.action === 'financeCalendarSummary') {
        return Promise.resolve({
          ym: currentYM(),
          days: { 2: { expenseCount: 3, expenseAmount: 470, incomeCount: 1, incomeAmount: 1200 } }
        });
      }
      const date = String(current.getMonth() + 1).padStart(2, '0') + '/' + String(current.getDate()).padStart(2, '0');
      return Promise.resolve(Array.from({ length: 50 }, (_, index) => ({
        type: '支出', date, amount: index + 1, cat: '測試', source: 'NAS', rowId: index + 1, undoable: false
      })));
    };
    setEmpireCardStatus = () => {};
    await loadRecentBooking();
    const cache = JSON.parse(localStorage.getItem(bookingRecentCacheKey()));
    return {
      requests,
      cachedRows: cache.rows.length,
      recentItems: document.querySelectorAll('#recent-content .txn-item').length
    };
  });

  await page.waitForFunction(() => document.querySelector('.finance-month-calendar-day[aria-label^="2日"] .finance-month-calendar-counts')?.textContent === '31');
  const calendar = await page.evaluate(() => ({
    counts: document.querySelector('.finance-month-calendar-day[aria-label^="2日"] .finance-month-calendar-counts').textContent,
    amounts: document.querySelector('.finance-month-calendar-day[aria-label^="2日"] .finance-month-calendar-amounts').textContent,
    warning: document.querySelector('.finance-month-calendar-warning')?.textContent || ''
  }));

  expect(result.requests).toContainEqual({ action: 'financeCalendarSummary', ym: expect.any(String) });
  expect(result.requests).toContainEqual({ action: 'transactions', ym: expect.any(String), recentDays: 31, recentLimit: 50 });
  expect(result.cachedRows).toBe(50);
  expect(result.recentItems).toBe(10);
  expect(calendar.counts).toBe('31');
  expect(calendar.amounts).toContain('$470');
  expect(calendar.warning).toBe('');
});

test('finance month calendar fits a narrow phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div>');
    renderFinanceMonthlyCalendar({ ym: currentYM(), days: {} }, false);
    const host = document.getElementById('finance-month-calendar');
    const grid = host.querySelector('.finance-month-calendar-grid');
    return { hostWidth: host.clientWidth, gridWidth: grid.clientWidth, gridScrollWidth: grid.scrollWidth, dayCount: host.querySelectorAll('.finance-month-calendar-day:not(.empty)').length };
  });

  expect(result.gridScrollWidth).toBeLessThanOrEqual(result.gridWidth);
  expect(result.gridWidth).toBeLessThanOrEqual(result.hostWidth);
  expect(result.dayCount).toBeGreaterThanOrEqual(28);
});
