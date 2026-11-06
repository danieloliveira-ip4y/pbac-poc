import type { Router } from 'vue-router'
import { evaluateRouteAccess } from '@/modules/permissions/guards/permission.guard'
import { permissionLogger } from '@/modules/permissions/logger/permission.logger'
import { usePermissionStore } from '@/modules/permissions/stores/permission.store'
import type { UserProfile } from '@/modules/permissions/types/permission.types'
import { useAuthStore } from '../stores/auth.store'

export async function loginWithProfile(profile: UserProfile): Promise<void> {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  permissionLogger.trace('auth', 'login', `Login como ${profile}`, { profile })
  authStore.login(profile)
  await permissionStore.loadPermissions(profile)
}

export function logout(): void {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  permissionLogger.trace('auth', 'logout', 'Sessão encerrada')
  authStore.logout()
  permissionStore.clearPermissions()
}

export async function switchProfile(profile: UserProfile, router: Router): Promise<void> {
  permissionLogger.trace('auth', 'switch', `Troca de perfil para ${profile}`, { profile })
  await loginWithProfile(profile)

  const access = await evaluateRouteAccess(router.currentRoute.value)
  if (access !== true) {
    await router.replace(access)
  }
}
