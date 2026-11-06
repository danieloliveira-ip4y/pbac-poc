<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { mockDirectoryUsers } from '@/mocks/user.mock'

const users = mockDirectoryUsers
</script>

<template>
  <section class="page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Ação protegida</p>
        <h1>Exclusão de usuários</h1>
      </div>
      <RouterLink class="btn btn--secondary" to="/users">Voltar</RouterLink>
    </header>

    <article class="panel panel--danger">
      <h2>Rota protegida por <code>users.delete</code></h2>
      <p>
        Esta página só é acessível quando o perfil autenticado possui a permissão
        <strong>users.delete</strong>. Perfis Operador e Visualizador devem ser redirecionados para
        <code>/403</code>.
      </p>
    </article>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>
              <button type="button" class="btn btn--danger">Confirmar exclusão</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
