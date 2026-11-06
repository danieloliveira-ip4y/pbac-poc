import type { Permission, PermissionMode } from '../modules/permissions/types/permission.types'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permissions?: Permission[]
    permissionMode?: PermissionMode
  }
}
