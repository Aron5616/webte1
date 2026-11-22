/**
 * Centrálny stav úloh – jediný zdroj pravdy pre zoznam aj kalendár.
 * Obe časti čítajú to isté pole `state.todos`, preto sú vždy synchronizované.
 * Stav meníme až po úspešnej odpovedi servera (a následne znovu načítame dáta).
 */
import { reactive, computed, ref } from 'vue';
import { todoApi } from '../services/todoApi.js';

const USER_KEY = 'mojTodoList.user'; // v localStorage je iba meno, úlohy sú vždy na serveri

function readStoredUser() {
  try {
    return localStorage.getItem(USER_KEY) || '';
  } catch {
    return '';
  }
}

export const state = reactive({
  user: readStoredUser(),
  todos: [],
  loading: false, // načítavanie zoznamu
  loaded: false,
  loadError: null,
  busy: new Set(), // id úloh, nad ktorými práve beží operácia
  resetting: false,
});

/** Aktuálny čas (každú minútu sa obnoví) – aby sa „po termíne“ prepočítalo samo */
export const now = ref(Date.now());
setInterval(() => (now.value = Date.now()), 60_000);

export const isOverdue = (todo) => !todo.isFinished && !!todo.dateTo && todo.dateTo.getTime() < now.value;

export const stats = computed(() => {
  const total = state.todos.length;
  const done = state.todos.filter((t) => t.isFinished).length;
  const overdue = state.todos.filter(isOverdue).length;
  return { total, done, open: total - done, overdue };
});

export function findTodo(id) {
  return state.todos.find((t) => String(t.id) === String(id)) ?? null;
}

export function setUser(name) {
  state.user = name;
  state.todos = [];
  state.loaded = false;
  state.loadError = null;
  try {
    if (name) localStorage.setItem(USER_KEY, name);
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* localStorage nemusí byť dostupný – nevadí */
  }
}

let loadSeq = 0;
export async function loadTodos() {
  if (!state.user) return;
  const seq = ++loadSeq;
  state.loading = true;
  state.loadError = null;
  try {
    const todos = await todoApi.list(state.user);
    if (seq !== loadSeq) return; // medzičasom prišla novšia požiadavka
    state.todos = todos;
    state.loaded = true;
  } catch (err) {
    if (seq === loadSeq) state.loadError = err.message;
    throw err;
  } finally {
    if (seq === loadSeq) state.loading = false;
  }
}

/** Po zmene na serveri načítame aktuálny stav; ak reload zlyhá, zmena sa aj tak podarila */
async function refreshAfterChange() {
  try {
    await loadTodos();
  } catch {
    /* chyba je zobrazená v state.loadError */
  }
}

async function withBusy(id, fn) {
  state.busy.add(id);
  try {
    return await fn();
  } finally {
    state.busy.delete(id);
  }
}

export const isBusy = (id) => state.busy.has(id);

/** Načíta jednu úlohu zo servera (GET /api/{name}/{todo_id}) a aktualizuje ju v zozname */
export async function fetchTodo(id) {
  const fresh = await todoApi.get(state.user, id);
  if (!fresh) return null;
  const i = state.todos.findIndex((t) => String(t.id) === String(id));
  if (i !== -1) state.todos[i] = fresh;
  else state.todos.push(fresh);
  return fresh;
}

export async function createTodo(data) {
  const created = await todoApi.create(state.user, data);
  await refreshAfterChange();
  return created;
}

export function updateTodo(id, data) {
  return withBusy(id, async () => {
    const updated = await todoApi.update(state.user, id, data);
    await refreshAfterChange();
    return updated;
  });
}

export function deleteTodo(id) {
  return withBusy(id, async () => {
    await todoApi.remove(state.user, id);
    state.todos = state.todos.filter((t) => String(t.id) !== String(id));
    await refreshAfterChange();
  });
}

export function setFinished(id, finished) {
  return withBusy(id, async () => {
    if (finished) await todoApi.markDone(state.user, id);
    else await todoApi.markUndone(state.user, id);
    await refreshAfterChange();
  });
}

export async function resetTodos() {
  state.resetting = true;
  try {
    await todoApi.reset(state.user);
    await loadTodos();
  } finally {
    state.resetting = false;
  }
}
