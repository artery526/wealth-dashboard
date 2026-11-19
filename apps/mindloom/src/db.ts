import type { MindMap } from './model'
import { validateMap } from './model'

const DB_NAME = 'mindloom-local'
const STORE = 'maps'
const READ_TOKEN_KEY = 'arkos26.wall.readToken'
const WRITE_TOKEN_KEY = 'mindloom.nas.writeToken'
const API_BASE = (import.meta.env.VITE_ARKOS_API_BASE || 'https://api.ark-os26.cc').replace(/\/$/, '')

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('無法開啟本機資料庫'))
  })
}

async function getLocalMaps(): Promise<MindMap[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll()
    request.onsuccess = () => { db.close(); resolve((request.result as unknown[]).filter(validateMap).sort((a, b) => b.updatedAt - a.updatedAt)) }
    request.onerror = () => { db.close(); reject(request.error ?? new Error('讀取失敗')) }
  })
}

async function saveLocalMap(map: MindMap): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(map)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('儲存失敗')) }
  })
}

async function deleteLocalMap(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('刪除失敗')) }
  })
}

function browserReadToken(): string {
  try { return localStorage.getItem(READ_TOKEN_KEY) || '' } catch { return '' }
}

function browserWriteToken(): string {
  try {
    const persistent = localStorage.getItem(WRITE_TOKEN_KEY)
    if (persistent) return persistent
    const legacy = sessionStorage.getItem(WRITE_TOKEN_KEY) || ''
    if (legacy) {
      localStorage.setItem(WRITE_TOKEN_KEY, legacy)
      sessionStorage.removeItem(WRITE_TOKEN_KEY)
    }
    return legacy
  } catch {
    try { return sessionStorage.getItem(WRITE_TOKEN_KEY) || '' } catch { return '' }
  }
}

function clearBrowserWriteToken(): void {
  try { localStorage.removeItem(WRITE_TOKEN_KEY) } catch { /* Ignore unavailable storage. */ }
  try { sessionStorage.removeItem(WRITE_TOKEN_KEY) } catch { /* Ignore unavailable storage. */ }
}

async function readNasMaps(): Promise<MindMap[]> {
  const readToken = browserReadToken()
  if (!readToken) throw new Error('請先在王府完成 NAS 通行令驗證。')
  const response = await fetch(`${API_BASE}/api/mindmaps`, { headers: { authorization: `Bearer ${readToken}` }, cache: 'no-store' })
  const result = await response.json().catch(() => ({})) as { maps?: unknown[]; error?: string }
  if (!response.ok) throw new Error(result.error || `NAS 讀取失敗（HTTP ${response.status}）`)
  return Array.isArray(result.maps) ? result.maps.filter(validateMap).sort((a, b) => b.updatedAt - a.updatedAt) : []
}

async function writeNasMap(map: MindMap, token = browserWriteToken()): Promise<void> {
  if (!token) return
  const response = await fetch(`${API_BASE}/api/mindmaps/${encodeURIComponent(map.id)}`, {
    method: 'PUT', headers: { 'content-type': 'application/json', 'x-mindmap-write-token': token },
    body: JSON.stringify({ map }), cache: 'no-store',
  })
  const result = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(result.error || `NAS 儲存失敗（HTTP ${response.status}）`)
}

export async function getMaps(): Promise<MindMap[]> {
  if (!browserReadToken()) {
    return getLocalMaps()
  }
  try { return await readNasMaps() } catch { return getLocalMaps() }
}

export async function saveMap(map: MindMap): Promise<void> {
  await saveLocalMap(map)
  if (browserWriteToken()) await writeNasMap(map)
}

export async function deleteMap(id: string): Promise<void> {
  const token = browserWriteToken()
  if (token) {
    const response = await fetch(`${API_BASE}/api/mindmaps/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-mindmap-write-token': token }, cache: 'no-store' })
    const result = await response.json().catch(() => ({})) as { error?: string }
    if (!response.ok) throw new Error(result.error || `NAS 刪除失敗（HTTP ${response.status}）`)
  }
  await deleteLocalMap(id)
}

export async function connectNas(token: string): Promise<MindMap[]> {
  const response = await fetch(`${API_BASE}/api/mindmaps/verify`, { method: 'POST', headers: { 'x-mindmap-write-token': token }, cache: 'no-store' })
  const result = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(result.error || `NAS 驗證失敗（HTTP ${response.status}）`)
  try { localStorage.setItem(WRITE_TOKEN_KEY, token) } catch { throw new Error('瀏覽器無法儲存 NAS 寫入令牌。') }
  try { sessionStorage.removeItem(WRITE_TOKEN_KEY) } catch { /* Ignore unavailable legacy storage. */ }
  const remote = await readNasMaps()
  const remoteIds = new Set(remote.map(map => map.id))
  const local = await getLocalMaps()
  const localOnly = local.filter(map => !remoteIds.has(map.id))
  await Promise.all(localOnly.map(map => writeNasMap(map, token)))
  return [...remote, ...localOnly].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function isNasWriteConnected(): boolean { return Boolean(browserWriteToken()) }

export function forgetNasWriteToken(): void { clearBrowserWriteToken() }
