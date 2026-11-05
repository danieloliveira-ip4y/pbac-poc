import { describe, expect, it } from 'vitest'
import { createPermissionService } from '../services/permission.service'

const granted = ['dashboard.view', 'users.view', 'users.create', 'users.view'] as const

describe('PermissionService', () => {
  it('allows a permission the user has', () => {
    const service = createPermissionService(granted)

    expect(service.can('users.view')).toBe(true)
  })

  it('denies a permission the user does not have', () => {
    const service = createPermissionService(granted)

    expect(service.can('users.delete')).toBe(false)
  })

  it('evaluates canAny as true when at least one permission matches', () => {
    const service = createPermissionService(granted)

    expect(service.canAny(['users.delete', 'users.create'])).toBe(true)
  })

  it('evaluates canAny as false when none of the permissions match', () => {
    const service = createPermissionService(granted)

    expect(service.canAny(['users.delete', 'settings.update'])).toBe(false)
  })

  it('evaluates canAll as true when every permission matches', () => {
    const service = createPermissionService(granted)

    expect(service.canAll(['dashboard.view', 'users.view'])).toBe(true)
  })

  it('evaluates canAll as false when any permission is missing', () => {
    const service = createPermissionService(granted)

    expect(service.canAll(['users.view', 'users.delete'])).toBe(false)
  })

  it('uses mode all in check()', () => {
    const service = createPermissionService(granted)

    expect(service.check(['users.view', 'users.create'], 'all')).toBe(true)
    expect(service.check(['users.view', 'users.delete'], 'all')).toBe(false)
  })

  it('uses mode any in check()', () => {
    const service = createPermissionService(granted)

    expect(service.check(['users.delete', 'users.create'], 'any')).toBe(true)
    expect(service.check(['users.delete', 'settings.update'], 'any')).toBe(false)
  })

  it('defaults check() to all', () => {
    const service = createPermissionService(granted)

    expect(service.check(['users.view', 'users.delete'])).toBe(false)
  })

  it('treats an empty list as deny for any and allow for all', () => {
    const service = createPermissionService(granted)

    expect(service.canAny([])).toBe(false)
    expect(service.canAll([])).toBe(true)
    expect(service.check([], 'any')).toBe(false)
    expect(service.check([], 'all')).toBe(true)
  })

  it('handles duplicated granted and required permissions', () => {
    const service = createPermissionService(granted)

    expect(service.can('users.view')).toBe(true)
    expect(service.canAll(['users.view', 'users.view'])).toBe(true)
    expect(service.canAny(['users.view', 'users.view'])).toBe(true)
  })
})
