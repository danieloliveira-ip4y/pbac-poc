import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildDefaultPermissionTree,
  resetPermissionAssignments,
} from '@/mocks/permission-tree.mock'
import { permissionsByProfile } from '@/mocks/permissions.mock'
import * as permissionClient from '../api/permission.client'
import { collectAssignedKeys } from '../services/permission-tree.service'
import { usePermissionStore } from '../stores/permission.store'

describe('PermissionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    resetPermissionAssignments()
  })

  it('loads mocked permissions', async () => {
    const store = usePermissionStore()

    await store.loadPermissions('admin')

    expect(store.permissions).toEqual(collectAssignedKeys(buildDefaultPermissionTree('admin')))
    expect(store.permissions).toEqual(expect.arrayContaining(permissionsByProfile.admin))
    expect(store.isLoaded).toBe(true)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('exposes a loading state while fetching permissions', async () => {
    const store = usePermissionStore()
    const pending = store.loadPermissions('operator')

    expect(store.isLoading).toBe(true)
    expect(store.isLoaded).toBe(false)

    await pending

    expect(store.isLoading).toBe(false)
    expect(store.isLoaded).toBe(true)
    expect(store.permissions).toEqual(collectAssignedKeys(buildDefaultPermissionTree('operator')))
    expect(store.permissions).toEqual(expect.arrayContaining(permissionsByProfile.operator))
  })

  it('updates permissions without a reload', () => {
    const store = usePermissionStore()

    store.updatePermissions(['reports.view'])

    expect(store.permissions).toEqual(['reports.view'])
    expect(store.isLoaded).toBe(true)
    expect(store.isLoading).toBe(false)
  })

  it('clears permissions and load flags', async () => {
    const store = usePermissionStore()
    await store.loadPermissions('admin')

    store.clearPermissions()

    expect(store.permissions).toEqual([])
    expect(store.isLoaded).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('records an error when loading fails', async () => {
    vi.spyOn(permissionClient, 'fetchCurrentUserPermissions').mockRejectedValueOnce(
      new Error('network'),
    )
    const store = usePermissionStore()

    await expect(store.loadPermissions('admin')).rejects.toThrow('network')

    expect(store.permissions).toEqual([])
    expect(store.isLoaded).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('network')
  })
})
