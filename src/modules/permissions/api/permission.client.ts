import { fetchMockPermissions } from '@/mocks/permissions.mock'
import type { PermissionsResponse, UserProfile } from '../types/permission.types'

/**
 * Seam for the future Laravel endpoint:
 *   GET /api/me/permissions
 *   { "permissions": ["users.view", "..."] }
 *
 * Replace this function with an HTTP call. Do not change the Permission Service,
 * composable, directive, or route guard.
 *
 * `profile` exists only while the PoC simulates multiple users locally.
 */
export function fetchCurrentUserPermissions(profile: UserProfile): Promise<PermissionsResponse> {
  return fetchMockPermissions(profile)
}
