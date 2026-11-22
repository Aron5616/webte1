<script setup>
import { computed } from 'vue';
import { isOverdue } from '../stores/todoStore.js';

const props = defineProps({ todo: { type: Object, required: true } });

const status = computed(() => {
  if (props.todo.isFinished) return { cls: 'done', label: 'Dokončená', icon: '✓' };
  if (isOverdue(props.todo)) return { cls: 'overdue', label: 'Po termíne', icon: '!' };
  return { cls: 'open', label: 'Nedokončená', icon: '○' };
});
</script>

<template>
  <span class="badge" :class="`badge--${status.cls}`">
    <span aria-hidden="true">{{ status.icon }}</span> {{ status.label }}
  </span>
</template>
