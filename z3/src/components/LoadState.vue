<script setup>
/** Spoločné zobrazenie stavu načítania / chyby pre zoznam aj kalendár */
import { state, loadTodos } from '../stores/todoStore.js';

function retry() {
  loadTodos().catch(() => {});
}
</script>

<template>
  <div v-if="state.loadError" class="alert alert--error load-error" role="alert">
    <div>
      <strong>Úlohy sa nepodarilo načítať.</strong>
      <span> {{ state.loadError }}</span>
    </div>
    <button type="button" class="btn btn--sm btn--ghost" :disabled="state.loading" @click="retry">
      <span v-if="state.loading" class="spinner spinner--sm" aria-hidden="true"></span>
      {{ state.loading ? 'Načítavam…' : 'Skúsiť znova' }}
    </button>
  </div>

  <div v-if="!state.loaded && state.loading" class="loading card" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <span>Načítavam úlohy zo servera…</span>
  </div>
  <div v-else-if="state.loaded" class="load-state__content" :class="{ 'is-refreshing': state.loading }">
    <slot />
  </div>
</template>
