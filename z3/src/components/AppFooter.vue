<script setup>
const emit = defineEmits(['navigate']);
const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <p>© {{ year }} Môj TODO List · WEBTE1, Zadanie 3</p>
      <p class="footer__tech">
        Vytvorené pomocou
        <a href="https://vuejs.org" target="_blank" rel="noopener">Vue.js 3</a>,
        <a href="https://fullcalendar.io" target="_blank" rel="noopener">FullCalendar 6</a>,
        <a href="https://vitejs.dev" target="_blank" rel="noopener">Vite</a> a
        <a href="https://wt1zadanie.iolab.sk/docs" target="_blank" rel="noopener">REST API</a>
        · <a href="#about" @click.prevent="emit('navigate', 'about')">O projekte</a>
      </p>
    </div>
  </footer>
</template>
