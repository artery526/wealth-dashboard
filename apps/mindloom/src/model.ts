export type MindNode = { id: string; text: string; x: number; y: number; width: number; height: number; color: string }
export type MindEdge = { id: string; from: string; to: string }
export type MindMap = { id: string; title: string; nodes: MindNode[]; edges: MindEdge[]; updatedAt: number }
export type MapFile = { format: 'mindloom'; version: 1; map: MindMap }

export const palette = ['#e8f2eb', '#f5eadb', '#e8edf8', '#f5e6e6', '#f1edda']
const id = () => crypto.randomUUID()

export function createMap(title = '未命名心智圖'): MindMap {
  const root = { id: id(), text: '中心主題', x: 510, y: 300, width: 190, height: 76, color: '#d8eee2' }
  return { id: id(), title, nodes: [root], edges: [], updatedAt: Date.now() }
}

export function sampleMap(): MindMap {
  const nodes: MindNode[] = [
    { id: 'sample-root', text: '我的下一個專案', x: 470, y: 280, width: 220, height: 86, color: '#d8eee2' },
    { id: 'sample-plan', text: '先做核心流程', x: 180, y: 130, width: 190, height: 70, color: '#f5eadb' },
    { id: 'sample-build', text: '打造可用原型', x: 820, y: 130, width: 190, height: 70, color: '#e8edf8' },
    { id: 'sample-share', text: '整理與分享', x: 180, y: 440, width: 190, height: 70, color: '#f1edda' },
    { id: 'sample-review', text: '回顧並改善', x: 820, y: 440, width: 190, height: 70, color: '#f5e6e6' },
  ]
  const edges: MindEdge[] = ['sample-plan', 'sample-build', 'sample-share', 'sample-review'].map((to, i) => ({ id: `sample-edge-${i}`, from: 'sample-root', to }))
  return { id: 'sample-map', title: '專案起步範例（示範資料）', nodes, edges, updatedAt: Date.now() }
}

export function validateMap(value: unknown): value is MindMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Partial<MindMap>
  if (typeof map.id !== 'string' || map.id.length > 100 || typeof map.title !== 'string' || map.title.length > 160) return false
  if (!Array.isArray(map.nodes) || map.nodes.length > 500 || !Array.isArray(map.edges) || map.edges.length > 1000) return false
  const ids = new Set<string>()
  for (const n of map.nodes) {
    if (!n || typeof n.id !== 'string' || n.id.length > 100 || ids.has(n.id) || typeof n.text !== 'string' || n.text.length > 500) return false
    if (![n.x, n.y, n.width, n.height].every(Number.isFinite) || n.width < 100 || n.width > 600 || n.height < 56 || n.height > 300) return false
    if (typeof n.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(n.color)) return false
    ids.add(n.id)
  }
  const edgeIds = new Set<string>()
  return map.edges.every((e) => {
    if (!e || typeof e.id !== 'string' || edgeIds.has(e.id) || !ids.has(e.from) || !ids.has(e.to) || e.from === e.to) return false
    edgeIds.add(e.id); return true
  }) && Number.isFinite(map.updatedAt)
}

export function addChild(map: MindMap, parentId: string): MindMap {
  const parent = map.nodes.find((n) => n.id === parentId)
  if (!parent) return map
  const siblings = map.edges.filter((e) => e.from === parentId).length
  const side = siblings % 2 === 0 ? 1 : -1
  const node: MindNode = { id: id(), text: '新主題', x: parent.x + side * (parent.width + 145), y: parent.y + siblings * 105, width: 170, height: 64, color: palette[siblings % palette.length] }
  return { ...map, nodes: [...map.nodes, node], edges: [...map.edges, { id: id(), from: parentId, to: node.id }], updatedAt: Date.now() }
}

export function removeNode(map: MindMap, nodeId: string): MindMap {
  if (map.nodes.length <= 1) return map
  return { ...map, nodes: map.nodes.filter((n) => n.id !== nodeId), edges: map.edges.filter((e) => e.from !== nodeId && e.to !== nodeId), updatedAt: Date.now() }
}

export function connectNodes(map: MindMap, from: string, to: string): MindMap {
  if (from === to || map.edges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return map
  if (!map.nodes.some((n) => n.id === from) || !map.nodes.some((n) => n.id === to)) return map
  return { ...map, edges: [...map.edges, { id: id(), from, to }], updatedAt: Date.now() }
}

export function serializeMap(map: MindMap): MapFile { return { format: 'mindloom', version: 1, map } }
