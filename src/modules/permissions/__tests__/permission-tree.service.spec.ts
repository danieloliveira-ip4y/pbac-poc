import { describe, expect, it } from 'vitest'
import { pixPermissionTree } from '@/mocks/permission-tree.mock'
import {
  cloneTree,
  collectAssigned,
  collectAssignedKeys,
  nodeCheckState,
  toSavePayload,
  toggleNode,
} from '../services/permission-tree.service'

describe('permission-tree.service', () => {
  it('collects only nodes with assigned true', () => {
    const tree = cloneTree(pixPermissionTree)
    const assigned = collectAssigned(tree)

    expect(assigned.map((node) => node.id)).toEqual([3, 5, 10])
    expect(collectAssignedKeys(tree)).toEqual(['pix.approve', 'pix.charge.create', 'pix.pos.view'])
    expect(collectAssignedKeys(tree).some((key) => /^permission:\d+$/.test(key))).toBe(false)
  })

  it('toggles a leaf and then restores it', () => {
    const tree = cloneTree(pixPermissionTree)
    const incluir = tree[0]?.children[0]
    expect(incluir?.id).toBe(2)
    if (!incluir) {
      throw new Error('PIX / Incluir not found')
    }

    expect(toggleNode(incluir)).toBe(true)
    expect(incluir.assigned).toBe(true)
    expect(toggleNode(incluir)).toBe(false)
    expect(incluir.assigned).toBe(false)
  })

  it('cascades a group checkbox to all descendants', () => {
    const tree = cloneTree(pixPermissionTree)
    const receber = tree[0]?.children.find((node) => node.id === 4)
    if (!receber) {
      throw new Error('PIX / Receber not found')
    }

    expect(nodeCheckState(receber)).toBe('indeterminate')
    expect(toggleNode(receber)).toBe(true)
    expect(nodeCheckState(receber)).toBe('checked')
    expect(receber.children.every((child) => child.assigned === true)).toBe(true)
  })

  it('builds a save payload without internal keys', () => {
    const payload = toSavePayload(cloneTree(pixPermissionTree))
    const pix = payload[0]

    expect(pix?.id).toBe(1)
    expect(pix?.assigned).toBeUndefined()
    expect(pix?.key).toBeUndefined()
    expect(JSON.parse(JSON.stringify(payload))[0].description).toBe('PIX')
  })
})
