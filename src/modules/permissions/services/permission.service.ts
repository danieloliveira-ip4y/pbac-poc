import type { Permission, PermissionMode } from '../types/permission.types'

/**
 * Pure authorization evaluator.
 * Has no dependency on Vue, Pinia, HTTP, or the current user session.
 */
export class PermissionService {
  private readonly granted: ReadonlySet<Permission>

  constructor(permissions: readonly Permission[]) {
    this.granted = new Set(permissions)
  }

  can(permission: Permission): boolean {
    return this.granted.has(permission)
  }

  /**
   * Empty list is denied: there is no candidate permission to satisfy.
   */
  canAny(permissions: readonly Permission[]): boolean {
    if (permissions.length === 0) {
      return false
    }

    return permissions.some((permission) => this.granted.has(permission))
  }

  /**
   * Empty list is allowed: there is no required permission to satisfy.
   */
  canAll(permissions: readonly Permission[]): boolean {
    if (permissions.length === 0) {
      return true
    }

    return permissions.every((permission) => this.granted.has(permission))
  }

  check(permissions: readonly Permission[], mode: PermissionMode = 'all'): boolean {
    return mode === 'any' ? this.canAny(permissions) : this.canAll(permissions)
  }
}

export function createPermissionService(permissions: readonly Permission[]): PermissionService {
  return new PermissionService(permissions)
}
