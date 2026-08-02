import { createApp } from 'vue';

import App from './App.vue';
import { loadPayload } from './composables/usePayload.js';
import './styles/base.css';

await loadPayload();

createApp(App).mount('#app');
