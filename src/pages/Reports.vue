<script setup lang="ts">
const reports = [
  {
    id: 'R-001',
    title: 'Acessos semanais',
    period: '27/10/2026 – 02/11/2026',
    status: 'Disponível',
  },
  {
    id: 'R-002',
    title: 'Permissões por perfil',
    period: 'Novembro/2026',
    status: 'Disponível',
  },
  {
    id: 'R-003',
    title: 'Tentativas de acesso negado',
    period: 'Últimos 30 dias',
    status: 'Processando',
  },
]
</script>

<template>
  <section class="page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Analytics</p>
        <h1>Relatórios</h1>
      </div>
      <button
        v-permission="'reports.export'"
        type="button"
        class="btn btn--primary"
      >
        Exportar
      </button>
    </header>

    <div class="card-grid">
      <article v-for="report in reports" :key="report.id" class="panel">
        <p class="eyebrow">{{ report.id }}</p>
        <h2>{{ report.title }}</h2>
        <p class="muted">{{ report.period }}</p>
        <p>{{ report.status }}</p>
      </article>
    </div>
  </section>
</template>
