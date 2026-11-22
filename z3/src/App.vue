<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import UserLogin from './components/UserLogin.vue';
import CalendarView from './components/CalendarView.vue';
import TaskList from './components/TaskList.vue';
import AboutSection from './components/AboutSection.vue';
import TaskForm from './components/TaskForm.vue';
import TaskDetail from './components/TaskDetail.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import ToastContainer from './components/ToastContainer.vue';
import { state, setUser, loadTodos } from './stores/todoStore.js';
import { resetDemoData } from './composables/useTodoActions.js';
import { toast } from './stores/toastStore.js';

/* ---------- navigácia (hash: #calendar, #list, #about) ---------- */
const VIEWS = ['calendar', 'list', 'about'];
const viewFromHash = () => {
  const h = location.hash.replace('#', '');
  return VIEWS.includes(h) ? h : 'calendar';
};
const view = ref(viewFromHash());
const onHash = () => (view.value = viewFromHash());

function navigate(id) {
  if (location.hash !== `#${id}`) location.hash = id;
  view.value = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- dialógy ---------- */
const form = ref(null); // { mode, todo?, preset? }
const detailId = ref(null);

const openCreate = (preset = null) => (form.value = { mode: 'create', preset });
const openEdit = (todo) => {
  detailId.value = null;
  form.value = { mode: 'edit', todo };
};
const openDetail = (todo) => (detailId.value = todo.id);

/* ---------- používateľ a načítanie dát ---------- */
async function load() {
  try {
    await loadTodos();
  } catch (err) {
    toast.error(err.message);
  }
}

function login(name) {
  setUser(name);
  load();
}

function logout() {
  form.value = null;
  detailId.value = null;
  setUser('');
}

onMounted(() => {
  window.addEventListener('hashchange', onHash);
  if (state.user) load();
});
onBeforeUnmount(() => window.removeEventListener('hashchange', onHash));
</script>

<template>
  <div class="app">
    <UserLogin v-if="!state.user" @submit="login" />
    <template v-else>
      <AppHeader :view="view" @navigate="navigate" @new-task="openCreate()" @reset="resetDemoData" @logout="logout" />

      <main class="main container">
        <KeepAlive>
          <CalendarView v-if="view === 'calendar'" @open="openDetail" @create="openCreate" />
          <TaskList v-else-if="view === 'list'" @open="openDetail" @edit="openEdit" @new-task="openCreate()" />
          <AboutSection v-else />
        </KeepAlive>
      </main>

      <AppFooter @navigate="navigate" />

      <TaskForm
        v-if="form"
        :key="form.mode + (form.todo?.id ?? '')"
        :mode="form.mode"
        :todo="form.todo"
        :preset="form.preset"
        @close="form = null"
      />
      <TaskDetail v-if="detailId !== null" :todo-id="detailId" @close="detailId = null" @edit="openEdit" />
    </template>

    <ConfirmDialog />
    <ToastContainer />
  </div>
</template>
