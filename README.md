# slopmap

slopmap turns any JavaScript or TypeScript repository into a 3D architecture map. Its default Compact view rolls files up into groups shown as planets, while diff views reveal a pull request's blast radius. The flight-deck shell keeps view and dimension controls on a left icon rail, repository and pull-request context in the top header, map settings in a bottom controls pill, and details in a permanent tabbed inspector. The name is a joke, and unfortunately an accurate one.

## Requirements

- Node.js 18 or newer
- [pnpm](https://pnpm.io) for development; the published CLI runs on any package manager
- Git, since every map is built from `git ls-files` and `git diff`
- [GitHub CLI](https://cli.github.com) (`gh`), only for `--pr`

## Install

```sh
git clone <repository-url>
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

When GitHub PR metadata is available, the header shows its state and change totals. The inspector also provides a direct review action.

Every map has two views on the rail: Compact rolls files up with a compactness slider (`roots` → `groups` → `dirs`), and the files view shows the full graph. Import lines show how items at the active Compact level connect. The inspector overview shows the graph distribution and changed sections; selecting a Compact ball opens Files, Dependents, and Imports tabs with change ratios, importer counts, paths, and blast-radius details, and clicking a changed-file card opens its embedded unified diff. `Copy paths` copies the selected section's paths, while `Isolate blast` jumps to the matching filtered files graph with impact-only enabled. Search, impact-only, isolated-file, theme, and compactness controls live in the floating bottom pill.

Use the rail's dimension button for a 3D orbit or flat 2D canvas; the choice is remembered between visits. In 2D, a selected changed section also shows its blast-radius ring.

| Option          | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `--base <ref>`  | Git ref to diff against, such as `master` or `origin/main` |
| `--pr <number>` | GitHub PR number; uses `gh` to fetch changed files         |
| `--out <file>`  | Output HTML path; defaults to a temporary file             |
| `--no-open`     | Do not open the result in a browser                        |
| `--help`        | Show command help                                          |

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

## Roadmap

- `--ai` annotations through `claude -p`, including cluster labels and a PR impact summary.
- Polyglot regex packs for Python, Go, Ruby, and PHP.
- `tsconfig` `paths` aliases.
- A `--max-nodes` performance guard.
- GitHub CLI extension packaging.

## License

MIT — see [LICENSE](LICENSE).
