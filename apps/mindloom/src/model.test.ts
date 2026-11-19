import { describe, expect, it } from 'vitest'
import { addChild, connectNodes, createMap, removeNode, sampleMap, validateMap } from './model'

describe('mind map model', () => {
  it('creates a root, adds a child and removes its connected edge', () => {
    const root = createMap('測試')
    const withChild = addChild(root, root.nodes[0].id)
    expect(withChild.nodes).toHaveLength(2)
    expect(withChild.edges).toHaveLength(1)
    const clean = removeNode(withChild, withChild.nodes[1].id)
    expect(clean.nodes).toHaveLength(1)
    expect(clean.edges).toHaveLength(0)
  })

  it('rejects malformed or unsafe imported map shapes', () => {
    const sample = sampleMap()
    expect(validateMap(sample)).toBe(true)
    expect(validateMap({ ...sample, edges: [{ id: 'bad', from: 'missing', to: sample.nodes[0].id }] })).toBe(false)
    expect(validateMap({ ...sample, nodes: [{ ...sample.nodes[0], width: -2 }] })).toBe(false)
    expect(validateMap({ ...sample, title: 'x'.repeat(161) })).toBe(false)
  })

  it('connects only distinct existing nodes and avoids duplicate edges', () => {
    const sample = sampleMap()
    const next = connectNodes(sample, sample.nodes[1].id, sample.nodes[2].id)
    expect(next.edges).toHaveLength(sample.edges.length + 1)
    expect(connectNodes(next, sample.nodes[1].id, sample.nodes[2].id)).toBe(next)
    expect(connectNodes(next, sample.nodes[1].id, sample.nodes[1].id)).toBe(next)
  })
})
