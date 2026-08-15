import { defineConfig } from 'vite';

export default defineConfig({
  base: '/farmhand-cdpr/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
