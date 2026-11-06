import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { mockUsersByProfile, type AuthUser } from '@/mocks/user.mock'
import type { UserProfile } from '@/modules/permissions/types/permission.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const currentProfile = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => user.value?.authenticated === true)

  function login(profile: UserProfile): void {
    const nextUser = mockUsersByProfile[profile]

    if (!nextUser) {
      throw new Error(`Perfil de autenticação desconhecido: ${profile}`)
    }

    currentProfile.value = profile
    user.value = { ...nextUser }
  }

  function logout(): void {
    user.value = null
    currentProfile.value = null
  }

  return {
    user,
    currentProfile,
    isAuthenticated,
    login,
    logout,
  }
})
