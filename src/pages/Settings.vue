<script setup lang="ts">
const settings = [
  { key: 'sessionTimeout', label: 'Timeout de sessão', value: '30 minutos' },
  { key: 'auditLog', label: 'Log de auditoria', value: 'Habilitado' },
  { key: 'defaultProfile', label: 'Perfil padrão', value: 'Visualizador' },
]
</script>

<template>
  <section class="page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Administração</p>
        <h1>Configurações</h1>
      </div>
      <button v-permission="'settings.update'" type="button" class="btn btn--primary">
        Editar configurações
      </button>
    </header>

    <article class="panel">
      <h2>Parâmetros da aplicação</h2>
      <p class="muted">
        Conteúdo demonstrativo. O botão de edição só aparece com a permissão
        <code>settings.update</code>.
      </p>
      <dl class="settings-list">
        <template v-for="item in settings" :key="item.key">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </template>
      </dl>
    </article>
  </section>
</template>
