import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { permissionDirective } from '../directives/permission.directive'
import { usePermissionStore } from '../stores/permission.store'

const Probe = defineComponent({
  template: `
    <div>
      <button class="create" v-permission="'users.create'">Criar</button>
      <button class="delete" v-permission="'users.delete'">Excluir</button>
      <button
        class="manage"
        v-permission="{ permissions: ['users.create', 'users.update'], mode: 'any' }"
      >
        Gerenciar
      </button>
    </div>
  `,
})

let wrapper: VueWrapper | null = null

function mountProbe() {
  const pinia = getActivePinia()
  if (!pinia) {
    throw new Error('Pinia is not active')
  }

  wrapper = mount(Probe, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
      directives: {
        permission: permissionDirective,
      },
    },
  })

  return wrapper
}

describe('v-permission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('shows an element when the user is authorized', async () => {
    const store = usePermissionStore()
    store.updatePermissions(['users.create'])

    const view = mountProbe()
    await nextTick()

    expect(view.get('.create').isVisible()).toBe(true)
    expect(view.get('.delete').isVisible()).toBe(false)
  })

  it('hides an element when the user is not authorized', async () => {
    const store = usePermissionStore()
    store.updatePermissions(['reports.view'])

    const view = mountProbe()
    await nextTick()

    expect(view.get('.create').isVisible()).toBe(false)
    expect(view.get('.delete').isVisible()).toBe(false)
    expect(view.get('.manage').isVisible()).toBe(false)
  })

  it('updates visibility after a profile-like permission change', async () => {
    const store = usePermissionStore()
    store.updatePermissions(['users.create', 'users.update'])

    const view = mountProbe()
    await nextTick()

    expect(view.get('.create').isVisible()).toBe(true)
    expect(view.get('.delete').isVisible()).toBe(false)
    expect(view.get('.manage').isVisible()).toBe(true)

    store.updatePermissions(['users.delete'])
    await nextTick()

    expect(view.get('.create').isVisible()).toBe(false)
    expect(view.get('.delete').isVisible()).toBe(true)
    expect(view.get('.manage').isVisible()).toBe(false)
  })
})
