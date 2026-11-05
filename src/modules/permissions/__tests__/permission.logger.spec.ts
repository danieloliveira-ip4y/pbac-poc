import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { permissionGuard } from '../guards/permission.guard'
import { permissionLogger } from '../logger/permission.logger'
import { saveAssignedPermissions } from '../services/permission-assignment.service'
import { toggleNode } from '../services/permission-tree.service'
import { usePermissionStore } from '../stores/permission.store'
import {
  buildDefaultPermissionTree,
  resetPermissionAssignments,
} from '@/mocks/permission-tree.mock'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: { template: '<div>login</div>' },
    meta: { requiresAuth: false },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: { template: '<div>forbidden</div>' },
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: { template: '<div>dashboard</div>' },
    meta: { requiresAuth: true, permissions: ['dashboard.view'], permissionMode: 'all' },
  },
]

function eventNames(): string[] {
  return permissionLogger.getEntries().map((entry) => `${entry.layer}:${entry.event}`)
}

describe('permissionLogger', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    permissionLogger.reset()
    resetPermissionAssignments()
  })

  it('records events in insertion order with a monotonic sequence', () => {
    permissionLogger.trace('auth', 'login', 'primeiro')
    permissionLogger.trace('store', 'load.start', 'segundo')
    permissionLogger.trace('guard', 'evaluate.result', 'terceiro')

    const entries = permissionLogger.getEntries()

    expect(entries.map((entry) => entry.seq)).toEqual([1, 2, 3])
    expect(entries.map((entry) => entry.message)).toEqual(['primeiro', 'segundo', 'terceiro'])
  })

  it('keeps sequence after clear and restarts it on reset', () => {
    permissionLogger.trace('auth', 'login', 'a')
    permissionLogger.clear()

    expect(permissionLogger.getEntries()).toEqual([])

    const afterClear = permissionLogger.trace('store', 'update', 'b')
    expect(afterClear.seq).toBe(2)

    permissionLogger.reset()
    const afterReset = permissionLogger.trace('guard', 'evaluate.start', 'c')
    expect(afterReset.seq).toBe(1)
  })

  it('notifies subscribers in the same order as stored entries', () => {
    const listener = vi.fn()
    const unsubscribe = permissionLogger.subscribe(listener)

    permissionLogger.trace('admin', 'save.start', 'persistindo')

    expect(listener).toHaveBeenCalledTimes(2)
    const latest = listener.mock.calls[1]?.[0] as ReturnType<typeof permissionLogger.getEntries>
    expect(latest.map((entry) => entry.event)).toEqual(['save.start'])

    unsubscribe()
    permissionLogger.trace('admin', 'save.apply', 'aplicado')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('traces store load as start then success', async () => {
    const store = usePermissionStore()

    await store.loadPermissions('viewer')

    expect(eventNames()).toEqual(['store:load.start', 'store:load.success'])
  })

  it('traces guard evaluation before the access result', async () => {
    const authStore = useAuthStore()
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    router.beforeEach(permissionGuard)

    authStore.login('admin')
    await router.push('/dashboard')

    expect(eventNames()).toEqual([
      'guard:evaluate.start',
      'guard:permissions.load',
      'store:load.start',
      'store:load.success',
      'guard:evaluate.result',
    ])
    const entries = permissionLogger.getEntries()
    expect(entries[entries.length - 1]?.details?.result).toBe('allow')
  })

  it('traces admin save then store update when the target is the logged-in user', async () => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })

    authStore.login('admin')
    await permissionStore.loadPermissions('admin')
    permissionLogger.reset()

    const tree = buildDefaultPermissionTree('admin')
    const pix = tree.find((node) => node.id === 1)
    const incluir = pix?.children.find((node) => node.id === 2)
    if (!incluir) {
      throw new Error('PIX / Incluir not found')
    }
    toggleNode(incluir)

    await saveAssignedPermissions(1, tree, router)

    expect(eventNames()[0]).toBe('admin:save.start')
    expect(eventNames()[1]).toBe('admin:save.apply')
    expect(eventNames()[2]).toBe('store:update')
    expect(eventNames()).toContain('guard:evaluate.start')
  })
})
