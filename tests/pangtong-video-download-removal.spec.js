const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('龐統軍師不再提供或辨識影片下載功能', async ({ page }) => {
  await page.goto(dashboardUrl);

  const quickCommands = await page.evaluate(() => advisorAIQuickCommands().map(item => item.label));
  expect(quickCommands).not.toContain('影片下載');
  expect(await page.evaluate(() => ({
    openPanel: typeof window.advisorAIOpenVideoDownload,
    urlClassifier: typeof window.advisorAIVideoDownloaderUrl,
    submitHandler: typeof window.advisorAISubmitVideoDownload,
    tiktokCommand: advisorAICommand('https://www.tiktok.com/@example/video/123').intent,
    threadsCommand: advisorAICommand('https://www.threads.net/@example/post/123').intent,
    facebookCommand: advisorAICommand('https://www.facebook.com/watch/?v=123').intent
  }))).toEqual({
    openPanel: 'undefined',
    urlClassifier: 'undefined',
    submitHandler: 'undefined',
    tiktokCommand: 'unknown',
    threadsCommand: 'unknown',
    facebookCommand: 'unknown'
  });
});
