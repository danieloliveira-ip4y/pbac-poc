<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { mockDirectoryUsers } from '@/mocks/user.mock'
import { usePermission } from '@/modules/permissions/hooks/usePermission'

const { can } = usePermission()
const users = mockDirectoryUsers
</script>

<template>
  <section class="page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Cadastros</p>
        <h1>Usuários</h1>
      </div>
      <div class="page__actions">
        <button v-permission="'users.create'" type="button" class="btn btn--primary">
          Criar usuário
        </button>
        <RouterLink
          v-permission="'users.delete'"
          class="btn btn--danger"
          to="/users/delete-example"
        >
          Excluir usuários
        </RouterLink>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.role }}</td>
            <td>
              <div class="row-actions">
                <button v-permission="'users.update'" type="button" class="btn btn--secondary">
                  Editar
                </button>
                <RouterLink
                  v-permission="'permissions.manage'"
                  class="btn btn--secondary"
                  :to="{ name: 'permissions', query: { userId: String(item.id) } }"
                >
                  Permissões
                </RouterLink>
                <button v-permission="'users.delete'" type="button" class="btn btn--danger">
                  Excluir
                </button>
                <span
                  v-if="!can('users.update') && !can('users.delete') && !can('permissions.manage')"
                  class="muted"
                >
                  Somente leitura
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
