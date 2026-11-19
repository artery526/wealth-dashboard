import { expect, test } from '@playwright/test'

test('create and edit a topic, then export a portable backup', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('application', { name: '心智圖畫布' })).toBeVisible()
  await page.getByRole('button', { name: '新增子主題' }).click()
  const topicEditor = page.getByLabel('主題文字')
  await expect(topicEditor).toBeVisible()
  await topicEditor.fill('旅行清單')
  await expect(page.getByRole('button', { name: '主題：旅行清單' })).toBeVisible()
  await page.getByRole('button', { name: '匯出 JSON' }).click()
  const [svgDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'SVG 圖檔' }).click()])
  expect(svgDownload.suggestedFilename()).toContain('.svg')
  await page.getByRole('button', { name: '匯出 JSON' }).click()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JSON 備份' }).click()])
  expect(download.suggestedFilename()).toContain('.json')
})
