import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { getMaps } from './db'

afterEach(() => cleanup())

describe('editor workflow', () => {
  it('creates a child topic, edits it and autosaves the change locally', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('application', { name: '心智圖畫布' })
    await user.click(screen.getByRole('button', { name: '新增子主題' }))
    const editor = await screen.findByLabelText('主題文字')
    await user.clear(editor)
    await user.type(editor, '週末整理花園')
    await waitFor(async () => expect((await getMaps())[0].nodes.some(n => n.text === '週末整理花園')).toBe(true), { timeout: 2000 })
  })
})
