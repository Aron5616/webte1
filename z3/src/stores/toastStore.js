import { reactive } from 'vue';

/** Jednoduché notifikácie (toasty) zdieľané celou aplikáciou */
export const toasts = reactive([]);
let nextId = 1;

export function showToast(message, type = 'info', { action = null, timeout } = {}) {
  const id = nextId++;
  toasts.push({ id, message, type, action });
  const ms = timeout ?? (type === 'error' ? 8000 : 3500);
  if (ms > 0) setTimeout(() => dismissToast(id), ms);
  return id;
}

export function dismissToast(id) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i !== -1) toasts.splice(i, 1);
}

export const toast = {
  success: (msg, opts) => showToast(msg, 'success', opts),
  error: (msg, opts) => showToast(msg, 'error', opts),
  info: (msg, opts) => showToast(msg, 'info', opts),
};
