<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

defineOptions({ name: 'PermissionTreeNode' })
import {
  countAssignable,
  countAssigned,
  nodeCheckState,
} from '@/modules/permissions/services/permission-tree.service'
import type { PermissionNode } from '@/modules/permissions/types/permission.types'

const props = defineProps<{
  node: PermissionNode
  expandedIds: Set<number>
}>()

const emit = defineEmits<{
  toggle: [node: PermissionNode]
  toggleExpand: [id: number]
}>()

const checkboxRef = ref<HTMLInputElement | null>(null)
const hasChildren = computed(() => props.node.children.length > 0)
const expanded = computed(() => props.expandedIds.has(props.node.id))
const checkState = computed(() => nodeCheckState(props.node))
const assignedCount = computed(() => countAssigned(props.node))
const totalCount = computed(() => countAssignable(props.node))

watch(
  checkState,
  async (state) => {
    await nextTick()
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = state === 'indeterminate'
    }
  },
  { immediate: true },
)

function handleToggle() {
  emit('toggle', props.node)
}

function handleExpand() {
  if (hasChildren.value) {
    emit('toggleExpand', props.node.id)
  }
}
</script>

<template>
  <li class="ptree-node">
    <div class="ptree-row">
      <button
        v-if="hasChildren"
        type="button"
        class="ptree-chevron"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'Recolher' : 'Expandir'"
        @click="handleExpand"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span v-else class="ptree-chevron ptree-chevron--spacer"></span>

      <label class="ptree-label">
        <input
          ref="checkboxRef"
          type="checkbox"
          :checked="checkState === 'checked'"
          @change="handleToggle"
        />
        <span>{{ node.description }}</span>
      </label>

      <span v-if="totalCount > 0" class="ptree-count">
        {{ assignedCount }} de {{ totalCount }}
      </span>
    </div>

    <ul v-if="hasChildren && expanded" class="ptree-children">
      <PermissionTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :expanded-ids="expandedIds"
        @toggle="emit('toggle', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
      />
    </ul>
  </li>
</template>
