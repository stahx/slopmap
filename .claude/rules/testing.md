# Testing

## 1. One source file = one spec file, named after the source

`filterGraph.js` → `filterGraph.spec.js`, co-located with the source. Never a second spec carving out part of a module — extend the existing one.

## 2. Spec shape

```js
import { describe, expect, test } from 'vitest';

import { filterGraph } from './filterGraph.js';

const NODES_FIXTURE = [];

describe('app/src/lib/filterGraph', () => {
  test('filterGraph', () => {
    expect(filterGraph({ nodes: NODES_FIXTURE, links: [] })).toEqual({ nodes: [], links: [] });
  });
});
```

- Explicit named imports from `vitest` — never globals, never `import * as`.
- `test(...)`, never `it(...)`.
- `describe('<path>/<name>')` — module path without extension.
- Flat body — one `test()` per exported function/behavior. No nested describe unless the module genuinely has multiple units.
- Shared setup in `beforeEach`, fixtures in module-level consts.

## Projects

- `cli` project: `src/**/*.spec.js`, node environment.
- `viewer` project: `app/src/**/*.spec.js`, jsdom environment.

## Anti-patterns

- Tautologies: rebuilding the expected value from the same import proves nothing.
- Specs for plain data/config constants — cover behavior at the consuming layer.
- Snapshot tests of SFC markup — the regression signal is the artifact comparison, not DOM snapshots.
