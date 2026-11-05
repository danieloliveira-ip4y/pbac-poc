import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCurrentUserPermissions } from '../api/permission.client'
import { permissionLogger } from '../logger/permission.logger'
import type { Permission, UserProfile } from '../types/permission.types'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<Permission[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  let requestId = 0

  const permissionCount = computed(() => permissions.value.length)

  async function loadPermissions(profile: UserProfile): Promise<void> {
    const currentRequestId = ++requestId
    isLoading.value = true
    error.value = null
    permissionLogger.trace('store', 'load.start', `Carregando permissões de ${profile}`, {
      profile,
    })

    try {
      const response = await fetchCurrentUserPermissions(profile)

      if (currentRequestId !== requestId) {
        permissionLogger.trace('store', 'load.stale', 'Resposta ignorada (request desatualizado)', {
          profile,
        })
        return
      }

      permissions.value = [...response.permissions]
      isLoaded.value = true
      permissionLogger.trace(
        'store',
        'load.success',
        `${response.permissions.length} permissões carregadas`,
        { profile, count: response.permissions.length },
      )
    } catch (reason) {
      if (currentRequestId !== requestId) {
        return
      }

      permissions.value = []
      isLoaded.value = false
      error.value = reason instanceof Error ? reason.message : 'Falha ao carregar permissões'
      permissionLogger.trace('store', 'load.error', error.value, { profile })
      throw reason
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false
      }
    }
  }

  function updatePermissions(nextPermissions: Permission[]): void {
    requestId += 1
    permissions.value = [...nextPermissions]
    isLoading.value = false
    isLoaded.value = true
    error.value = null
    permissionLogger.trace(
      'store',
      'update',
      `Store atualizado com ${nextPermissions.length} permissões`,
      { count: nextPermissions.length },
    )
  }

  function clearPermissions(): void {
    requestId += 1
    permissions.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
    permissionLogger.trace('store', 'clear', 'Permissões removidas da sessão')
  }

  return {
    permissions,
    isLoading,
    isLoaded,
    error,
    permissionCount,
    loadPermissions,
    updatePermissions,
    clearPermissions,
  }
})
