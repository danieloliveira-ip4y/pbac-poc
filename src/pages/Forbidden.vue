<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="page">
    <p class="eyebrow">HTTP 403</p>
    <h1>Acesso negado</h1>
    <p class="muted">
      Você está autenticado, mas o perfil atual não possui as permissões exigidas por esta rota.
    </p>
    <div class="page__actions">
      <RouterLink class="btn btn--primary" to="/dashboard">Voltar ao dashboard</RouterLink>
    </div>
  </section>
</template>
