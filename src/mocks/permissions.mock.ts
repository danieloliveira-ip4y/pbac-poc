import type {
  Permission,
  PermissionsResponse,
  UserProfile,
} from '@/modules/permissions/types/permission.types'

/**
 * Contract sample for GET /api/me/permissions (Laravel).
 * Kept as documentation of the backend payload shape.
 */
export const laravelPermissionsContract: PermissionsResponse = {
  permissions: [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.update',
    'reports.view',
    'reports.export',
    'settings.view',
  ],
}

export const permissionsByProfile: Record<UserProfile, Permission[]> = {
  admin: [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'reports.view',
    'reports.export',
    'settings.view',
    'settings.update',
  ],
  operator: ['dashboard.view', 'users.view', 'users.create', 'reports.view'],
  viewer: ['dashboard.view', 'reports.view'],
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function fetchMockPermissions(profile: UserProfile): Promise<PermissionsResponse> {
  const latency = import.meta.env.MODE === 'test' ? 0 : 120
  await wait(latency)

  const permissions = permissionsByProfile[profile]

  if (!permissions) {
    throw new Error(`Perfil de permissões desconhecido: ${profile}`)
  }

  return { permissions: [...permissions] }
}
