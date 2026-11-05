<script setup lang="ts">
import PermissionTreeNode from '@/components/PermissionTreeNode.vue'
import {
  countAssignable,
  countAssigned,
} from '@/modules/permissions/services/permission-tree.service'
import type { PermissionNode } from '@/modules/permissions/types/permission.types'

defineProps<{
  nodes: PermissionNode[]
  expandedIds: Set<number>
}>()

const emit = defineEmits<{
  toggle: [node: PermissionNode]
  toggleExpand: [id: number]
}>()

function totals(nodes: PermissionNode[]) {
  return {
    assigned: nodes.reduce((sum, node) => sum + countAssigned(node), 0),
    total: nodes.reduce((sum, node) => sum + countAssignable(node), 0),
  }
}
</script>

<template>
  <div class="ptree">
    <header class="ptree-head">
      <strong>Catálogo</strong>
      <span class="ptree-count">
        {{ totals(nodes).assigned }} de {{ totals(nodes).total }} marcadas
      </span>
    </header>

    <ul class="ptree-root">
      <PermissionTreeNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :expanded-ids="expandedIds"
        @toggle="emit('toggle', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
      />
    </ul>
  </div>
</template>
