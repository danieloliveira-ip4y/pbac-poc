import { mockUsersByProfile } from '@/mocks/user.mock'
import {
  applyGrantedKeys,
  cloneTree,
  collectAssignedKeys,
  setAssignedCascade,
} from '@/modules/permissions/services/permission-tree.service'
import type {
  PermissionNode,
  PermissionsResponse,
  UserProfile,
} from '@/modules/permissions/types/permission.types'
import { permissionsByProfile } from './permissions.mock'

export const pixPermissionTree: PermissionNode[] = [
  {
    id: 1,
    description: 'PIX',
    children: [
      {
        id: 2,
        description: 'Incluir',
        assigned: false,
        key: 'pix.create',
        children: [],
      },
      {
        id: 3,
        description: 'Aprovar',
        assigned: true,
        key: 'pix.approve',
        children: [],
      },
      {
        id: 4,
        description: 'Receber',
        children: [
          {
            id: 5,
            description: 'Incluir Cobrança Pix',
            assigned: true,
            key: 'pix.charge.create',
            children: [],
          },
          {
            id: 6,
            description: 'Cancelar Cobrança Pix',
            assigned: false,
            key: 'pix.charge.cancel',
            children: [],
          },
        ],
      },
      {
        id: 7,
        description: 'Comprovante',
        children: [
          {
            id: 8,
            description: 'Visualizar',
            assigned: false,
            key: 'pix.receipt.view',
            children: [],
          },
        ],
      },
      {
        id: 9,
        description: 'Ponto de Venda',
        children: [
          {
            id: 10,
            description: 'Visualizar',
            assigned: true,
            key: 'pix.pos.view',
            children: [
              {
                id: 11,
                description: 'Criar',
                assigned: false,
                key: 'pix.pos.create',
                children: [],
              },
              {
                id: 12,
                description: 'Excluir',
                assigned: false,
                key: 'pix.pos.delete',
                children: [],
              },
              {
                id: 13,
                description: 'Download QrCode',
                assigned: false,
                key: 'pix.pos.qrcode.download',
                children: [],
              },
              {
                id: 14,
                description: 'Visualizar Movimentação',
                assigned: false,
                key: 'pix.pos.movement.view',
                children: [],
              },
            ],
          },
          {
            id: 15,
            description: 'Comunicação',
            children: [
              {
                id: 16,
                description: 'Visualizar Whatsapp',
                assigned: false,
                key: 'pix.whatsapp.view',
                children: [
                  {
                    id: 17,
                    description: 'Cadastrar Whatsapp',
                    assigned: false,
                    key: 'pix.whatsapp.create',
                    children: [],
                  },
                  {
                    id: 18,
                    description: 'Excluir Whatsapp',
                    assigned: false,
                    key: 'pix.whatsapp.delete',
                    children: [],
                  },
                ],
              },
              {
                id: 19,
                description: 'Visualizar E-Mail',
                assigned: false,
                key: 'pix.email.view',
                children: [
                  {
                    id: 20,
                    description: 'Cadastrar E-Mail',
                    assigned: false,
                    key: 'pix.email.create',
                    children: [],
                  },
                  {
                    id: 21,
                    description: 'Excluir E-Mail',
                    assigned: false,
                    key: 'pix.email.delete',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

export const systemPermissionTree: PermissionNode[] = [
  {
    id: 100,
    description: 'Sistema',
    children: [
      {
        id: 101,
        description: 'Dashboard',
        assigned: false,
        key: 'dashboard.view',
        children: [],
      },
      {
        id: 102,
        description: 'Usuários',
        children: [
          { id: 103, description: 'Visualizar', assigned: false, key: 'users.view', children: [] },
          { id: 104, description: 'Criar', assigned: false, key: 'users.create', children: [] },
          { id: 105, description: 'Editar', assigned: false, key: 'users.update', children: [] },
          { id: 106, description: 'Excluir', assigned: false, key: 'users.delete', children: [] },
        ],
      },
      {
        id: 107,
        description: 'Relatórios',
        children: [
          { id: 108, description: 'Visualizar', assigned: false, key: 'reports.view', children: [] },
          { id: 109, description: 'Exportar', assigned: false, key: 'reports.export', children: [] },
        ],
      },
      {
        id: 110,
        description: 'Configurações',
        children: [
          { id: 111, description: 'Visualizar', assigned: false, key: 'settings.view', children: [] },
          { id: 112, description: 'Editar', assigned: false, key: 'settings.update', children: [] },
        ],
      },
      {
        id: 113,
        description: 'Permissões',
        children: [
          {
            id: 114,
            description: 'Gerenciar atribuições',
            assigned: false,
            key: 'permissions.manage',
            children: [],
          },
        ],
      },
    ],
  },
]

export const permissionCatalog: PermissionNode[] = [
  ...cloneTree(systemPermissionTree),
  ...cloneTree(pixPermissionTree),
]

const assignmentsByUserId = new Map<number, PermissionNode[]>()

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function mockLatency(): number {
  return import.meta.env.MODE === 'test' ? 0 : 160
}

export function buildDefaultPermissionTree(profile: UserProfile): PermissionNode[] {
  const tree = cloneTree(permissionCatalog)
  const granted = new Set(permissionsByProfile[profile] ?? [])
  applyGrantedKeys(tree, granted)

  if (profile !== 'admin') {
    const pixRoot = tree.find((node) => node.id === 1)
    if (pixRoot) {
      setAssignedCascade(pixRoot, false)
    }
  }

  return tree
}

export function getUserPermissionTree(userId: number, profile: UserProfile): PermissionNode[] {
  const stored = assignmentsByUserId.get(userId)
  if (stored) {
    return cloneTree(stored)
  }

  return buildDefaultPermissionTree(profile)
}

export async function fetchUserPermissionTree(
  userId: number,
  profile: UserProfile,
): Promise<PermissionNode[]> {
  await wait(mockLatency())
  return getUserPermissionTree(userId, profile)
}

export async function persistUserPermissionTree(
  userId: number,
  tree: PermissionNode[],
): Promise<PermissionsResponse> {
  await wait(mockLatency())
  const stored = cloneTree(tree)
  assignmentsByUserId.set(userId, stored)
  return { permissions: collectAssignedKeys(stored) }
}

export function resetPermissionAssignments(): void {
  assignmentsByUserId.clear()
}

export function profileUserId(profile: UserProfile): number {
  return mockUsersByProfile[profile]?.id ?? 0
}
