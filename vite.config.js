import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

import assertSingleFile from './app/plugins/assert-single-file.js';

const componentIdFor = (filePath, sourceCode, isProduction, getHash) => {
  const legacyFilePath = filePath.replace(/^(src\/components\/([^/]+))\/\2\.vue$/, '$1.vue');
  const legacySourceCode =
    legacyFilePath === filePath ? sourceCode : sourceCode.replaceAll("from '../../", "from '../");
  return getHash(legacyFilePath + (isProduction ? legacySourceCode : ''));
};

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [
    tailwindcss(),
    vue({
      features: {
        componentIdGenerator: componentIdFor,
      },
    }),
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
