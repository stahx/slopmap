import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

import assertSingleFile from './app/plugins/assert-single-file.js';

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: 'app/src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: 'app/.eslintrc-auto-import.json',
      },
    }),
    Components({
      dirs: ['src/components'],
      dts: 'app/src/components.d.ts',
    }),
    viteSingleFile({ removeViteModuleLoader: true }),
    assertSingleFile(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 4000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
