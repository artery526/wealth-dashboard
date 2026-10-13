const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('Pangtong year progress shows elapsed days, remaining days, and one dot per day', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const progress = advisorAIYearProgressData(new Date(2026, 9, 13, 12));
    const html = advisorAIYearProgressHtml(new Date(2026, 9, 13, 12));
    const host = document.createElement('div');
    host.innerHTML = html;
    return {
      progress,
      dotCount: host.querySelectorAll('.advisor-ai-year-progress-dot').length,
      elapsedDots: host.querySelectorAll('.advisor-ai-year-progress-dot.is-elapsed').length,
      elapsedLabel: host.querySelector('.advisor-ai-year-progress-elapsed').textContent.trim(),
      remainingLabel: host.querySelector('.advisor-ai-year-progress-remaining').textContent.trim(),
      summary: host.querySelector('.advisor-ai-year-progress-foot').textContent.replace(/\s+/g, ' ').trim()
    };
  });
  expect(result.progress).toEqual({ year: 2026, elapsed: 286, total: 365, remaining: 79, percent: 78 });
  expect(result.dotCount).toBe(365);
  expect(result.elapsedDots).toBe(286);
  expect(result.elapsedLabel).toBe('已過 286 天');
  expect(result.remainingLabel).toBe('還剩 79 天');
  expect(result.summary).toContain('今年已過去 78%');
  expect(result.summary).toContain('還剩 79 天');
});

test('Pangtong year progress uses 366 dots in leap years', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const progress = advisorAIYearProgressData(new Date(2024, 1, 29, 12));
    const host = document.createElement('div');
    host.innerHTML = advisorAIYearProgressHtml(new Date(2024, 1, 29, 12));
    return { progress, dots: host.querySelectorAll('.advisor-ai-year-progress-dot').length };
  });
  expect(result.progress).toEqual({ year: 2024, elapsed: 60, total: 366, remaining: 306, percent: 16 });
  expect(result.dots).toBe(366);
});

test('year progress appears in Pangtong home and stays within a mobile panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const panel = advisorAIStandalonePanel();
    panel.classList.add('open');
    openAdvisorAI(panel);
    const card = panel.querySelector('.advisor-ai-year-progress');
    const rect = card.getBoundingClientRect();
    return {
      exists: !!card,
      dots: card.querySelectorAll('.advisor-ai-year-progress-dot').length,
      left: rect.left,
      right: rect.right,
      viewportWidth: window.innerWidth
    };
  });
  expect(result.exists).toBe(true);
  expect(result.dots).toBe(365);
  expect(result.left).toBeGreaterThanOrEqual(0);
  expect(result.right).toBeLessThanOrEqual(result.viewportWidth);
});
