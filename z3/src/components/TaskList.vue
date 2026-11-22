<script setup>
import { ref, computed } from 'vue';
import TaskItem from './TaskItem.vue';
import LoadState from './LoadState.vue';
import { state, stats } from '../stores/todoStore.js';

const emit = defineEmits(['edit', 'open', 'new-task']);

const search = ref('');
const filter = ref('all'); // all | open | done
const sort = ref('dateFrom-asc');

const filters = computed(() => [
  { id: 'all', label: 'Všetky', count: stats.value.total },
  { id: 'open', label: 'Nedokončené', count: stats.value.open },
  { id: 'done', label: 'Dokončené', count: stats.value.done },
]);

const visible = computed(() => {
  const q = search.value.trim().toLocaleLowerCase('sk');
  const [field, dir] = sort.value.split('-');
  const sign = dir === 'asc' ? 1 : -1;
  return state.todos
    .filter((t) => (filter.value === 'open' ? !t.isFinished : filter.value === 'done' ? t.isFinished : true))
    .filter((t) => !q || t.title.toLocaleLowerCase('sk').includes(q))
    .slice()
    .sort((a, b) => sign * ((a[field]?.getTime() ?? 0) - (b[field]?.getTime() ?? 0)));
});

function clearFilters() {
  search.value = '';
  filter.value = 'all';
}
</script>

<template>
  <section class="list-view">
    <div class="page-head">
      <div>
        <h1>Zoznam úloh</h1>
        <p class="muted">
          {{ stats.total }} úloh · {{ stats.open }} nedokončených · {{ stats.done }} dokončených
          <template v-if="stats.overdue"> · <span class="text-danger">{{ stats.overdue }} po termíne</span></template>
        </p>
      </div>
      <button type="button" class="btn btn--primary" @click="emit('new-task')">+ Nová úloha</button>
    </div>

    <div class="toolbar card">
      <div class="toolbar__search">
        <label for="search" class="sr-only">Hľadať podľa názvu</label>
        <input id="search" v-model="search" type="search" class="input" placeholder="🔍 Hľadať podľa názvu…" />
      </div>
      <div class="segmented" role="group" aria-label="Filter podľa stavu">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          class="segmented__btn"
          :class="{ 'segmented__btn--active': filter === f.id }"
          :aria-pressed="filter === f.id"
          @click="filter = f.id"
        >
          {{ f.label }} <span class="segmented__count">{{ f.count }}</span>
        </button>
      </div>
      <div class="toolbar__sort">
        <label for="sort" class="sr-only">Zoradenie</label>
        <select id="sort" v-model="sort" class="input">
          <option value="dateFrom-asc">Začiatok ↑ (najskôr)</option>
          <option value="dateFrom-desc">Začiatok ↓ (najneskôr)</option>
          <option value="dateTo-asc">Koniec ↑ (najskôr)</option>
          <option value="dateTo-desc">Koniec ↓ (najneskôr)</option>
        </select>
      </div>
    </div>

    <LoadState>
      <div v-if="!state.todos.length" class="empty card">
        <p class="empty__icon" aria-hidden="true">📝</p>
        <h2>Zatiaľ nemáte žiadne úlohy</h2>
        <p class="muted">Vytvorte prvú úlohu alebo obnovte ukážkové dáta.</p>
        <button type="button" class="btn btn--primary" @click="emit('new-task')">+ Nová úloha</button>
      </div>
      <div v-else-if="!visible.length" class="empty card">
        <p class="empty__icon" aria-hidden="true">🔍</p>
        <h2>Žiadna úloha nevyhovuje filtru</h2>
        <p class="muted">Skúste zmeniť hľadaný text alebo filter stavu.</p>
        <button type="button" class="btn btn--ghost" @click="clearFilters">Zrušiť filtre</button>
      </div>
      <TransitionGroup v-else tag="ul" name="list" class="tasks">
        <TaskItem v-for="t in visible" :key="t.id" :todo="t" @edit="emit('edit', $event)" @open="emit('open', $event)" />
      </TransitionGroup>
    </LoadState>
  </section>
</template>
