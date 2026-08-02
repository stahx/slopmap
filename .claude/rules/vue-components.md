# Vue Components (app/)

## Conventions

- `<script setup>` with Composition API only — no Options API.
- `const` arrow functions, never `function` declarations.
- No code comments anywhere (templates, scripts, styles).
- Components live in `app/src/components/`, one SFC per file, auto-registered by unplugin-vue-components (no manual component imports in templates).
- Composables live in `app/src/composables/` (`useXxx` naming) and are imported EXPLICITLY — never auto-imported (slopmap's own scanner maps imports; auto-imported composables would vanish from slopmap's map of itself).
- Pure logic goes to `app/src/lib/` as plain functions with explicit arguments — no Vue imports, no module state reads.

## Script Setup Ordering

1. Imports
2. `defineProps` / `defineEmits`
3. Composables
4. `ref()` / `shallowRef()` state
5. `computed()`
6. Lifecycle hooks (`onMounted`, `onBeforeUnmount`, ...)
7. Functions (arrow consts)

`defineProps` / `defineEmits` come right after imports — never below composables or computed.

## Styling

- Scoped styles per SFC; global resets/`[hidden]`/scrollbars only in `app/src/styles/base.css`.
- Layout constants (rail/header/inspector sizes) come from CSS custom properties set by `App.vue` — never hardcode 60/64/452 in component styles.
- Every element with an author `display` value needs an explicit `[hidden] { display: none; }` companion rule.
