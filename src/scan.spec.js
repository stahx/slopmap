import { describe, expect, test } from 'vitest';

import { extractSpecifiers } from './scan.js';

const SOURCE_FIXTURE = `
import {
  alpha,
  beta
} from './named.js';
import './setup.js';
export { gamma } from './gamma.js';
const requiredModule = require('./required.cjs');
const lazyModule = import('./lazy.js');
const duplicateModule = require('./required.cjs');
`;

const COMMENTED_FIXTURE = `
// import './dead-line.js';
/* import './dead-block.js'; */
const docsUrl = 'https://example.com/docs';
import './alive.js';
`;

const VUE_FIXTURE = `
<template><WidgetPanel /></template>
<script setup>
import WidgetPanel from './WidgetPanel.vue';
const widgetTools = require('./widget-tools.js');
</script>
`;

describe('src/scan', () => {
  test('extractSpecifiers', () => {
    expect(extractSpecifiers(SOURCE_FIXTURE)).toEqual([
      './named.js',
      './setup.js',
      './gamma.js',
      './required.cjs',
      './lazy.js',
    ]);
    expect(extractSpecifiers(COMMENTED_FIXTURE)).toEqual(['./alive.js']);
    expect(extractSpecifiers(VUE_FIXTURE)).toEqual(['./WidgetPanel.vue', './widget-tools.js']);
  });
});
