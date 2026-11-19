import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownToLine, ChevronDown, CircleHelp, FilePlus2, FolderOpen, Keyboard, Link2, Minus, MousePointer2, Plus, Share2, Trash2, X } from 'lucide-react'
import { addChild, connectNodes, createMap, MindMap, MindNode, palette, removeNode, sampleMap, serializeMap, validateMap } from './model'
import { connectNas, deleteMap, forgetNasWriteToken, getMaps, isNasWriteConnected, saveMap } from './db'

type SaveState = 'loading' | 'saved' | 'saving' | 'error'
const initialViewport = { x: 0, y: 0, scale: 1 }

function download(name: string, data: Blob) {
  const url = URL.createObjectURL(data); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
}

export default function App() {
  const [maps, setMaps] = useState<MindMap[]>([])
  const [map, setMap] = useState<MindMap | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('loading')
  const [nasConnected, setNasConnected] = useState(isNasWriteConnected())
  const [message, setMessage] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [viewport, setViewport] = useState(initialViewport)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number; resize?: boolean } | null>(null)
  const selectedNode = useMemo(() => map?.nodes.find(n => n.id === selected) ?? null, [map, selected])

  useEffect(() => {
    let active = true
    getMaps().then(async stored => {
      if (!active) return
      let initial = stored[0]
      if (!initial) { initial = sampleMap(); await saveMap(initial); stored = [initial] }
      if (active) { setMaps(stored); setMap(initial); setNasConnected(isNasWriteConnected()); setSaveState('saved') }
    }).catch(() => { if (active) { setSaveState('error'); setMessage('無法開啟本機資料庫，請在支援 IndexedDB 的瀏覽器中使用。') } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!map) return
    setSaveState('saving')
    const timer = window.setTimeout(() => saveMap(map).then(() => {
      setSaveState('saved'); setMaps(previous => [map, ...previous.filter(m => m.id !== map.id)])
    }).catch(() => { setSaveState('error'); setMessage('自動儲存失敗。請立即匯出 JSON 備份，並檢查瀏覽器可用空間。') }), 350)
    return () => window.clearTimeout(timer)
  }, [map])

  const changeMap = (update: (current: MindMap) => MindMap) => setMap(current => current ? update(current) : current)
  const createNew = async () => { const next = createMap(); setMap(next); setSelected(next.nodes[0].id); setConnectFrom(null); setViewport(initialViewport); setMessage('已建立新心智圖。') }
  const addTopic = () => { if (!map) return; const parentId = selected ?? map.nodes[0]?.id; if (parentId) { const next = addChild(map, parentId); setMap(next); const child = next.nodes.at(-1); if (child) setSelected(child.id) } }
  const removeSelected = () => { if (!map || !selected) return; if (map.nodes.length < 2) { setMessage('心智圖至少需要保留一個主題。'); return }; setMap(removeNode(map, selected)); setSelected(null); setMessage('已移除主題與相關連線。') }
  const updateNode = (id: string, patch: Partial<MindNode>) => changeMap(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, ...patch } : node), updatedAt: Date.now() }))

  const nodeAt = (id: string) => map?.nodes.find(n => n.id === id)
  const exportSvg = () => {
    const source = svgRef.current
    if (!source) return
    const clone = source.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('viewBox', '0 0 1200 760'); clone.setAttribute('width', '1200'); clone.setAttribute('height', '760')
    clone.querySelectorAll('.selection-ring,.resize-handle,.connector-anchor').forEach(el => el.remove())
    clone.querySelectorAll('.node-text').forEach(el => el.removeAttribute('tabindex'))
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style'); style.textContent = '.edge{stroke:#aaa99f;stroke-width:2}.node-box{stroke:#d4d4ca;stroke-width:1.5}.node-text{font:600 16px sans-serif;fill:#292b28}'; clone.prepend(style)
    download(`${map?.title || 'mindloom'}.svg`, new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })); setMessage('SVG 圖檔已開始下載。')
  }
  const exportPng = () => {
    const source = svgRef.current
    if (!source) return
    const clone = source.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('viewBox', '0 0 1200 760'); clone.setAttribute('width', '1200'); clone.setAttribute('height', '760')
    clone.querySelectorAll('.selection-ring,.resize-handle,.connector-anchor').forEach(el => el.remove())
    const svg = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(svg); const image = new Image()
    image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1520; const context = canvas.getContext('2d'); if (context) { context.fillStyle = '#fbfbf8'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); canvas.toBlob(blob => { if (blob) { download(`${map?.title || 'mindloom'}.png`, blob); setMessage('PNG 圖檔已開始下載。') } else setMessage('PNG 匯出失敗，請改用 SVG 或 JSON 匯出。') }, 'image/png') } else setMessage('PNG 匯出失敗，請改用 SVG 或 JSON 匯出。'); URL.revokeObjectURL(url) }
    image.onerror = () => { URL.revokeObjectURL(url); setMessage('PNG 匯出失敗，請改用 SVG 或 JSON 匯出。') }; image.src = url
  }
  const exportJson = () => { if (map) { download(`${map.title || 'mindloom'}.json`, new Blob([JSON.stringify(serializeMap(map), null, 2)], { type: 'application/json' })); setMessage('JSON 備份已開始下載。') } }
  const importJson = async (file?: File) => {
    if (!file) return
    try {
      if (file.size > 2_000_000) throw new Error('檔案超過 2 MB，請選擇較小的心智圖備份。')
      const data: unknown = JSON.parse(await file.text())
      const candidate = data && typeof data === 'object' && 'format' in data ? (data as { format?: unknown; version?: unknown; map?: unknown }) : null
      if (!candidate || candidate.format !== 'mindloom' || candidate.version !== 1 || !validateMap(candidate.map)) throw new Error('檔案格式不正確或包含無效的節點資料。')
      const imported = { ...candidate.map, id: crypto.randomUUID(), title: `${candidate.map.title}（匯入）`, updatedAt: Date.now() }
      setMap(imported); setMaps(previous => [imported, ...previous]); setSelected(imported.nodes[0]?.id ?? null); setMessage('JSON 備份已匯入。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '匯入失敗，請檢查檔案。') }
  }
  const eraseMap = async (id: string) => {
    if (!window.confirm(`刪除此心智圖？${nasConnected ? '這會同時從 NAS 移除檔案。' : '這會從目前瀏覽器移除資料。'}建議先匯出 JSON 備份。`)) return
    try {
      await deleteMap(id); const remaining = (await getMaps()).filter(m => m.id !== id); setMaps(remaining); const next = remaining[0] ?? null; setMap(next); setSelected(next?.nodes[0]?.id ?? null); setMessage(nasConnected ? '心智圖已從 NAS 刪除。' : '心智圖已從本機刪除。')
      if (!next) { setSaveState('saved') }
    } catch (error) { setSaveState('error'); setMessage(error instanceof Error ? error.message : '刪除失敗，請重試。') }
  }

  const handleNasConnect = async () => {
    const token = window.prompt('輸入 ArkOS 心智圖專用寫入令牌。驗證成功後會儲存在此瀏覽器，之後開啟 Mindloom 時可沿用。')
    if (!token?.trim()) return
    try {
      const stored = await connectNas(token.trim())
      setNasConnected(true); setMaps(stored)
      const current = stored.find(item => item.id === map?.id) ?? stored[0] ?? null
      setMap(current); setSelected(current?.nodes[0]?.id ?? null)
      setMessage(`NAS 已連線；已同步本機新增的心智圖，共 ${stored.length} 張。`)
    } catch (error) {
      setNasConnected(isNasWriteConnected())
      setMessage(error instanceof Error ? error.message : 'NAS 連線失敗。')
    }
  }

  const handleForgetNasToken = () => {
    forgetNasWriteToken()
    setNasConnected(false)
    setMessage('已清除此瀏覽器的 NAS 令牌；NAS 上的心智圖檔案沒有刪除。')
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches('input,textarea,[contenteditable="true"]')) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (map) saveMap(map).then(() => { setSaveState('saved'); setMessage('已儲存。') }).catch(() => setSaveState('error')) }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') { event.preventDefault(); exportJson() }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setShowHelp(open => !open) }
      else if (event.key.toLowerCase() === 'n') { event.preventDefault(); addTopic() }
      else if (event.key === 'Delete' || event.key === 'Backspace') removeSelected()
      else if (event.key === 'Escape') { setSelected(null); setConnectFrom(null) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  })

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current; if (!drag || !map) return
    const rect = svgRef.current!.getBoundingClientRect(); const x = ((event.clientX - rect.left) * 1200 / rect.width - viewport.x) / viewport.scale; const y = ((event.clientY - rect.top) * 760 / rect.height - viewport.y) / viewport.scale
    const node = nodeAt(drag.id); if (!node) return
    if (drag.resize) updateNode(drag.id, { width: Math.max(100, Math.min(600, x - node.x)), height: Math.max(56, Math.min(300, y - node.y)) })
    else updateNode(drag.id, { x: Math.max(0, x - drag.dx), y: Math.max(0, y - drag.dy) })
  }
  const beginDrag = (event: React.PointerEvent, node: MindNode, resize = false) => {
    if (connectFrom) return
    event.stopPropagation(); const rect = svgRef.current!.getBoundingClientRect(); const x = ((event.clientX - rect.left) * 1200 / rect.width - viewport.x) / viewport.scale; const y = ((event.clientY - rect.top) * 760 / rect.height - viewport.y) / viewport.scale
    dragRef.current = { id: node.id, dx: x - node.x, dy: y - node.y, resize }; (event.currentTarget as SVGElement).setPointerCapture(event.pointerId); setSelected(node.id)
  }
  const handleNodeClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    if (connectFrom) { changeMap(current => connectNodes(current, connectFrom, id)); setConnectFrom(null); setSelected(id); setMessage('連線已建立。') }
    else setSelected(id)
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Mindloom 首頁"><span className="brand-mark">m</span><span>mindloom</span></a>
      <div className="doc-title"><input aria-label="心智圖名稱" value={map?.title ?? ''} disabled={!map} onChange={e => changeMap(m => ({ ...m, title: e.target.value.slice(0, 160), updatedAt: Date.now() }))} /><span className={`save-indicator ${saveState}`}><i />{saveState === 'loading' ? '載入中' : saveState === 'saving' ? '儲存中' : saveState === 'error' ? '儲存異常' : nasConnected ? '已存 NAS' : '僅存本機'}</span></div>
      <div className="top-actions"><button className="tool-button" onClick={handleNasConnect} title="使用心智圖專用令牌連線到 NAS">{nasConnected ? '重新連線 NAS' : '連接 NAS'}</button>{nasConnected && <button className="icon-button" aria-label="忘記此瀏覽器的 NAS 令牌" title="忘記此瀏覽器的 NAS 令牌" onClick={handleForgetNasToken}><X size={17}/></button>}<button className="icon-button" aria-label="快捷鍵說明" title="快捷鍵" onClick={() => setShowHelp(true)}><CircleHelp size={19} /></button><button className="avatar" aria-label={nasConnected ? 'NAS 私人工作區' : '本機私人工作區'}>M</button></div>
    </header>
    <main className="workspace">
      <aside className="sidebar">
        <button className="new-button" onClick={createNew}><FilePlus2 size={17} />新增心智圖 <span>＋</span></button>
        <div className="section-label">你的工作區 <span>{maps.length}</span></div>
        <div className="map-list">{maps.map(item => <div key={item.id} className={`map-row ${map?.id === item.id ? 'active' : ''}`}><button onClick={() => { setMap(item); setSelected(item.nodes[0]?.id ?? null) }}><span className="map-dot" />{item.title}</button><button className="row-delete" aria-label={`刪除 ${item.title}`} onClick={() => void eraseMap(item.id)}><Trash2 size={14} /></button></div>)}</div>
        {!maps.length && <div className="sidebar-empty">還沒有心智圖。<br />建立一張開始整理想法。</div>}
        <div className="sidebar-bottom"><span className="local-badge"><span />私人・{nasConnected ? '已連線 NAS' : '只存在此瀏覽器'}</span><div className="storage-note">{nasConnected ? 'NAS JSON＋本機快取' : '本機快取 · 尚未連線 NAS'}</div></div>
      </aside>
      <section className="editor" aria-label="心智圖編輯器">
        <div className="toolbar"><div className="tool-group"><button className="tool-button primary-tool" onClick={addTopic} disabled={!map} title="新增子主題（N）"><Plus size={16} /><span>新增子主題</span></button><span className="tool-divider" /><button className={`tool-button ${connectFrom ? 'pressed' : ''}`} onClick={() => { setConnectFrom(selected); setMessage(selected ? '選取另一個主題以建立連線。' : '請先選取起點主題。') }} disabled={!selected} title="連線"><Link2 size={16} /><span>{connectFrom ? '選擇終點…' : '連線'}</span></button><button className="tool-button" disabled={!selected} onClick={removeSelected} title="刪除主題"><Trash2 size={16} /></button></div><div className="tool-group"><button className="tool-button" aria-label="縮小畫布" onClick={() => setViewport(v => ({ ...v, scale: Math.max(.5, v.scale - .1) }))}><Minus size={16} /></button><span className="zoom-label">{Math.round(viewport.scale * 100)}%</span><button className="tool-button" aria-label="放大畫布" onClick={() => setViewport(v => ({ ...v, scale: Math.min(1.5, v.scale + .1) }))}><Plus size={16} /></button><span className="tool-divider"/><div className="menu-wrap"><button className="tool-button" aria-label="匯出 JSON" onClick={exportJson} title="匯出 JSON"><ArrowDownToLine size={16} /><span>匯出</span><ChevronDown size={13}/></button><div className="export-menu"><button onClick={exportJson}>JSON 備份</button><button onClick={exportSvg}>SVG 圖檔</button><button onClick={exportPng}>PNG 圖檔</button><label tabIndex={0} role="button" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget.querySelector('input') as HTMLInputElement).click() } }}>匯入 JSON<input type="file" accept="application/json,.json" onChange={e => { void importJson(e.target.files?.[0]); e.target.value = '' }} /></label></div></div></div></div>
        {map ? <div className="canvas-frame"><div className="canvas-caption"><span><MousePointer2 size={14}/>選取主題以編輯・拖曳以排列</span><button onClick={() => setViewport(initialViewport)}>重設視圖</button></div><svg ref={svgRef} className="mind-canvas" viewBox="0 0 1200 760" role="application" aria-label="心智圖畫布" onPointerMove={handlePointerMove} onPointerUp={() => { dragRef.current = null }} onClick={() => { setSelected(null); setConnectFrom(null) }}>
          <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e5e5de"/></pattern></defs><rect width="1200" height="760" fill="url(#dots)" />
          <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
            {map.edges.map(edge => { const from = nodeAt(edge.from), to = nodeAt(edge.to); if (!from || !to) return null; return <path key={edge.id} className="edge" d={`M ${from.x + from.width/2} ${from.y + from.height/2} C ${(from.x + to.x + to.width)/2} ${from.y + from.height/2}, ${(from.x + to.x)/2} ${to.y + to.height/2}, ${to.x + to.width/2} ${to.y + to.height/2}`} /> })}
            {map.nodes.map(node => <g key={node.id} className={`mind-node ${selected === node.id ? 'selected' : ''}`} onClick={e => handleNodeClick(e, node.id)} onPointerDown={e => beginDrag(e, node)} tabIndex={0} role="button" aria-label={`主題：${node.text}`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(e as unknown as React.MouseEvent, node.id) } }}>
              {selected === node.id && <rect className="selection-ring" x={node.x - 5} y={node.y - 5} width={node.width + 10} height={node.height + 10} rx="15" />}
              <rect className="node-box" x={node.x} y={node.y} width={node.width} height={node.height} rx="11" fill={node.color} />
              <foreignObject x={node.x + 12} y={node.y + 8} width={node.width - 24} height={node.height - 16}><div className="node-text">{node.text}</div></foreignObject>
              {selected === node.id && <rect className="resize-handle" x={node.x + node.width - 6} y={node.y + node.height - 6} width="12" height="12" rx="3" onPointerDown={e => { e.stopPropagation(); beginDrag(e, node, true) }} />}
            </g>)}
          </g>
        </svg>{map.id === 'sample-map' && <div className="sample-tag">✦ 示範資料 · 可在左側刪除</div>}{!map.nodes.length && <div className="empty-overlay"><div className="empty-icon"><Share2 size={24}/></div><h2>從一個想法開始</h2><p>新增第一個主題，慢慢把想法連起來。</p><button className="new-button" onClick={createNew}><Plus size={16}/>建立心智圖</button></div>}</div> : saveState === 'loading' ? <div className="blank-state"><div className="empty-icon"><FolderOpen size={24}/></div><h2>正在載入本機資料</h2><p>正在讀取此瀏覽器中的心智圖…</p></div> : saveState === 'error' ? <div className="blank-state"><div className="empty-icon"><CircleHelp size={24}/></div><h2>無法載入本機資料</h2><p>{message || '請確認瀏覽器允許使用 IndexedDB。'}</p><button className="new-button" onClick={() => window.location.reload()}>重新載入</button></div> : <div className="blank-state"><div className="empty-icon"><FolderOpen size={24}/></div><h2>你的工作區還是空的</h2><p>建立新的心智圖，或從 JSON 備份匯入。</p><button className="new-button" onClick={createNew}><Plus size={16}/>建立心智圖</button></div>}
        <footer className="statusbar"><span>{message || (connectFrom ? '選擇連線的目標主題' : nasConnected ? '心智圖 JSON 已同步至 NAS，並保留本機快取' : '尚未連線 NAS；變更目前只保存在此瀏覽器')}{message && <button aria-label="關閉訊息" onClick={() => setMessage('')}><X size={13}/></button>}</span><span className="status-shortcuts"><kbd>N</kbd> 新增子主題 <kbd>Del</kbd> 刪除 <kbd>Esc</kbd> 取消</span></footer>
      </section>
      <aside className="inspector"><div className="inspector-title">主題內容 <span>編輯器</span></div>{selectedNode ? <><label className="field-label" htmlFor="topic-text">主題文字</label><textarea id="topic-text" value={selectedNode.text} maxLength={500} rows={4} onChange={e => updateNode(selectedNode.id, { text: e.target.value })} /><div className="char-count">{selectedNode.text.length} / 500</div><div className="field-label color-label">卡片顏色</div><div className="color-options">{palette.map(color => <button key={color} aria-label={`設定顏色 ${color}`} aria-pressed={selectedNode.color === color} className={selectedNode.color === color ? 'color-swatch active' : 'color-swatch'} style={{ background: color }} onClick={() => updateNode(selectedNode.id, { color })}/>)}</div><div className="inspector-divider"/><div className="property-row"><span>位置</span><span>{Math.round(selectedNode.x)}, {Math.round(selectedNode.y)}</span></div><div className="property-row"><span>尺寸</span><span>{Math.round(selectedNode.width)} × {Math.round(selectedNode.height)}</span></div><p className="inspector-hint">拖曳卡片調整位置，拖右下角調整大小。</p></> : <div className="inspector-empty"><div className="mini-cursor"><MousePointer2 size={20}/></div><p>點選畫布上的主題，<br/>在這裡編輯文字與外觀。</p></div>}
        <div className="inspector-bottom"><button className="help-link" onClick={() => setShowHelp(true)}><Keyboard size={15}/>鍵盤快速鍵 <span>⌘ / Ctrl K</span></button><div className="about-note">Mindloom · 個人心智圖工作桌<br/>{nasConnected ? 'NAS JSON 同步＋IndexedDB 本機快取。' : '目前儲存在此瀏覽器；連接 NAS 後可跨裝置編輯。'}</div></div></aside>
    </main>
    {showHelp && <div className="modal-backdrop" role="presentation" onClick={() => setShowHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="關閉" onClick={() => setShowHelp(false)}><X size={18}/></button><div className="modal-kicker">快速上手</div><h2 id="help-title">用鍵盤加快整理</h2><div className="shortcut-row"><span>新增子主題</span><kbd>N</kbd></div><div className="shortcut-row"><span>刪除選取主題</span><kbd>Delete</kbd></div><div className="shortcut-row"><span>取消選取 / 連線</span><kbd>Esc</kbd></div><div className="shortcut-row"><span>立即儲存</span><kbd>Ctrl / ⌘ S</kbd></div><div className="shortcut-row"><span>匯出 JSON 備份</span><kbd>Ctrl / ⌘ E</kbd></div><p className="modal-footnote">連接 NAS 後可跨裝置編輯；JSON 備份仍可匯入匯出。</p></section></div>}
  </div>
}
