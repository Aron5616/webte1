/**
 * Spoločné akcie nad úlohou (zoznam, kalendár aj detail ich volajú rovnako):
 * potvrdenie, volanie store, spätná väzba cez toast a možnosť zopakovať pri chybe.
 */
import { deleteTodo, setFinished, resetTodos, findTodo } from '../stores/todoStore.js';
import { confirm } from './useConfirm.js';
import { toast } from '../stores/toastStore.js';

export async function toggleFinished(todo) {
  const target = !todo.isFinished;
  try {
    await setFinished(todo.id, target);
    toast.success(target ? `Úloha „${todo.title}“ je dokončená.` : `Úloha „${todo.title}“ je znovu otvorená.`);
    return true;
  } catch (err) {
    toast.error(err.message, { action: { label: 'Skúsiť znova', run: () => toggleFinished(todo) } });
    return false;
  }
}

export async function removeTodo(todo) {
  const ok = await confirm({
    title: 'Odstrániť úlohu?',
    message: `Naozaj chcete odstrániť úlohu „${todo.title}“? Túto akciu nie je možné vrátiť.`,
    confirmText: 'Odstrániť',
    danger: true,
  });
  if (!ok) return false;
  return doRemove(todo);
}

async function doRemove(todo) {
  try {
    await deleteTodo(todo.id);
    toast.success(`Úloha „${todo.title}“ bola odstránená.`);
    return true;
  } catch (err) {
    toast.error(err.message, {
      action: { label: 'Skúsiť znova', run: () => (findTodo(todo.id) ? doRemove(todo) : null) },
    });
    return false;
  }
}

export async function resetDemoData() {
  const ok = await confirm({
    title: 'Obnoviť ukážkové úlohy?',
    message:
      'Všetky vaše aktuálne úlohy budú zo servera odstránené a nahradené piatimi ukážkovými úlohami. Túto akciu nie je možné vrátiť.',
    confirmText: 'Obnoviť dáta',
    danger: true,
  });
  if (!ok) return false;
  return doReset();
}

async function doReset() {
  try {
    await resetTodos();
    toast.success('Ukážkové úlohy boli obnovené.');
    return true;
  } catch (err) {
    toast.error(err.message, { action: { label: 'Skúsiť znova', run: doReset } });
    return false;
  }
}
