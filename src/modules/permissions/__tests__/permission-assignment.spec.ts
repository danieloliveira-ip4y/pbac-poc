import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  buildDefaultPermissionTree,
  resetPermissionAssignments,
} from '@/mocks/permission-tree.mock'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { saveAssignedPermissions } from '../services/permission-assignment.service'
import { collectAssignedKeys, toggleNode } from '../services/permission-tree.service'
import { usePermissionStore } from '../stores/permission.store'

describe('saveAssignedPermissions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetPermissionAssignments()
  })

  it('updates the live store when the assigned user is the one logged in', async () => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })

    authStore.login('admin')
    await permissionStore.loadPermissions('admin')

    const tree = buildDefaultPermissionTree('admin')
    const pix = tree.find((node) => node.id === 1)
    const incluir = pix?.children.find((node) => node.id === 2)
    if (!incluir) {
      throw new Error('PIX / Incluir not found')
    }
    toggleNode(incluir)

    await saveAssignedPermissions(1, tree, router)

    expect(permissionStore.permissions).toEqual(collectAssignedKeys(tree))
    expect(permissionStore.permissions).toContain('pix.create')
  })
})
