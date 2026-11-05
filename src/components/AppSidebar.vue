<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { logout } from '@/modules/auth/services/auth.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { usePermission } from '@/modules/permissions/composables/usePermission'
import { profileLabels } from '@/mocks/user.mock'
import type { Permission } from '@/modules/permissions/types/permission.types'

interface NavItem {
  to: string
  label: string
  permission: Permission
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', permission: 'dashboard.view' },
  { to: '/users', label: 'Usuários', permission: 'users.view' },
  { to: '/reports', label: 'Relatórios', permission: 'reports.view' },
  { to: '/settings', label: 'Configurações', permission: 'settings.view' },
]

const router = useRouter()
const authStore = useAuthStore()
const { user, currentProfile } = storeToRefs(authStore)
const { can } = usePermission()

const visibleItems = computed(() => navItems.filter((item) => can(item.permission)))
const profileLabel = computed(() =>
  currentProfile.value ? profileLabels[currentProfile.value] : '—',
)

async function handleLogout() {
  logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <span class="sidebar__badge">PBAC</span>
      <div>
        <strong>Permission PoC</strong>
        <p>Vue 3 · Pinia · Router</p>
      </div>
    </div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        exact-active-class="is-active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="sidebar__user">
      <p class="sidebar__user-name">{{ user?.name }}</p>
      <p class="sidebar__user-profile">{{ profileLabel }}</p>
      <button type="button" class="btn btn--ghost" @click="handleLogout">Sair</button>
    </div>
  </aside>
</template>
