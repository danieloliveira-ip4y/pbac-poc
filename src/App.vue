<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppSidebar from '@/components/AppSidebar.vue'
import PermissionDebugger from '@/components/PermissionDebugger.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const showShell = computed(() => isAuthenticated.value && route.name !== 'login')
</script>

<template>
  <div v-if="showShell" class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <RouterView />
      <PermissionDebugger />
    </div>
  </div>
  <RouterView v-else />
</template>
