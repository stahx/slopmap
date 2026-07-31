import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { collectRepoFiles, scanSources } from './scan.js';
import { createResolver } from './resolve.js';
import { buildGraph } from './graph.js';
import { renderHtml, writeOutput } from './render.js';

const HELP_TEXT = `slopmap — 3D architecture map of a repo or PR

Usage:
  slopmap                     full map of the repo in cwd
  slopmap --base <ref>        diff map: changes vs <ref> + blast radius
  slopmap --pr <number>       diff map for a GitHub PR (via gh CLI)

Options:
  --base <ref>       git ref to diff against (e.g. master, origin/main)
  --pr <number>      GitHub PR number; uses gh to fetch changed files
  --out <file>       output HTML path (default: temp file)
  --no-open          do not open the result in a browser
  --help             show this help
`;

const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

const parseArgs = (argv) => {
  const options = { base: null, pr: null, out: null, open: true, help: false };
  for (let argIndex = 0; argIndex < argv.length; argIndex += 1) {
    const arg = argv[argIndex];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--no-open') {
      options.open = false;
    } else if (arg === '--base') {
      argIndex += 1;
      options.base = argv[argIndex];
    } else if (arg === '--pr') {
      argIndex += 1;
      options.pr = argv[argIndex];
    } else if (arg === '--out') {
      argIndex += 1;
      options.out = argv[argIndex];
    } else {
      process.stderr.write(`slopmap: unknown option "${arg}"\n\n${HELP_TEXT}`);
      process.exit(1);
    }
  }
  const hasMissingValue = [options.base, options.pr, options.out].some(
    (value) => value === undefined || (value !== null && value.startsWith('--'))
  );
  if (hasMissingValue) {
    process.stderr.write(`slopmap: missing value for option\n\n${HELP_TEXT}`);
    process.exit(1);
  }
  return options;
};

const porcelainPath = (line) => {
  const entry = line.slice(3).trim();
  const renameSeparator = entry.indexOf(' -> ');
  return renameSeparator === -1 ? entry : entry.slice(renameSeparator + 4);
};

const resolveChangedFiles = (repoRoot, options) => {
  if (options.pr) {
    const output = execFileSync(
      'gh',
      ['pr', 'view', String(options.pr), '--json', 'files', '--jq', '.files[].path'],
      { cwd: repoRoot, encoding: 'utf8' }
    );
    return { modeLabel: `PR #${options.pr}`, files: new Set(output.split('\n').filter(Boolean)) };
  }
  if (options.base) {
    const committed = git(repoRoot, ['diff', '--name-only', `${options.base}...HEAD`])
      .split('\n')
      .filter(Boolean);
    const workingTree = git(repoRoot, ['status', '--porcelain'])
      .split('\n')
      .filter(Boolean)
      .map(porcelainPath);
    return { modeLabel: `vs ${options.base}`, files: new Set([...committed, ...workingTree]) };
  }
  return { modeLabel: 'full map', files: new Set() };
};

export const runCli = async (argv) => {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  const repoRoot = git(process.cwd(), ['rev-parse', '--show-toplevel']);
  const repoName = path.basename(repoRoot);

  const changed = resolveChangedFiles(repoRoot, options);
  const repoFiles = collectRepoFiles(repoRoot);
  const sources = scanSources(repoRoot, repoFiles.sourceFiles);
  const resolver = createResolver(repoRoot, repoFiles);
  const graph = buildGraph({ sources, resolver, changedFiles: changed.files });

  const html = renderHtml({ graph, repoName, modeLabel: changed.modeLabel });
  const outPath = options.out
    ? path.resolve(options.out)
    : path.join(os.tmpdir(), `slopmap-${repoName}-${Date.now()}.html`);
  writeOutput(outPath, html);

  const { stats } = graph;
  process.stdout.write(
    `slopmap: ${repoName} (${changed.modeLabel})\n` +
      `  files: ${stats.fileCount}   imports: ${stats.linkCount}   unresolved: ${stats.unresolvedCount}\n` +
      (stats.changedCount > 0
        ? `  changed: ${stats.changedCount}   blast radius: ${stats.dependentCount}   depends on: ${stats.dependencyCount}\n`
        : '') +
      `  -> ${outPath}\n`
  );

  if (options.open) {
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    execFileSync(openCommand, [outPath], { stdio: 'ignore' });
  }
};
