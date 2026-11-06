import {
  fetchUserPermissionTree,
  persistUserPermissionTree,
  profileUserId,
} from '@/mocks/permission-tree.mock'
import { collectAssignedKeys } from '../services/permission-tree.service'
import type {
  PermissionNode,
  PermissionsResponse,
  UserProfile,
} from '../types/permission.types'

/**
 * Seam for the future Laravel endpoints:
 *   GET /api/me/permissions
 *   GET /api/users/:id/permissions
 *   PUT /api/users/:id/permissions
 *
 * Replace these functions with HTTP calls. Do not change the Permission Service,
 * hook, directive, or route guard.
 */
export async function fetchCurrentUserPermissions(
  profile: UserProfile,
): Promise<PermissionsResponse> {
  const userId = profileUserId(profile)
  const tree = await fetchUserPermissionTree(userId, profile)
  return { permissions: collectAssignedKeys(tree) }
}

export function fetchPermissionsTree(
  userId: number,
  profile: UserProfile,
): Promise<PermissionNode[]> {
  return fetchUserPermissionTree(userId, profile)
}

export function saveUserPermissions(
  userId: number,
  tree: PermissionNode[],
): Promise<PermissionsResponse> {
  return persistUserPermissionTree(userId, tree)
}
