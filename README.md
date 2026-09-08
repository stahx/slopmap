<p align="center">
  <img src="assets/icon.svg" width="128" height="128" alt="" />
</p>

# slopmap

**A 3D architecture map of any JavaScript or TypeScript repository — and of the blast radius of any change to it.**

Point it at a repository and every file becomes a node, every import an edge. Point it at a branch or a pull request and it colours what changed, what depends on the change, and what the change depends on, so the reach of a diff is visible before anyone reads it. The default Compact view rolls files up into groups shown as planets; the files view shows the whole graph.

The output is a single self-contained HTML file. The name is a joke, and unfortunately an accurate one.

## Requirements

- Node.js 18 or newer
- [pnpm](https://pnpm.io) for development; the published CLI runs on any package manager
- Git, since every map is built from `git ls-files` and `git diff`
- [GitHub CLI](https://cli.github.com) (`gh`), only for `--pr`

## Install

```sh
git clone https://github.com/stahx/slopmap.git
cd slopmap
pnpm install
pnpm link --global
```

Alternatively, install directly from a local checkout:

```sh
pnpm add -g /path/to/slopmap
```

## Usage

```sh
slopmap
slopmap --base master
slopmap --pr 123
```

- `slopmap` renders the full map of the repository in the current directory.
- `slopmap --base <ref>` renders changes against a Git ref and their blast radius.
- `slopmap --pr <number>` renders the files changed by a GitHub pull request and their blast radius.

| Option          | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `--base <ref>`  | Git ref to diff against, such as `master` or `origin/main` |
| `--pr <number>` | GitHub PR number; uses `gh` to fetch changed files         |
| `--out <file>`  | Output HTML path; defaults to a temporary file             |
| `--no-open`     | Do not open the result in a browser                        |
| `--help`        | Show command help                                          |

When GitHub PR metadata is available, the header shows the pull request's state and change totals, and the inspector offers a direct review action.

## Reading the map

The shell keeps view and dimension controls on a left icon rail, repository and pull-request context in the top header, map settings in a floating bottom pill, and details in a permanent tabbed inspector.

**Views.** The rail carries two. Compact rolls files up behind a compactness slider (`roots` → `groups` → `dirs`); the files view shows the full graph. Import lines show how items at the active Compact level connect.

**Inspector.** The overview shows the graph distribution and the changed sections. Selecting a Compact ball opens Files, Dependents, and Imports tabs carrying change ratios, importer counts, paths, and blast-radius details. Clicking a changed-file card opens its embedded unified diff.

**Actions.** `Copy paths` copies the selected section's paths. `Isolate blast` jumps to the matching filtered files graph with impact-only enabled.

**Controls.** Search, impact-only, isolated-file, theme, and compactness live in the bottom pill. The rail's dimension button switches between a 3D orbit and a flat 2D canvas, and the choice is remembered between visits. In 2D, a selected changed section also draws its blast-radius ring.

## How it works

- Runs `git ls-files` for tracked and untracked repository files.
- Extracts ESM, CommonJS, and dynamic imports with regular expressions.
- Resolves relative paths, `@/` to `src/`, `~/` to the package root, workspace package names, and extension or index candidates with heuristics.
- Walks both directions from changed files with breadth-first search to calculate the blast radius and dependencies.
- Writes one self-contained HTML file with 3d-force-graph inlined.

## Caveats

- `--pr` highlights file paths against the current checkout. Run `gh pr checkout N` first for an exact graph.
- Import extraction uses regular expressions, not an AST.
- Internal-looking specifiers that cannot be resolved are reported in the stats.

## Development

The command-line implementation lives in `src/`, while the Vue viewer lives in `app/`. The viewer build is committed at `dist/index.html` so the CLI can generate a fully self-contained map without a separate build step.

Run the viewer locally with:

```sh
pnpm dev
```

Open the development URL with `?fixture=diff` to load the diff fixture instead of the default full-repository fixture.

Build the committed viewer artifact with `pnpm build`. Run `pnpm check:dist` to rebuild it and verify that `dist/index.html` is already in sync with the viewer source.

Everyday commands:

```sh
pnpm test         # full suite, both projects
pnpm test:watch   # watch mode
pnpm lint         # eslint across the repo
pnpm format       # prettier check
```

Tests are split into two Vitest projects: `cli` covers `src/` in a Node environment, `viewer` covers `app/` in jsdom.

Two Git hooks guard the repository. The pre-commit hook runs lint-staged, which fixes ESLint issues, formats staged source files, and runs the specs related to them without rebuilding the viewer. The pre-push hook runs the full suite and then `pnpm check:dist`, so a stale `dist/index.html` blocks the push; note that `check:dist` rebuilds the artifact in your working tree as a side effect. Both are installed by `pnpm install` through the `prepare` script; run `pnpm exec husky` if `.husky/_` is ever missing, because a missing runtime directory makes Git skip the hooks silently. Pass `--no-verify` to bypass either one.

If a merge conflict affects `dist/index.html`, resolve it from source and regenerate the artifact:

```sh
pnpm build && git add dist
```

## License

MIT — see [LICENSE](LICENSE).
