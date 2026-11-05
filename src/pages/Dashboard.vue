<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { usePermissionStore } from '@/modules/permissions/stores/permission.store'
import { profileLabels } from '@/mocks/user.mock'

const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { user, currentProfile } = storeToRefs(authStore)
const { permissions, permissionCount } = storeToRefs(permissionStore)

const profileLabel = computed(() =>
  currentProfile.value ? profileLabels[currentProfile.value] : '—',
)
</script>

<template>
  <section class="page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Início</p>
        <h1>Dashboard</h1>
      </div>
    </header>

    <div class="stat-grid">
      <article class="stat-card">
        <span>Usuário</span>
        <strong>{{ user?.name }}</strong>
        <p>{{ user?.email }}</p>
      </article>
      <article class="stat-card">
        <span>Perfil atual</span>
        <strong>{{ profileLabel }}</strong>
        <p>{{ currentProfile }}</p>
      </article>
      <article class="stat-card">
        <span>Permissões</span>
        <strong>{{ permissionCount }}</strong>
        <p>carregadas do mock</p>
      </article>
    </div>

    <article class="panel">
      <h2>Permissões disponíveis</h2>
      <ul class="chip-list">
        <li v-for="permission in permissions" :key="permission" class="chip">{{ permission }}</li>
      </ul>
    </article>
  </section>
</template>
