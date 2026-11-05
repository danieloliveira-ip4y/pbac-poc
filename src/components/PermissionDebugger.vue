<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { switchProfile } from '@/modules/auth/services/auth.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { usePermission } from '@/modules/permissions/hooks/usePermission'
import { usePermissionStore } from '@/modules/permissions/stores/permission.store'
import { profileLabels } from '@/mocks/user.mock'
import type { UserProfile } from '@/modules/permissions/types/permission.types'

const profiles: UserProfile[] = ['admin', 'operator', 'viewer']

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { user, currentProfile } = storeToRefs(authStore)
const { permissions, isLoading, isLoaded, error } = storeToRefs(permissionStore)
const { can, canAny, canAll, check } = usePermission()

const checks = computed(() => [
  { label: "can('users.create')", result: can('users.create') },
  { label: "can('users.delete')", result: can('users.delete') },
  { label: "canAny(['users.create', 'users.delete'])", result: canAny(['users.create', 'users.delete']) },
  { label: "canAll(['users.view', 'users.create'])", result: canAll(['users.view', 'users.create']) },
  {
    label: "check(['settings.view', 'settings.update'], 'all')",
    result: check(['settings.view', 'settings.update'], 'all'),
  },
  {
    label: "check(['settings.view', 'settings.update'], 'any')",
    result: check(['settings.view', 'settings.update'], 'any'),
  },
])

async function handleSwitch(profile: UserProfile) {
  if (profile === currentProfile.value || isLoading.value) {
    return
  }

  await switchProfile(profile, router)
}
</script>

<template>
  <section class="debugger">
    <header class="debugger__header">
      <div>
        <h2>Permission Debugger</h2>
        <p>Troque o perfil para validar store, service, guard e UI em tempo real. O trace sai no console.</p>
      </div>
      <span class="pill" :class="isLoading ? 'pill--warn' : 'pill--ok'">
        {{ isLoading ? 'Carregando' : isLoaded ? 'Carregado' : 'Vazio' }}
      </span>
    </header>

    <div class="debugger__grid">
      <article>
        <h3>Sessão</h3>
        <p><strong>Usuário:</strong> {{ user?.name ?? '—' }}</p>
        <p><strong>E-mail:</strong> {{ user?.email ?? '—' }}</p>
        <p>
          <strong>Perfil:</strong>
          {{ currentProfile ? profileLabels[currentProfile] : '—' }}
        </p>
      </article>

      <article>
        <h3>Permissões ({{ permissions.length }})</h3>
        <ul v-if="permissions.length" class="chip-list">
          <li v-for="permission in permissions" :key="permission" class="chip">{{ permission }}</li>
        </ul>
        <p v-else>Nenhuma permissão carregada.</p>
        <p v-if="error" class="error">{{ error }}</p>
      </article>

      <article>
        <h3>Consultas</h3>
        <ul class="check-list">
          <li v-for="item in checks" :key="item.label">
            <code>{{ item.label }}</code>
            <span class="pill" :class="item.result ? 'pill--ok' : 'pill--danger'">
              {{ item.result ? 'true' : 'false' }}
            </span>
          </li>
        </ul>
      </article>
    </div>

    <div class="debugger__actions">
      <button
        v-for="profile in profiles"
        :key="profile"
        type="button"
        class="btn"
        :class="currentProfile === profile ? 'btn--primary' : 'btn--secondary'"
        :disabled="isLoading"
        @click="handleSwitch(profile)"
      >
        {{ profileLabels[profile] }}
      </button>
    </div>
  </section>
</template>
