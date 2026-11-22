import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';

const app = createApp(App);

// Posledná poistka – neošetrená chyba v komponente nezhodí celú aplikáciu
app.config.errorHandler = (err) => {
  console.error(err);
};

app.mount('#app');
