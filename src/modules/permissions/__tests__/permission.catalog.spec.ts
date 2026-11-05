import { describe, expect, it } from 'vitest'
import { permissionCatalog } from '@/mocks/permission-tree.mock'
import { PERMISSIONS, isPermission, retainKnownPermissions } from '../catalog/permissions'
import { collectAssignable, nodePermissionKey } from '../services/permission-tree.service'

describe('permission catalog', () => {
  it('lists the same keys as grantable nodes in the tree', () => {
    const fromTree = collectAssignable(permissionCatalog)
      .map(nodePermissionKey)
      .sort()
    const fromCatalog = [...PERMISSIONS].sort()

    expect(fromTree).toEqual(fromCatalog)
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length)
  })

  it('keeps only known permission strings', () => {
    expect(isPermission('users.view')).toBe(true)
    expect(isPermission('users.veiw')).toBe(false)
    expect(retainKnownPermissions(['users.view', 'users.veiw', 'pix.approve'])).toEqual([
      'users.view',
      'pix.approve',
    ])
  })
})
