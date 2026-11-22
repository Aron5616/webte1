<script setup>
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { isBusy, isOverdue } from '../stores/todoStore.js';
import { toggleFinished, removeTodo } from '../composables/useTodoActions.js';
import { formatRange } from '../utils/date.js';

const props = defineProps({ todo: { type: Object, required: true } });
const emit = defineEmits(['edit', 'open']);

const busy = computed(() => isBusy(props.todo.id));
const overdue = computed(() => isOverdue(props.todo));
</script>

<template>
  <li class="task" :class="{ 'task--done': todo.isFinished, 'task--overdue': overdue, 'task--busy': busy }">
    <button
      type="button"
      class="task__check"
      :class="{ 'task__check--on': todo.isFinished }"
      :disabled="busy"
      :aria-label="todo.isFinished ? `Znovu otvoriť úlohu ${todo.title}` : `Označiť úlohu ${todo.title} ako dokončenú`"
      :title="todo.isFinished ? 'Znovu otvoriť' : 'Označiť ako dokončenú'"
      @click="toggleFinished(todo)"
    >
      <span v-if="busy" class="spinner spinner--sm" aria-hidden="true"></span>
      <span v-else aria-hidden="true">{{ todo.isFinished ? '✓' : '' }}</span>
    </button>

    <div class="task__body" role="button" tabindex="0" @click="emit('open', todo)" @keydown.enter="emit('open', todo)">
      <div class="task__top">
        <h3 class="task__title">{{ todo.title }}</h3>
        <StatusBadge :todo="todo" />
      </div>
      <p class="task__date">🕑 {{ formatRange(todo.dateFrom, todo.dateTo) }}</p>
      <p v-if="todo.description" class="task__desc">{{ todo.description }}</p>
    </div>

    <div class="task__actions">
      <button type="button" class="icon-btn" :disabled="busy" title="Upraviť" :aria-label="`Upraviť úlohu ${todo.title}`" @click="emit('edit', todo)">✎</button>
      <button type="button" class="icon-btn icon-btn--danger" :disabled="busy" title="Odstrániť" :aria-label="`Odstrániť úlohu ${todo.title}`" @click="removeTodo(todo)">🗑</button>
    </div>
  </li>
</template>
