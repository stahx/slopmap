import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
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

const outputLines = (output) => output.split('\n').filter(Boolean);

const resolvedRenamePath = (filePath) => {
  const bracedRename = filePath.match(/^(.*?)\{.*? => (.*?)\}(.*)$/);
  if (bracedRename !== null) return `${bracedRename[1]}${bracedRename[2]}${bracedRename[3]}`;
  const renameSeparator = filePath.indexOf(' => ');
  return renameSeparator === -1 ? filePath : filePath.slice(renameSeparator + 4);
};

const numericStat = (value) => value === '-' ? 0 : Number(value) || 0;

const lineCount = (content) => {
  if (content.length === 0) return 0;
  return content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
};

const detectBranch = (repoRoot) => {
  try {
    const branch = git(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
    return branch === 'HEAD' ? null : branch;
  } catch {
    return null;
  }
};

const detectPullRequest = (repoRoot, prNumber) => {
  try {
    const prArguments = ['pr', 'view'];
    if (prNumber !== null && prNumber !== undefined) prArguments.push(String(prNumber));
    prArguments.push('--json', 'number,title,url,state');
    const output = execFileSync('gh', prArguments, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    });
    const pullRequest = JSON.parse(output);
    return {
      number: pullRequest.number,
      title: pullRequest.title,
      url: pullRequest.url,
      state: pullRequest.state,
    };
  } catch {
    return null;
  }
};

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

const collectChanges = (repoRoot, options, changedFiles) => {
  if (options.pr) {
    const pullRequest = options.pullRequestData;
    return {
      files: pullRequest.files.map((file) => ({
        path: file.path,
        status: 'M',
        additions: file.additions,
        deletions: file.deletions,
      })),
      totals: {
        additions: pullRequest.additions,
        deletions: pullRequest.deletions,
      },
    };
  }
  if (!options.base) return { files: [], totals: null };

  const filesByPath = new Map();
  const ensureFile = (filePath) => {
    if (!filesByPath.has(filePath)) {
      filesByPath.set(filePath, { path: filePath, status: 'M', additions: 0, deletions: 0 });
    }
    return filesByPath.get(filePath);
  };
  const addNumstat = (line) => {
    const [additionsValue, deletionsValue, ...pathParts] = line.split('\t');
    const filePath = resolvedRenamePath(pathParts.join('\t'));
    if (!filePath) return;
    const file = ensureFile(filePath);
    file.additions += numericStat(additionsValue);
    file.deletions += numericStat(deletionsValue);
  };

  for (const line of outputLines(git(repoRoot, ['diff', '--numstat', `${options.base}...HEAD`]))) {
    addNumstat(line);
  }
  for (const line of outputLines(git(repoRoot, ['diff', '--name-status', `${options.base}...HEAD`]))) {
    const [statusValue, firstPath, secondPath] = line.split('\t');
    const status = statusValue.startsWith('R') ? 'R' : statusValue[0];
    const filePath = status === 'R' ? secondPath : firstPath;
    if (!filePath) continue;
    ensureFile(filePath).status = ['M', 'A', 'D', 'R'].includes(status) ? status : 'M';
  }
  for (const line of outputLines(git(repoRoot, ['diff', '--numstat', 'HEAD']))) {
    addNumstat(line);
  }
  for (const filePath of outputLines(git(repoRoot, ['ls-files', '--others', '--exclude-standard']))) {
    let additions = 0;
    try {
      additions = lineCount(fs.readFileSync(path.join(repoRoot, filePath), 'utf8'));
    } catch {
      additions = 0;
    }
    filesByPath.set(filePath, { path: filePath, status: 'A', additions, deletions: 0 });
  }
  for (const filePath of changedFiles) ensureFile(filePath);

  const files = [...filesByPath.values()];
  const totals = files.reduce(
    (summary, file) => ({
      additions: summary.additions + file.additions,
      deletions: summary.deletions + file.deletions,
    }),
    { additions: 0, deletions: 0 }
  );
  return { files, totals };
};

const resolveChangedFiles = (repoRoot, options) => {
  if (options.pr) {
    const output = execFileSync(
      'gh',
      ['pr', 'view', String(options.pr), '--json', 'number,title,url,state,additions,deletions,files'],
      { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
    );
    const pullRequest = JSON.parse(output);
    return {
      modeLabel: `PR #${options.pr}`,
      files: new Set(pullRequest.files.map((file) => file.path)),
      pullRequest: {
        number: pullRequest.number,
        title: pullRequest.title,
        url: pullRequest.url,
        state: pullRequest.state,
      },
      pullRequestData: pullRequest,
    };
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
  const changes = collectChanges(
    repoRoot,
    { ...options, pullRequestData: changed.pullRequestData },
    changed.files
  );
  const branch = detectBranch(repoRoot);
  const pullRequest = options.pr
    ? changed.pullRequest
    : (options.base ? detectPullRequest(repoRoot) : null);
  const context = {
    branch,
    baseRef: options.base || null,
    pullRequest,
    generatedAt: new Date().toISOString(),
  };
  const repoFiles = collectRepoFiles(repoRoot);
  const sources = scanSources(repoRoot, repoFiles.sourceFiles);
  const resolver = createResolver(repoRoot, repoFiles);
  const graph = buildGraph({ sources, resolver, changedFiles: changed.files, changes });

  const html = renderHtml({ graph, repoName, modeLabel: changed.modeLabel, context });
  const outPath = options.out
    ? path.resolve(options.out)
    : path.join(os.tmpdir(), `slopmap-${repoName}-${Date.now()}.html`);
  writeOutput(outPath, html);

  const { stats } = graph;
  process.stdout.write(
    `slopmap: ${repoName} (${changed.modeLabel})\n` +
      `  files: ${stats.fileCount}   imports: ${stats.linkCount}   unresolved: ${stats.unresolvedCount}` +
      (changes.totals
        ? `   +${changes.totals.additions} −${changes.totals.deletions}\n`
        : '\n') +
      (stats.changedCount > 0
        ? `  changed: ${stats.changedCount}   blast radius: ${stats.dependentCount}   depends on: ${stats.dependencyCount}\n`
        : '') +
      (context.pullRequest
        ? `  PR #${context.pullRequest.number}: ${context.pullRequest.url}\n`
        : '') +
      `  -> ${outPath}\n`
  );

  if (options.open) {
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    execFileSync(openCommand, [outPath], { stdio: 'ignore' });
  }
};
