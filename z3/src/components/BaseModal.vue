<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm | md
  closable: { type: Boolean, default: true },
});
const emit = defineEmits(['close']);
const dialog = ref(null);
let lastFocused = null;

function onKey(e) {
  if (e.key === 'Escape' && props.closable) emit('close');
}

onMounted(async () => {
  lastFocused = document.activeElement;
  document.addEventListener('keydown', onKey);
  document.body.classList.add('modal-open');
  await nextTick();
  (dialog.value?.querySelector('[autofocus], input, textarea, button.btn') ?? dialog.value)?.focus();
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey);
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="closable && emit('close')">
      <div ref="dialog" class="modal" :class="`modal--${size}`" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
        <header class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <button v-if="closable" type="button" class="icon-btn" aria-label="Zavrieť" @click="emit('close')">✕</button>
        </header>
        <div class="modal__body"><slot /></div>
        <footer v-if="$slots.footer" class="modal__footer"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>
