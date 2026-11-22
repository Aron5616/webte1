<script setup>
import BaseModal from './BaseModal.vue';
import { confirmState, closeConfirm } from '../composables/useConfirm.js';
</script>

<template>
  <BaseModal v-if="confirmState.open" :title="confirmState.title" size="sm" @close="closeConfirm(false)">
    <p class="confirm__message">{{ confirmState.message }}</p>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="closeConfirm(false)">Zrušiť</button>
      <button
        type="button"
        class="btn"
        :class="confirmState.danger ? 'btn--danger' : 'btn--primary'"
        autofocus
        @click="closeConfirm(true)"
      >
        {{ confirmState.confirmText }}
      </button>
    </template>
  </BaseModal>
</template>
