import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// base: './' => zostavená aplikácia (dist/) funguje aj v podpriečinku na školskom serveri
export default defineConfig({
  base: './',
  plugins: [vue()],
});
