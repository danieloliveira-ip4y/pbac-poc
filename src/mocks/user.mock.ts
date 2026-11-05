import type { UserProfile } from '@/modules/permissions/types/permission.types'

export interface AuthUser {
  id: number
  name: string
  email: string
  authenticated: boolean
}

export const mockUser: AuthUser = {
  id: 1,
  name: 'Administrador',
  email: 'admin@example.com',
  authenticated: true,
}

export const mockUsersByProfile: Record<UserProfile, AuthUser> = {
  admin: mockUser,
  operator: {
    id: 2,
    name: 'Operador',
    email: 'operator@example.com',
    authenticated: true,
  },
  viewer: {
    id: 3,
    name: 'Visualizador',
    email: 'viewer@example.com',
    authenticated: true,
  },
}

export const profileLabels: Record<UserProfile, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  viewer: 'Visualizador',
}

export interface DirectoryUser {
  id: number
  name: string
  email: string
  role: string
}

export const mockDirectoryUsers: DirectoryUser[] = [
  { id: 1, name: 'Ana Souza', email: 'ana@example.com', role: 'Operador' },
  { id: 2, name: 'Bruno Lima', email: 'bruno@example.com', role: 'Visualizador' },
  { id: 3, name: 'Carla Dias', email: 'carla@example.com', role: 'Administrador' },
  { id: 4, name: 'Diego Alves', email: 'diego@example.com', role: 'Operador' },
]
