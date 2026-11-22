<script setup>
import { ref } from 'vue';
import { validateUserName } from '../utils/validation.js';

const props = defineProps({ initial: { type: String, default: '' } });
const emit = defineEmits(['submit']);

const name = ref(props.initial);
const error = ref(null);

function submit() {
  error.value = validateUserName(name.value);
  if (!error.value) emit('submit', name.value.trim());
}
</script>

<template>
  <section class="login">
    <div class="login__card card">
      <img src="../assets/logo.svg" alt="" class="login__logo" width="56" height="56" />
      <h1 class="login__title">Môj TODO List</h1>
      <p class="login__lead">Spravujte svoje úlohy v zozname aj v kalendári. Úlohy sa ukladajú na server pod vaším identifikátorom.</p>
      <form novalidate @submit.prevent="submit">
        <div class="field" :class="{ 'field--error': error }">
          <label for="user-name" class="field__label">Identifikátor študenta</label>
          <input
            id="user-name"
            v-model="name"
            class="input"
            type="text"
            autocomplete="username"
            placeholder="napr. xnovak"
            maxlength="64"
            autofocus
            :aria-invalid="!!error"
            aria-describedby="user-name-err"
          />
          <p v-if="error" id="user-name-err" class="field__error">{{ error }}</p>
          <p v-else class="field__hint">Pri prvom prihlásení server vytvorí váš zoznam s piatimi ukážkovými úlohami.</p>
        </div>
        <button type="submit" class="btn btn--primary btn--block">Pokračovať</button>
      </form>
    </div>
  </section>
</template>
