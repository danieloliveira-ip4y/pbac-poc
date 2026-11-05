import type { NavigationGuard, RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { permissionLogger } from '../logger/permission.logger'
import { createPermissionService } from '../services/permission.service'
import { usePermissionStore } from '../stores/permission.store'

function describeAccess(result: true | RouteLocationRaw): string {
  if (result === true) {
    return 'allow'
  }

  if (typeof result === 'string') {
    return `redirect:${result}`
  }

  if ('name' in result && result.name) {
    return `redirect:${String(result.name)}`
  }

  if ('path' in result && result.path) {
    return `redirect:${result.path}`
  }

  return 'redirect'
}

export async function evaluateRouteAccess(
  to: RouteLocationNormalized,
): Promise<true | RouteLocationRaw> {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const requiresAuth = to.meta.requiresAuth === true
  const path = to.fullPath

  permissionLogger.trace('guard', 'evaluate.start', `Avaliando ${path}`, {
    path,
    requiresAuth,
  })

  if (!requiresAuth) {
    if (to.name === 'login' && authStore.isAuthenticated) {
      const result = { name: 'dashboard' } as const
      permissionLogger.trace('guard', 'evaluate.result', 'Já autenticado, vai ao dashboard', {
        path,
        result: describeAccess(result),
      })
      return result
    }

    permissionLogger.trace('guard', 'evaluate.result', 'Rota pública liberada', {
      path,
      result: 'allow',
    })
    return true
  }

  if (!authStore.isAuthenticated || !authStore.currentProfile) {
    const result = {
      name: 'login',
      query: { redirect: to.fullPath },
    } as const
    permissionLogger.trace('guard', 'evaluate.result', 'Não autenticado, vai ao login', {
      path,
      result: describeAccess(result),
    })
    return result
  }

  const requiredPermissions = to.meta.permissions ?? []
  if (requiredPermissions.length === 0) {
    const result = { name: 'forbidden' } as const
    permissionLogger.trace(
      'guard',
      'evaluate.result',
      'Rota autenticada sem permissões declaradas',
      {
        path,
        result: describeAccess(result),
      },
    )
    return result
  }

  if (!permissionStore.isLoaded) {
    try {
      permissionLogger.trace('guard', 'permissions.load', 'Permissões ainda não carregadas', {
        path,
      })
      await permissionStore.loadPermissions(authStore.currentProfile)
    } catch {
      const result = { name: 'forbidden' } as const
      permissionLogger.trace('guard', 'evaluate.result', 'Falha ao carregar permissões', {
        path,
        result: describeAccess(result),
      })
      return result
    }
  }

  const mode = to.meta.permissionMode ?? 'all'
  const allowed = createPermissionService(permissionStore.permissions).check(
    requiredPermissions,
    mode,
  )

  if (!allowed) {
    const result = { name: 'forbidden' } as const
    permissionLogger.trace('guard', 'evaluate.result', 'Sem permissão para a rota', {
      path,
      mode,
      required: requiredPermissions.join(', ') || '(nenhuma)',
      result: describeAccess(result),
    })
    return result
  }

  permissionLogger.trace('guard', 'evaluate.result', 'Acesso permitido', {
    path,
    mode,
    required: requiredPermissions.join(', ') || '(nenhuma)',
    result: 'allow',
  })
  return true
}

export const permissionGuard: NavigationGuard = async (to) => {
  return evaluateRouteAccess(to)
}
