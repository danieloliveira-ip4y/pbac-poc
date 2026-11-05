import type { Router } from 'vue-router'
import { evaluateRouteAccess } from '@/modules/permissions/guards/permission.guard'
import { usePermissionStore } from '@/modules/permissions/stores/permission.store'
import type { UserProfile } from '@/modules/permissions/types/permission.types'
import { useAuthStore } from '../stores/auth.store'

export async function loginWithProfile(profile: UserProfile): Promise<void> {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  authStore.login(profile)
  await permissionStore.loadPermissions(profile)
}

export function logout(): void {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  authStore.logout()
  permissionStore.clearPermissions()
}

export async function switchProfile(profile: UserProfile, router: Router): Promise<void> {
  await loginWithProfile(profile)

  const access = await evaluateRouteAccess(router.currentRoute.value)
  if (access !== true) {
    await router.replace(access)
  }
}
