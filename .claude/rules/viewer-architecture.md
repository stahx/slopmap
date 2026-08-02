# Viewer architecture invariants

Break any of these and the product breaks in ways tests will not catch. Read before touching `app/`.

## Single-file contract

- The built viewer (`dist/index.html`) is ONE self-contained HTML file that must work from `file://` fully offline (the Google Fonts `<link>` is the only allowed external reference, with system-font fallbacks).
- `src/render.js` injects data by replacing `__SLOPMAP_DATA__` inside `<script id="slopmap-payload" type="application/json">` and `__SLOPMAP_TITLE__` in `<title>` — replacer-function form only (paths may contain `$&`), `<` escaped to `<`.
- No dynamic imports, no workers, no emitted assets — `app/plugins/assert-single-file.js` fails the build otherwise. Never weaken that plugin.

## Reactivity boundaries

- The payload is `shallowRef(markRaw(json))`. `levels.*.sections` and file nodes ARE the live d3-force simulation objects — mutated at 60fps (`x/y/z/vx/vy/vz/fx/fy/fz`). They must NEVER be wrapped in a deep proxy.
- Nodes/links fed to `graphData()` are the raw payload objects — identity must survive (`selectedNode === node` is how selection works). Never clone, never spread.
- Graph instances (ForceGraph3D / ForceGraph) live in plain module variables or `markRaw`.
- Never render `section.x/y/z` (simulation coordinates) in a Vue template — non-reactive by design.

## Locked layout

- `onEngineStop` pins `fx/fy/fz = x/y/z` on every node of the active dataset, on every stop.
- Section objects are REUSED across view/level switches — that reuse IS the layout memory. Cloning kills it silently.
- Click selection displaces neighbours by mutating pinned positions with originals remembered in a plain `Map`; deselect restores byte-exact. No `d3ReheatSimulation()` anywhere outside nothing — reheat after `graphData()` in the same tick crashed the render loop historically.
- Camera refit: `zoomToFit(600)` immediately on view swap AND `pendingFitAfterStop` consumed in the matching dimension's `onEngineStop`.

## Persistence

localStorage keys are frozen: `slopmap-theme`, `slopmap-compactness`, `slopmap-dimension`. All reads/writes in try/catch (file:// storage can be unavailable or flaky).
