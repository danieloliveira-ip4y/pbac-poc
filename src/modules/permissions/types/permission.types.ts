export type Permission = string

export type PermissionMode = 'all' | 'any'

export type UserProfile = 'admin' | 'operator' | 'viewer'

export interface PermissionsResponse {
  permissions: Permission[]
}

export interface PermissionCheckOptions {
  permissions: Permission[]
  mode?: PermissionMode
}

export type PermissionDirectiveValue = Permission | Permission[] | PermissionCheckOptions
