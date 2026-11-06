import type {
  Permission,
  PermissionCheckState,
  PermissionNode,
} from '../types/permission.types'

export function isAssignable(node: PermissionNode): boolean {
  return typeof node.assigned === 'boolean'
}

export function cloneTree(nodes: readonly PermissionNode[]): PermissionNode[] {
  return nodes.map((node) => ({
    ...node,
    children: cloneTree(node.children),
  }))
}

export function nodePermissionKey(node: PermissionNode): Permission {
  if (!node.key) {
    throw new Error(`Permissão "${node.description}" (id ${node.id}) não tem chave`)
  }

  return node.key
}

export function collectAssignable(nodes: readonly PermissionNode[]): PermissionNode[] {
  const result: PermissionNode[] = []

  function walk(node: PermissionNode): void {
    if (isAssignable(node)) {
      result.push(node)
    }
    node.children.forEach(walk)
  }

  nodes.forEach(walk)
  return result
}

export function collectAssigned(nodes: readonly PermissionNode[]): PermissionNode[] {
  return collectAssignable(nodes).filter((node) => node.assigned === true)
}

export function collectAssignedKeys(nodes: readonly PermissionNode[]): Permission[] {
  return collectAssigned(nodes).map(nodePermissionKey)
}

export function countAssignable(node: PermissionNode): number {
  const self = isAssignable(node) ? 1 : 0
  return self + node.children.reduce((total, child) => total + countAssignable(child), 0)
}

export function countAssigned(node: PermissionNode): number {
  const self = node.assigned === true ? 1 : 0
  return self + node.children.reduce((total, child) => total + countAssigned(child), 0)
}

export function nodeCheckState(node: PermissionNode): PermissionCheckState {
  const total = countAssignable(node)
  const marked = countAssigned(node)

  if (total === 0 || marked === 0) {
    return 'unchecked'
  }

  if (marked === total) {
    return 'checked'
  }

  return 'indeterminate'
}

export function setAssignedCascade(node: PermissionNode, assigned: boolean): void {
  if (isAssignable(node)) {
    node.assigned = assigned
  }

  for (const child of node.children) {
    setAssignedCascade(child, assigned)
  }
}

export function toggleNode(node: PermissionNode): boolean {
  const nextAssigned = nodeCheckState(node) !== 'checked'
  setAssignedCascade(node, nextAssigned)
  return nextAssigned
}

export function applyGrantedKeys(nodes: PermissionNode[], granted: ReadonlySet<Permission>): void {
  for (const node of nodes) {
    if (node.key) {
      node.assigned = granted.has(node.key)
    }
    applyGrantedKeys(node.children, granted)
  }
}

export function toSavePayload(nodes: readonly PermissionNode[]): PermissionNode[] {
  return nodes.map((node) => {
    const payload: PermissionNode = {
      id: node.id,
      description: node.description,
      children: toSavePayload(node.children),
    }

    if (isAssignable(node)) {
      payload.assigned = node.assigned === true
    }

    return payload
  })
}
