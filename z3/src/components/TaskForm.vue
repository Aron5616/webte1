<script setup>
import { reactive, ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { validateTodoForm, TITLE_MAX, DESCRIPTION_MAX } from '../utils/validation.js';
import { toInputValue, fromInputValue, nextFullHour, addHours } from '../utils/date.js';
import { createTodo, updateTodo } from '../stores/todoStore.js';
import { toast } from '../stores/toastStore.js';

/**
 * Formulár na vytvorenie aj úpravu úlohy (dialógové okno).
 *  - mode="create": voliteľne `preset` { dateFrom, dateTo } z kalendára
 *  - mode="edit":   `todo` – formulár sa predvyplní aktuálnymi hodnotami
 */
const props = defineProps({
  mode: { type: String, default: 'create' },
  todo: { type: Object, default: null },
  preset: { type: Object, default: null },
});
const emit = defineEmits(['close']);

const isEdit = computed(() => props.mode === 'edit');

function initialValues() {
  if (isEdit.value && props.todo) {
    return {
      title: props.todo.title,
      description: props.todo.description ?? '',
      dateFrom: toInputValue(props.todo.dateFrom),
      dateTo: toInputValue(props.todo.dateTo),
      isFinished: props.todo.isFinished,
    };
  }
  const from = props.preset?.dateFrom ?? nextFullHour();
  const to = props.preset?.dateTo ?? addHours(from, 1);
  return { title: '', description: '', dateFrom: toInputValue(from), dateTo: toInputValue(to), isFinished: false };
}

const form = reactive(initialValues());
const touched = reactive({});
const submitted = ref(false);
const submitting = ref(false);
const serverError = ref(null);

const errors = computed(() => validateTodoForm(form));
const visibleError = (field) => (submitted.value || touched[field] ? errors.value[field] : null);

// Ak používateľ posunie začiatok za koniec, posunieme koniec (zachováme dĺžku 1 h)
watch(
  () => form.dateFrom,
  (val, old) => {
    const from = fromInputValue(val);
    const to = fromInputValue(form.dateTo);
    const oldFrom = fromInputValue(old);
    if (from && to && oldFrom && from > to) {
      form.dateTo = toInputValue(new Date(to.getTime() + (from - oldFrom)));
    }
  },
);

async function submit() {
  if (submitting.value) return; // ochrana proti dvojitému odoslaniu
  submitted.value = true;
  serverError.value = null;
  if (Object.keys(errors.value).length) return;

  const data = {
    title: form.title.trim(),
    description: form.description,
    dateFrom: fromInputValue(form.dateFrom),
    dateTo: fromInputValue(form.dateTo),
    isFinished: form.isFinished,
  };

  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateTodo(props.todo.id, data);
      toast.success(`Úloha „${data.title}“ bola uložená.`);
    } else {
      await createTodo(data);
      toast.success(`Úloha „${data.title}“ bola vytvorená.`);
    }
    emit('close');
  } catch (err) {
    // údaje vo formulári ostávajú – používateľ môže požiadavku zopakovať
    serverError.value = err.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <BaseModal :title="isEdit ? 'Upraviť úlohu' : 'Nová úloha'" :closable="!submitting" @close="emit('close')">
    <form id="task-form" novalidate @submit.prevent="submit">
      <div v-if="serverError" class="alert alert--error" role="alert">
        <strong>Uloženie sa nepodarilo.</strong> {{ serverError }}
        <span class="alert__hint">Vaše údaje ostali vo formulári – môžete to skúsiť znova.</span>
      </div>

      <fieldset :disabled="submitting" class="form-fields">
        <div class="field" :class="{ 'field--error': visibleError('title') }">
          <label for="f-title" class="field__label">Názov <span class="req" aria-hidden="true">*</span></label>
          <input
            id="f-title"
            v-model="form.title"
            class="input"
            type="text"
            required
            autofocus
            :aria-invalid="!!visibleError('title')"
            aria-describedby="f-title-msg"
            placeholder="Čo treba urobiť?"
            @blur="touched.title = true"
          />
          <div class="field__meta">
            <p id="f-title-msg" class="field__error">{{ visibleError('title') }}</p>
            <span class="counter" :class="{ 'counter--over': form.title.trim().length > TITLE_MAX }">
              {{ form.title.trim().length }}/{{ TITLE_MAX }}
            </span>
          </div>
        </div>

        <div class="field" :class="{ 'field--error': visibleError('description') }">
          <label for="f-desc" class="field__label">Popis <span class="optional">(nepovinné)</span></label>
          <textarea
            id="f-desc"
            v-model="form.description"
            class="input textarea"
            rows="4"
            :aria-invalid="!!visibleError('description')"
            aria-describedby="f-desc-msg"
            placeholder="Podrobnosti k úlohe…"
            @blur="touched.description = true"
          ></textarea>
          <div class="field__meta">
            <p id="f-desc-msg" class="field__error">{{ visibleError('description') }}</p>
            <span class="counter" :class="{ 'counter--over': form.description.length > DESCRIPTION_MAX }">
              {{ form.description.length }}/{{ DESCRIPTION_MAX }}
            </span>
          </div>
        </div>

        <div class="field-row">
          <div class="field" :class="{ 'field--error': visibleError('dateFrom') }">
            <label for="f-from" class="field__label">Začiatok <span class="req" aria-hidden="true">*</span></label>
            <input
              id="f-from"
              v-model="form.dateFrom"
              class="input"
              type="datetime-local"
              required
              :aria-invalid="!!visibleError('dateFrom')"
              aria-describedby="f-from-msg"
              @blur="touched.dateFrom = true"
            />
            <p id="f-from-msg" class="field__error">{{ visibleError('dateFrom') }}</p>
          </div>
          <div class="field" :class="{ 'field--error': visibleError('dateTo') }">
            <label for="f-to" class="field__label">Koniec <span class="req" aria-hidden="true">*</span></label>
            <input
              id="f-to"
              v-model="form.dateTo"
              class="input"
              type="datetime-local"
              required
              :min="form.dateFrom || undefined"
              :aria-invalid="!!visibleError('dateTo')"
              aria-describedby="f-to-msg"
              @blur="touched.dateTo = true"
            />
            <p id="f-to-msg" class="field__error">{{ visibleError('dateTo') }}</p>
          </div>
        </div>

        <label v-if="isEdit" class="checkbox">
          <input v-model="form.isFinished" type="checkbox" />
          <span>Úloha je dokončená</span>
        </label>
      </fieldset>
    </form>

    <template #footer>
      <button type="button" class="btn btn--ghost" :disabled="submitting" @click="emit('close')">Zrušiť</button>
      <button type="submit" form="task-form" class="btn btn--primary" :disabled="submitting">
        <span v-if="submitting" class="spinner spinner--sm" aria-hidden="true"></span>
        {{ submitting ? 'Ukladám…' : isEdit ? 'Uložiť zmeny' : 'Vytvoriť úlohu' }}
      </button>
    </template>
  </BaseModal>
</template>
