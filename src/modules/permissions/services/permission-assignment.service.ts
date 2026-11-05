import type { Router } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { saveUserPermissions } from '../api/permission.client'
import { evaluateRouteAccess } from '../guards/permission.guard'
import { permissionLogger } from '../logger/permission.logger'
import { usePermissionStore } from '../stores/permission.store'
import type { PermissionNode, PermissionsResponse } from '../types/permission.types'

export async function saveAssignedPermissions(
  userId: number,
  tree: PermissionNode[],
  router: Router,
): Promise<PermissionsResponse> {
  permissionLogger.trace('admin', 'save.start', `Persistindo árvore do usuário ${userId}`, {
    userId,
  })
  const response = await saveUserPermissions(userId, tree)
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  if (authStore.user?.id === userId) {
    permissionLogger.trace(
      'admin',
      'save.apply',
      'Atribuição aplicada à sessão atual',
      { userId, count: response.permissions.length },
    )
    permissionStore.updatePermissions(response.permissions)
    const access = await evaluateRouteAccess(router.currentRoute.value)
    if (access !== true) {
      await router.replace(access)
    }
  } else {
    permissionLogger.trace(
      'admin',
      'save.stored',
      'Atribuição salva para outro usuário',
      { userId, count: response.permissions.length },
    )
  }

  return response
}
