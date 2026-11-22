import { reactive } from 'vue';

/**
 * Potvrdzovací dialóg vracajúci Promise<boolean>.
 * Použitie: if (await confirm({ title, message })) { ... }
 */
export const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: 'Potvrdiť',
  danger: false,
  resolve: null,
});

export function confirm({ title, message, confirmText = 'Potvrdiť', danger = false }) {
  return new Promise((resolve) => {
    Object.assign(confirmState, { open: true, title, message, confirmText, danger, resolve });
  });
}

export function closeConfirm(result) {
  const resolve = confirmState.resolve;
  confirmState.open = false;
  confirmState.resolve = null;
  resolve?.(result);
}
