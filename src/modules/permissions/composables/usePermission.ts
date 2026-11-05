import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '../stores/permission.store'
import { createPermissionService } from '../services/permission.service'
import type { Permission, PermissionMode } from '../types/permission.types'

export function usePermission() {
  const permissionStore = usePermissionStore()
  const { permissions, isLoading, isLoaded, error } = storeToRefs(permissionStore)

  const service = computed(() => createPermissionService(permissions.value))

  function can(permission: Permission): boolean {
    return service.value.can(permission)
  }

  function canAny(required: readonly Permission[]): boolean {
    return service.value.canAny(required)
  }

  function canAll(required: readonly Permission[]): boolean {
    return service.value.canAll(required)
  }

  function check(required: readonly Permission[], mode: PermissionMode = 'all'): boolean {
    return service.value.check(required, mode)
  }

  return {
    can,
    canAny,
    canAll,
    check,
    isLoading,
    isLoaded,
    error,
  }
}
