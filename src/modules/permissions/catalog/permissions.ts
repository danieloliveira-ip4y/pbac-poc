/**
 * Canonical frontend permission keys (`resource.action`).
 * Route meta, v-permission, usePermission and the tree `key` field must use these literals.
 */
export const PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  'reports.view',
  'reports.export',
  'settings.view',
  'settings.update',
  'permissions.manage',
  'pix.create',
  'pix.approve',
  'pix.charge.create',
  'pix.charge.cancel',
  'pix.receipt.view',
  'pix.pos.view',
  'pix.pos.create',
  'pix.pos.delete',
  'pix.pos.qrcode.download',
  'pix.pos.movement.view',
  'pix.whatsapp.view',
  'pix.whatsapp.create',
  'pix.whatsapp.delete',
  'pix.email.view',
  'pix.email.create',
  'pix.email.delete',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const PERMISSION_SET: ReadonlySet<string> = new Set(PERMISSIONS)

export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value)
}

export function retainKnownPermissions(values: readonly string[]): Permission[] {
  return values.filter(isPermission)
}
