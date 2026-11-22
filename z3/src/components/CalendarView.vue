  <script setup>
import { ref, computed, onMounted, onBeforeUnmount, onActivated, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import skLocale from '@fullcalendar/core/locales/sk';
import LoadState from './LoadState.vue';
import { state, stats, isOverdue, updateTodo } from '../stores/todoStore.js';
import { toast } from '../stores/toastStore.js';

const emit = defineEmits(['open', 'create']);

const isMobile = ref(window.innerWidth < 700);
const currentView = ref(isMobile.value ? 'timeGridDay' : 'dayGridMonth');
const onResize = () => (isMobile.value = window.innerWidth < 700);
onMounted(() => window.addEventListener('resize', onResize));
onBeforeUnmount(() => window.removeEventListener('resize', onResize));

function statusOf(todo) {
  if (todo.isFinished) return 'done';
  return isOverdue(todo) ? 'overdue' : 'open';
}

// Udalosti kalendára sa počítajú zo zdieľaného store => kalendár a zoznam majú vždy rovnaké dáta
const events = computed(() =>
  state.todos.map((t) => ({
    id: String(t.id),
    title: t.title,
    start: t.dateFrom,
    end: t.dateTo,
    allDay: false,
    classNames: [`ev--${statusOf(t)}`],
    extendedProps: { todo: t, status: statusOf(t) },
  })),
);

/** Výber dňa / časového úseku -> nová úloha s predvyplneným časom */
function onSelect(info) {
  info.view.calendar.unselect();
  let from = info.start;
  let to = info.end;
  if (info.allDay) {
    // mesačné zobrazenie: celé dni -> 9:00 prvého dňa až 10:00 (resp. 17:00 posledného dňa)
    const lastDay = new Date(info.end.getTime() - 86400000);
    from = new Date(info.start.getFullYear(), info.start.getMonth(), info.start.getDate(), 9, 0);
    const multiDay = lastDay.getTime() > info.start.getTime();
    to = multiDay
      ? new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 17, 0)
      : new Date(from.getTime() + 3600000);
  }
  emit('create', { dateFrom: from, dateTo: to });
}

function onEventClick(info) {
  info.jsEvent.preventDefault();
  emit('open', info.event.extendedProps.todo);
}

/** Presunutie / natiahnutie úlohy v kalendári -> PUT na server; pri chybe vrátime späť */
async function onEventChange(info) {
  const todo = info.event.extendedProps.todo;
  const duration = todo.dateTo - todo.dateFrom;
  const start = info.event.start;
  const end = info.event.end ?? new Date(start.getTime() + duration);
  try {
    await updateTodo(todo.id, { ...todo, dateFrom: start, dateTo: end });
    toast.success(`Termín úlohy „${todo.title}“ bol zmenený.`);
  } catch (err) {
    info.revert();
    toast.error(err.message);
  }
}

/*
 * App.vue drží kalendár v <KeepAlive>: pri prepnutí na zoznam ostane v pamäti, ale je skrytý.
 * Ak sa medzitým úlohy zmenia (napr. úprava v zozname), FullCalendar sa prekreslí so šírkou 0
 * a po návrate by bol zdeformovaný. Preto po každom návrate (onActivated) prepočítame jeho veľkosť.
 */
const calendarRef = ref(null);
onActivated(() =>
  nextTick(() => {
    const api = calendarRef.value?.getApi();
    if (!api) return;
    api.updateSize();
    if (api.view.type.startsWith('timeGrid')) api.scrollToTime('07:00');
  }),
);

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: skLocale,
  firstDay: 1,
  initialView: currentView.value,
  headerToolbar: isMobile.value
    ? { left: 'prev,next', center: 'title', right: 'today' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
  footerToolbar: isMobile.value ? { center: 'dayGridMonth,timeGridWeek,timeGridDay' } : false,
  buttonText: { today: 'Dnes', month: 'Mesiac', week: 'Týždeň', day: 'Deň' },
  height: currentView.value === 'dayGridMonth' ? 'auto' : isMobile.value ? 620 : 760,
  nowIndicator: true,
  allDaySlot: false,
  scrollTime: '07:00:00',
  slotLabelFormat: { hour: '2-digit', minute: '2-digit' },
  eventTimeFormat: { hour: '2-digit', minute: '2-digit' },
  dayMaxEvents: 3,
  eventDisplay: 'block',
  displayEventEnd: true,
  selectable: true,
  selectMirror: true,
  editable: true,
  eventDurationEditable: true,
  events: events.value,
  select: onSelect,
  eventClick: onEventClick,
  eventDrop: onEventChange,
  eventResize: onEventChange,
  datesSet: (arg) => {
    const changed = currentView.value !== arg.view.type;
    currentView.value = arg.view.type;
    // po prepnutí na týždeň/deň sa zmení výška => posunieme pohľad na ráno
    if (changed && arg.view.type.startsWith('timeGrid')) setTimeout(() => arg.view.calendar.scrollToTime('07:00'));
  },
}));
</script>

<template>
  <section class="calendar-view">
    <div class="page-head">
      <div>
        <h1>Kalendár úloh</h1>
        <p class="muted">Kliknite na deň alebo označte časový úsek pre novú úlohu. Úlohu môžete potiahnuť na iný termín.</p>
      </div>
      <button type="button" class="btn btn--primary" @click="emit('create', null)">+ Nová úloha</button>
    </div>

    <LoadState>
      <div class="card calendar-card">
        <FullCalendar ref="calendarRef" :options="calendarOptions">
          <template #eventContent="arg">
            <div class="ev" :title="`${arg.event.title} (${arg.timeText})`">
              <span class="ev__icon" aria-hidden="true">{{
                arg.event.extendedProps.status === 'done' ? '✓' : arg.event.extendedProps.status === 'overdue' ? '!' : '○'
              }}</span>
              <span class="ev__time">{{ arg.timeText }}</span>
              <span class="ev__title">{{ arg.event.title }}</span>
            </div>
          </template>
        </FullCalendar>
      </div>
      <ul class="legend" aria-label="Legenda">
        <li><span class="legend__dot legend__dot--open"></span> Nedokončená ({{ stats.open - stats.overdue }})</li>
        <li><span class="legend__dot legend__dot--overdue"></span> Po termíne ({{ stats.overdue }})</li>
        <li><span class="legend__dot legend__dot--done"></span> ✓ Dokončená ({{ stats.done }})</li>
      </ul>
    </LoadState>
  </section>
</template>
