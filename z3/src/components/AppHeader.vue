<script setup>
import { ref } from 'vue';
import { state } from '../stores/todoStore.js';

defineProps({ view: { type: String, required: true } });
const emit = defineEmits(['navigate', 'new-task', 'reset', 'logout']);

const menuOpen = ref(false);
const links = [
  { id: 'calendar', label: 'Kalendár', icon: '📅' },
  { id: 'list', label: 'Zoznam úloh', icon: '☰' },
  { id: 'about', label: 'O projekte', icon: 'ℹ' },
];

function go(id) {
  menuOpen.value = false;
  emit('navigate', id);
}
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <a href="#calendar" class="brand" @click.prevent="go('calendar')">
        <img src="../assets/logo.svg" alt="" width="32" height="32" />
        <span>Môj TODO List</span>
      </a>

      <button
        type="button"
        class="icon-btn header__burger"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>

      <nav id="main-nav" class="nav" :class="{ 'nav--open': menuOpen }" aria-label="Hlavná navigácia">
        <a
          v-for="l in links"
          :key="l.id"
          :href="`#${l.id}`"
          class="nav__link"
          :class="{ 'nav__link--active': view === l.id }"
          :aria-current="view === l.id ? 'page' : undefined"
          @click.prevent="go(l.id)"
        >
          <span aria-hidden="true">{{ l.icon }}</span> {{ l.label }}
        </a>

        <div class="nav__actions">
          <button type="button" class="btn btn--primary btn--sm" @click="menuOpen = false; emit('new-task')">+ Nová úloha</button>
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            :disabled="state.resetting"
            title="Obnoviť päť ukážkových úloh"
            @click="menuOpen = false; emit('reset')"
          >
            <span v-if="state.resetting" class="spinner spinner--sm" aria-hidden="true"></span>
            {{ state.resetting ? 'Obnovujem…' : '↺ Ukážkové dáta' }}
          </button>
          <span class="user-chip" :title="`Prihlásený ako ${state.user}`">
            👤 {{ state.user }}
            <button type="button" class="user-chip__btn" @click="menuOpen = false; emit('logout')">Zmeniť</button>
          </span>
        </div>
      </nav>
    </div>
  </header>
</template>
