<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppSidebar from '@/components/AppSidebar.vue'
import PermissionDebugger from '@/components/PermissionDebugger.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const isNavOpen = ref(false)

const showShell = computed(() => isAuthenticated.value && route.name !== 'login')

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  'users-delete-example': 'Excluir usuários',
  reports: 'Relatórios',
  settings: 'Configurações',
  permissions: 'Permissões',
  forbidden: 'Acesso negado',
}

const pageTitle = computed(() => {
  const name = typeof route.name === 'string' ? route.name : ''
  return pageTitles[name] ?? 'Permission-Based Access Control'
})

function closeNav() {
  isNavOpen.value = false
}

function toggleNav() {
  isNavOpen.value = !isNavOpen.value
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeNav()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeNav()
  },
)

watch(showShell, (visible) => {
  if (!visible) {
    closeNav()
  }
})

watch(
  isNavOpen,
  (open) => {
    document.documentElement.classList.toggle('nav-locked', open)
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.documentElement.classList.remove('nav-locked')
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="showShell"
    class="app-shell"
    :class="{ 'app-shell--nav-open': isNavOpen }"
  >
    <div v-if="isNavOpen" class="app-nav-backdrop" @click="closeNav" />
    <AppSidebar @close="closeNav" />
    <div class="app-main">
      <header class="app-topbar">
        <button
          type="button"
          class="nav-toggle"
          :aria-expanded="isNavOpen"
          aria-controls="app-sidebar"
          :aria-label="isNavOpen ? 'Fechar menu' : 'Abrir menu'"
          @click="toggleNav"
        >
          <span class="nav-toggle__bar" />
          <span class="nav-toggle__bar" />
          <span class="nav-toggle__bar" />
        </button>
        <strong class="app-topbar__title">{{ pageTitle }}</strong>
      </header>
      <RouterView />
      <PermissionDebugger />
    </div>
  </div>
  <RouterView v-else />
</template>
