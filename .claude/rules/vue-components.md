# Vue Components (app/)

## Conventions

- `<script setup>` with Composition API only — no Options API.
- `const` arrow functions, never `function` declarations.
- No code comments anywhere (templates, scripts, styles).
- Every component lives in a directory named exactly like the component, with a co-located spec: `app/src/components/RatioBar/RatioBar.vue` + `app/src/components/RatioBar/RatioBar.spec.js`. Never a bare SFC directly under `components/`. Nested helper components go into a `subcomponents/` folder inside the parent's directory, same dir+spec pattern.
- Components are auto-registered by unplugin-vue-components (deep directory scan — no manual component imports in templates).
- Composables live in `app/src/composables/` (`useXxx` naming) and are imported EXPLICITLY — never auto-imported (slopmap's own scanner maps imports; auto-imported composables would vanish from slopmap's map of itself).
- Pure logic goes to `app/src/lib/` as plain functions with explicit arguments — no Vue imports, no module state reads.

## SFC Block Order

Every `.vue` file uses exactly this block order — template first, script never at the top:

```vue
<template>...</template>

<script setup>
...
</script>

<style scoped>
...
</style>
```

- `<style scoped>` is omitted only when the component genuinely has no styles.
- No other block types (`<script>` non-setup, `<style>` unscoped) unless base.css concerns force it — they never should.

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

- TailwindCSS (v4, `@tailwindcss/vite`) is the styling layer. ALWAYS prioritize Tailwind utility classes in templates over plain CSS. A `<style scoped>` block is the fallback ONLY for what utilities cannot express (e.g. webkit scrollbar styling, complex selectors, canvas-coupled transforms) — and it should stay minimal.
- Design tokens (palette hexes, font stacks, layout sizes) live in the Tailwind `@theme` block in `app/src/styles/base.css` — never hardcode raw hexes in utility arbitrary values when a token exists.
- Global resets/`[hidden]`/scrollbars only in `app/src/styles/base.css`.
- Layout constants (rail/header/inspector sizes) come from CSS custom properties set by `App.vue` — never hardcode 60/64/452 in component styles.
- Every element with an author `display` value needs an explicit `[hidden] { display: none; }` companion rule.
