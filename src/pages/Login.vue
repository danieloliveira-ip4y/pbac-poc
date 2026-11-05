<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithProfile } from '@/modules/auth/services/auth.service'
import { profileLabels } from '@/mocks/user.mock'
import type { UserProfile } from '@/modules/permissions/types/permission.types'

const profiles: UserProfile[] = ['admin', 'operator', 'viewer']
const selectedProfile = ref<UserProfile>('admin')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const router = useRouter()
const route = useRoute()

function resolveRedirect(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/dashboard'
}

async function handleLogin(profile: UserProfile) {
  isSubmitting.value = true
  errorMessage.value = null
  selectedProfile.value = profile

  try {
    await loginWithProfile(profile)
    await router.replace(resolveRedirect())
  } catch (reason) {
    errorMessage.value = reason instanceof Error ? reason.message : 'Falha ao autenticar'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <p class="eyebrow">PBAC (Permission-Based Access Control)</p>
      <h1>Entrar</h1>
      <p class="muted">
        Autenticação e permissões são mockadas. Escolha um perfil para simular a resposta do Laravel.
      </p>

      <div class="profile-grid">
        <button
          v-for="profile in profiles"
          :key="profile"
          type="button"
          class="profile-card"
          :class="{ 'is-selected': selectedProfile === profile }"
          :disabled="isSubmitting"
          @click="handleLogin(profile)"
        >
          <strong>{{ profileLabels[profile] }}</strong>
          <span>{{ profile }}</span>
        </button>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="isSubmitting" class="muted">Carregando permissões...</p>
    </section>
  </main>
</template>
