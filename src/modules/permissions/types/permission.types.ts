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

/**
 * Tree node matching the Laravel catalog payload.
 * `assigned` exists only on grantable permissions. Nodes without it are groups.
 * `key` is optional and used by the PoC to bind a node to a frontend permission string.
 */
export interface PermissionNode {
  id: number
  description: string
  assigned?: boolean
  children: PermissionNode[]
  key?: Permission
}

export type PermissionCheckState = 'checked' | 'unchecked' | 'indeterminate'
