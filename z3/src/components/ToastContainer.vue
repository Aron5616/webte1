<script setup>
import { toasts, dismissToast } from '../stores/toastStore.js';

const icons = { success: '✓', error: '!', info: 'i' };

function runAction(t) {
  dismissToast(t.id);
  t.action.run();
}
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`" :role="t.type === 'error' ? 'alert' : 'status'">
        <span class="toast__icon" aria-hidden="true">{{ icons[t.type] }}</span>
        <span class="toast__msg">{{ t.message }}</span>
        <button v-if="t.action" type="button" class="toast__action" @click="runAction(t)">{{ t.action.label }}</button>
        <button type="button" class="toast__close" aria-label="Zavrieť správu" @click="dismissToast(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>
