import { mount } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { usePermission } from '../composables/usePermission'
import { usePermissionStore } from '../stores/permission.store'

const Probe = defineComponent({
  setup() {
    const { can, canAny, canAll } = usePermission()
    return { can, canAny, canAll }
  },
  template: `
    <div>
      <span class="delete">{{ can('users.delete') ? 'allowed' : 'denied' }}</span>
      <span class="any">{{ canAny(['users.create', 'users.delete']) ? 'allowed' : 'denied' }}</span>
      <span class="all">{{ canAll(['users.view', 'users.create']) ? 'allowed' : 'denied' }}</span>
    </div>
  `,
})

describe('usePermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updates the UI after permissions change', async () => {
    const store = usePermissionStore()
    store.updatePermissions(['users.view', 'users.create'])

    const wrapper = mount(Probe, {
      global: {
        plugins: [getActivePinia()!],
      },
    })
    expect(wrapper.get('.delete').text()).toBe('denied')
    expect(wrapper.get('.any').text()).toBe('allowed')
    expect(wrapper.get('.all').text()).toBe('allowed')

    store.updatePermissions(['users.view', 'users.create', 'users.delete'])
    await nextTick()

    expect(wrapper.get('.delete').text()).toBe('allowed')
    expect(wrapper.get('.all').text()).toBe('allowed')
  })

  it('reflects a profile-like permission replacement immediately', async () => {
    const store = usePermissionStore()
    store.updatePermissions(['dashboard.view', 'users.view', 'users.create', 'users.delete'])

    const wrapper = mount(Probe, {
      global: {
        plugins: [getActivePinia()!],
      },
    })
    expect(wrapper.get('.delete').text()).toBe('allowed')

    store.updatePermissions(['dashboard.view', 'reports.view'])
    await nextTick()

    expect(wrapper.get('.delete').text()).toBe('denied')
    expect(wrapper.get('.any').text()).toBe('denied')
    expect(wrapper.get('.all').text()).toBe('denied')
  })
})
