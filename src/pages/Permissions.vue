<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PermissionTree from '@/components/PermissionTree.vue'
import { mockDirectoryUsers, profileFromRole } from '@/mocks/user.mock'
import { fetchPermissionsTree } from '@/modules/permissions/api/permission.client'
import { saveAssignedPermissions } from '@/modules/permissions/services/permission-assignment.service'
import {
  collectAssigned,
  nodePermissionKey,
  toSavePayload,
  toggleNode,
} from '@/modules/permissions/services/permission-tree.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import type { PermissionNode } from '@/modules/permissions/types/permission.types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const users = mockDirectoryUsers

function initialUserId(): number {
  const queryId = Number(route.query.userId)
  if (users.some((user) => user.id === queryId)) {
    return queryId
  }
  return users[0]?.id ?? 1
}

const selectedUserId = ref(initialUserId())
const tree = ref<PermissionNode[]>([])
const expandedIds = ref<Set<number>>(new Set())
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const saveMessage = ref<string | null>(null)
const lastAction = ref<string | null>(null)

const selectedUser = computed(
  () => users.find((user) => user.id === selectedUserId.value) ?? users[0],
)

const assignedNodes = computed(() => collectAssigned(tree.value))
const savePayload = computed(() => toSavePayload(tree.value))
const isCurrentUser = computed(() => authStore.user?.id === selectedUserId.value)

function collectExpandableIds(nodes: PermissionNode[], acc: Set<number>): void {
  for (const node of nodes) {
    if (node.children.length > 0) {
      acc.add(node.id)
      collectExpandableIds(node.children, acc)
    }
  }
}

async function loadTree(userId: number): Promise<void> {
  const user = users.find((item) => item.id === userId)
  if (!user) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  saveMessage.value = null

  try {
    const nextTree = await fetchPermissionsTree(userId, profileFromRole(user.role))
    tree.value = nextTree
    const expanded = new Set<number>()
    collectExpandableIds(nextTree, expanded)
    expandedIds.value = expanded
  } catch (reason) {
    errorMessage.value = reason instanceof Error ? reason.message : 'Falha ao carregar a árvore'
  } finally {
    isLoading.value = false
  }
}

function handleToggle(node: PermissionNode): void {
  const marked = toggleNode(node)
  lastAction.value = `${node.description} ${marked ? 'marcada' : 'desmarcada'}`
  saveMessage.value = null
}

function handleToggleExpand(id: number): void {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

async function handleSave(): Promise<void> {
  isSaving.value = true
  errorMessage.value = null
  saveMessage.value = null

  try {
    await saveAssignedPermissions(selectedUserId.value, tree.value, router)
    saveMessage.value = isCurrentUser.value
      ? 'Permissões salvas. A sessão atual já está usando esta atribuição.'
      : `Permissões salvas para ${selectedUser.value?.name}. Elas valem no próximo login desse usuário.`
  } catch (reason) {
    errorMessage.value = reason instanceof Error ? reason.message : 'Falha ao salvar permissões'
  } finally {
    isSaving.value = false
  }
}

watch(
  selectedUserId,
  (userId) => {
    lastAction.value = null
    void loadTree(userId)
    if (String(route.query.userId) !== String(userId)) {
      void router.replace({ query: { userId: String(userId) } })
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="page permissions-page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Administração</p>
        <h1>Permissões</h1>
        <p class="muted">
          Quem tem <code>permissions.manage</code> atribui o catálogo ao usuário. Grupos não geram
          permissão; só folhas (e nós com <code>assigned</code>) entram no payload.
        </p>
      </div>
      <div class="page__actions">
        <label class="user-select">
          <span>Usuário</span>
          <select v-model.number="selectedUserId" :disabled="isLoading || isSaving">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} · {{ user.role }}
            </option>
          </select>
        </label>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="isLoading || isSaving"
          @click="handleSave"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar permissões' }}
        </button>
      </div>
    </header>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="saveMessage" class="success">{{ saveMessage }}</p>
    <p v-if="isLoading" class="muted">Carregando árvore de permissões...</p>

    <div v-else class="permissions-layout">
      <PermissionTree
        :nodes="tree"
        :expanded-ids="expandedIds"
        @toggle="handleToggle"
        @toggle-expand="handleToggleExpand"
      />

      <aside class="permissions-aside">
        <article class="hint-card">
          <h3>Id da permissão</h3>
          <p>
            Cada permissão gravável tem um <strong>id</strong> na tabela e uma
            <strong>chave</strong> no frontend (<code>pix.approve</code>,
            <code>users.view</code>). Grupo sem <code>assigned</code> não é linha gravável.
          </p>
        </article>

        <article v-if="lastAction" class="action-card">
          <h3>Última ação</h3>
          <p>{{ lastAction }}</p>
        </article>

        <article class="save-card">
          <header>
            <h3>O que seria salvo</h3>
            <span class="pill pill--ok">{{ assignedNodes.length }}</span>
          </header>
          <p v-if="assignedNodes.length === 0" class="muted">Nenhuma permissão marcada.</p>
          <ul v-else class="save-list">
            <li v-for="node in assignedNodes" :key="node.id">
              <code>{{ node.id }}</code>
              <span>{{ node.description }}</span>
              <small>{{ nodePermissionKey(node) }}</small>
            </li>
          </ul>
          <pre class="save-json">{{ JSON.stringify(savePayload, null, 2) }}</pre>
        </article>
      </aside>
    </div>
  </section>
</template>
