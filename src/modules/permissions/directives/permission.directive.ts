import { watch, type Directive, type WatchStopHandle } from 'vue'
import { storeToRefs } from 'pinia'
import { createPermissionService } from '../services/permission.service'
import { usePermissionStore } from '../stores/permission.store'
import type {
  Permission,
  PermissionDirectiveValue,
  PermissionMode,
} from '../types/permission.types'

interface DirectiveState {
  stop: WatchStopHandle
  value: PermissionDirectiveValue
  originalDisplay: string
}

const stateByElement = new WeakMap<HTMLElement, DirectiveState>()

function normalizeBinding(value: PermissionDirectiveValue): {
  permissions: Permission[]
  mode: PermissionMode
} {
  if (typeof value === 'string') {
    return { permissions: [value], mode: 'all' }
  }

  if (Array.isArray(value)) {
    return { permissions: value, mode: 'all' }
  }

  return {
    permissions: value.permissions,
    mode: value.mode ?? 'all',
  }
}

function applyPermissionVisibility(el: HTMLElement, value: PermissionDirectiveValue): void {
  const permissionStore = usePermissionStore()
  const { permissions, mode } = normalizeBinding(value)
  const allowed = createPermissionService(permissionStore.permissions).check(permissions, mode)
  const originalDisplay = stateByElement.get(el)?.originalDisplay ?? ''

  el.style.display = allowed ? originalDisplay : 'none'
  el.setAttribute('aria-hidden', String(!allowed))
}

export const permissionDirective: Directive<HTMLElement, PermissionDirectiveValue> = {
  mounted(el, binding) {
    const permissionStore = usePermissionStore()
    const { permissions } = storeToRefs(permissionStore)

    const stop = watch(
      permissions,
      () => {
        const current = stateByElement.get(el)
        if (!current) {
          return
        }
        applyPermissionVisibility(el, current.value)
      },
      { deep: true },
    )

    stateByElement.set(el, {
      stop,
      value: binding.value,
      originalDisplay: el.style.display,
    })
    applyPermissionVisibility(el, binding.value)
  },

  updated(el, binding) {
    const current = stateByElement.get(el)
    if (current) {
      current.value = binding.value
    }
    applyPermissionVisibility(el, binding.value)
  },

  unmounted(el) {
    stateByElement.get(el)?.stop()
    stateByElement.delete(el)
  },
}
