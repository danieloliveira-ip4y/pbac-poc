import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { permissionGuard } from '../guards/permission.guard'
import { usePermissionStore } from '../stores/permission.store'

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
  {
    path: '/settings',
    name: 'settings',
    component: { template: '<div>settings</div>' },
    meta: { requiresAuth: true, permissions: ['settings.view'], permissionMode: 'all' },
  },
]

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  router.beforeEach(permissionGuard)
  return router
}

describe('permissionGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('allows an authenticated user with the required permission', async () => {
    const authStore = useAuthStore()
    const router = createTestRouter()

    authStore.login('admin')
    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(usePermissionStore().isLoaded).toBe(true)
  })

  it('redirects an authenticated user without permission to Forbidden', async () => {
    const authStore = useAuthStore()
    const router = createTestRouter()

    authStore.login('viewer')
    await router.push('/settings')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('redirects an unauthenticated user to login', async () => {
    const router = createTestRouter()

    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('allows a public route without authentication', async () => {
    const router = createTestRouter()

    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('does not loop when an authenticated user visits login', async () => {
    const authStore = useAuthStore()
    const router = createTestRouter()

    authStore.login('admin')
    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
