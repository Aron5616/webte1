<script setup>
import { computed, ref, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import StatusBadge from './StatusBadge.vue';
import { findTodo, isBusy, fetchTodo } from '../stores/todoStore.js';
import { toggleFinished, removeTodo } from '../composables/useTodoActions.js';
import { formatDateTime } from '../utils/date.js';

const props = defineProps({ todoId: { type: [String, Number], required: true } });
const emit = defineEmits(['close', 'edit']);

// Úlohu berieme vždy zo store => detail ukazuje aktuálne dáta zo servera
const todo = computed(() => findTodo(props.todoId));
const busy = computed(() => isBusy(todo.value?.id));

// Pri otvorení detailu načítame aktuálnu verziu úlohy zo servera (GET /api/{name}/{todo_id})
const loading = ref(true);
const loadError = ref(null);
async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    await fetchTodo(props.todoId);
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function onDelete() {
  if (await removeTodo(todo.value)) emit('close');
}
</script>

<template>
  <BaseModal title="Detail úlohy" @close="emit('close')">
    <p v-if="loading" class="muted detail__loading" role="status">
      <span class="spinner spinner--sm" aria-hidden="true"></span> Načítavam aktuálne údaje zo servera…
    </p>
    <div v-if="loadError" class="alert alert--error" role="alert">
      Detail sa nepodarilo načítať zo servera. {{ loadError }}
      <button type="button" class="btn btn--sm btn--ghost" @click="load">Skúsiť znova</button>
    </div>
    <div v-if="todo" class="detail" :class="{ 'detail--done': todo.isFinished }">
      <div class="detail__head">
        <h3 class="detail__title">{{ todo.title }}</h3>
        <StatusBadge :todo="todo" />
      </div>
      <dl class="detail__grid">
        <dt>Začiatok</dt>
        <dd>{{ formatDateTime(todo.dateFrom) }}</dd>
        <dt>Koniec</dt>
        <dd>{{ formatDateTime(todo.dateTo) }}</dd>
      </dl>
      <div class="detail__desc">
        <h4>Popis</h4>
        <p v-if="todo.description" class="pre">{{ todo.description }}</p>
        <p v-else class="muted">Bez popisu.</p>
      </div>
    </div>
    <p v-else class="muted">Úloha už neexistuje (mohla byť odstránená).</p>

    <template v-if="todo && !loading" #footer>
      <button type="button" class="btn btn--danger-ghost" :disabled="busy" @click="onDelete">🗑 Odstrániť</button>
      <span class="spacer"></span>
      <button type="button" class="btn btn--ghost" :disabled="busy" @click="toggleFinished(todo)">
        <span v-if="busy" class="spinner spinner--sm" aria-hidden="true"></span>
        {{ todo.isFinished ? '↺ Znovu otvoriť' : '✓ Dokončiť' }}
      </button>
      <button type="button" class="btn btn--primary" :disabled="busy" @click="emit('edit', todo)">✎ Upraviť</button>
    </template>
  </BaseModal>
</template>
