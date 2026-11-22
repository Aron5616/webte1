<script setup>
import { API_BASE_URL } from '../services/todoApi.js';

const tech = [
  { name: 'Vue.js 3', url: 'https://vuejs.org', desc: 'JavaScriptový framework – komponenty, reaktívny stav (Composition API, <script setup>).' },
  { name: 'FullCalendar 6', url: 'https://fullcalendar.io', desc: 'Knižnica kalendára – mesačné, týždenné a denné zobrazenie, výber časového úseku, presúvanie úloh.' },
  { name: 'Fetch API', url: 'https://developer.mozilla.org/docs/Web/API/Fetch_API', desc: 'Asynchrónna komunikácia s REST API (GET, POST, PUT, PATCH, DELETE).' },
  { name: 'Vite', url: 'https://vitejs.dev', desc: 'Vývojový server a zostavenie (build) aplikácie.' },
  { name: 'Vlastné CSS', url: null, desc: 'Responzívny dizajn bez CSS frameworku – CSS premenné, Flexbox a Grid.' },
];
</script>

<template>
  <section class="about">
    <div class="card about__card">
      <h1>O projekte</h1>
      <p>
        <strong>Môj TODO List</strong> je webová aplikácia na správu osobných úloh. Úlohy je možné vytvárať, upravovať,
        označovať ako dokončené a odstraňovať – v klasickom zozname aj priamo v kalendári. Zoznam a kalendár pracujú nad
        rovnakými dátami, takže každá zmena sa okamžite prejaví v oboch častiach.
      </p>
      <p>
        Všetky údaje sa ukladajú na server cez REST API
        <a :href="`${API_BASE_URL}/docs`" target="_blank" rel="noopener">{{ API_BASE_URL }}</a>. Každý používateľ má
        vlastný zoznam úloh podľa svojho identifikátora.
      </p>

      <h2>Použité technológie</h2>
      <ul class="tech-list">
        <li v-for="t in tech" :key="t.name">
          <a v-if="t.url" :href="t.url" target="_blank" rel="noopener"><strong>{{ t.name }}</strong></a>
          <strong v-else>{{ t.name }}</strong>
          – {{ t.desc }}
        </li>
      </ul>

      <h2>Knižnica kalendára</h2>
      <p>
        Kalendár je realizovaný knižnicou <a href="https://fullcalendar.io" target="_blank" rel="noopener">FullCalendar</a>
        (balíky <code>@fullcalendar/vue3</code>, <code>daygrid</code>, <code>timegrid</code> a <code>interaction</code>)
        so slovenskou lokalizáciou. Výberom dňa alebo časového úseku vytvoríte novú úlohu, kliknutím na úlohu zobrazíte
        jej detail a potiahnutím ju presuniete na iný termín.
      </p>

      <h2>Autor</h2>
      <p><strong>Matej Petrovič</strong></p>
      <p>Zadanie č. 3 z predmetu WEBTE1, ZS 2026/2027.</p>
    </div>
  </section>
</template>
