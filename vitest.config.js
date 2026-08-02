import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'cli',
          environment: 'node',
          include: ['src/**/*.spec.js'],
        },
      },
      {
        plugins: [vue()],
        test: {
          name: 'viewer',
          environment: 'jsdom',
          include: ['app/src/**/*.spec.js'],
        },
      },
    ],
  },
});
