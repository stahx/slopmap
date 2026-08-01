# slopmap

slopmap turns any JavaScript or TypeScript repository into a 3D architecture map. Its default cosmic view rolls files up into sections shown as planets, while diff views reveal a pull request's blast radius. The name is a joke, and unfortunately an accurate one.

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

When GitHub PR metadata is available, the map panel links directly to the pull request.

Every map opens in the cosmic view, where planets represent repository sections and import lines show how those sections connect. Click a section to see its changed files, then choose `open in advanced` to inspect that section at file level. The advanced view contains the full file graph, search highlighting, and the impact-only and isolated-file toggles.

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
