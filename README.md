# slopmap

slopmap turns any JavaScript or TypeScript repository into a 3D architecture map. Its default Compact view rolls files up into groups shown as planets, while diff views reveal a pull request's blast radius. A mission-control panel keeps branch, PR, change totals, distribution, compactness, and theme controls together without covering the map. The name is a joke, and unfortunately an accurate one.

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

When GitHub PR metadata is available, the context card shows its state and change totals. The section drawer also provides an `Open PR` action.

Every map has two views: Compact rolls files up with a compactness slider (`roots` → `groups` → `dirs`), and Advanced shows the full file graph. Import lines show how items at the active Compact level connect. Click a Compact ball to open the right drawer, where diff maps list file statuses, additions, deletions, and downstream sections. `Isolate blast` jumps to the matching filtered Advanced graph with impact-only enabled. Advanced also provides search highlighting and the impact-only and isolated-file toggles.

| Option | Description |
| --- | --- |
| `--base <ref>` | Git ref to diff against, such as `master` or `origin/main` |
| `--pr <number>` | GitHub PR number; uses `gh` to fetch changed files |
| `--out <file>` | Output HTML path; defaults to a temporary file |
| `--no-open` | Do not open the result in a browser |
| `--help` | Show command help |

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

## Roadmap

- `--ai` annotations through `claude -p`, including cluster labels and a PR impact summary.
- Polyglot regex packs for Python, Go, Ruby, and PHP.
- `tsconfig` `paths` aliases.
- A `--max-nodes` performance guard.
- GitHub CLI extension packaging.
