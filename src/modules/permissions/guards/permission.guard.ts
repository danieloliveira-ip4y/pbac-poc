import type { NavigationGuard, RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { createPermissionService } from '../services/permission.service'
import { usePermissionStore } from '../stores/permission.store'

export async function evaluateRouteAccess(
  to: RouteLocationNormalized,
): Promise<true | RouteLocationRaw> {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const requiresAuth = to.meta.requiresAuth === true

  if (!requiresAuth) {
    if (to.name === 'login' && authStore.isAuthenticated) {
      return { name: 'dashboard' }
    }

    return true
  }

  if (!authStore.isAuthenticated || !authStore.currentProfile) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (!permissionStore.isLoaded) {
    try {
      await permissionStore.loadPermissions(authStore.currentProfile)
    } catch {
      return { name: 'forbidden' }
    }
  }

  const requiredPermissions = to.meta.permissions ?? []
  const mode = to.meta.permissionMode ?? 'all'
  const allowed = createPermissionService(permissionStore.permissions).check(
    requiredPermissions,
    mode,
  )

  if (!allowed) {
    return { name: 'forbidden' }
  }

  return true
}

export const permissionGuard: NavigationGuard = async (to) => {
  return evaluateRouteAccess(to)
}
