import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { collectRepoFiles, scanSources } from './scan.js';
import { createResolver } from './resolve.js';
import { buildGraph } from './graph.js';
import { renderHtml, writeOutput } from './render.js';

const PATCH_BUFFER_LIMIT = 64 * 1024 * 1024;
const PATCH_LINE_LIMIT = 500;
const PATCH_TOTAL_BYTE_LIMIT = 3 * 1024 * 1024;

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

const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trimEnd();

const outputLines = (output) => output.split('\n').filter(Boolean);

const resolvedRenamePath = (filePath) => {
  const bracedRename = filePath.match(/^(.*?)\{.*? => (.*?)\}(.*)$/);
  if (bracedRename !== null) return `${bracedRename[1]}${bracedRename[2]}${bracedRename[3]}`;
  const renameSeparator = filePath.indexOf(' => ');
  return renameSeparator === -1 ? filePath : filePath.slice(renameSeparator + 4);
};

const numericStat = (value) => (value === '-' ? 0 : Number(value) || 0);

const lineCount = (content) => {
  if (content.length === 0) return 0;
  return content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
};

const decodeGitPath = (gitPath) => {
  if (!gitPath.startsWith('"') || !gitPath.endsWith('"')) return gitPath;
  const pathBytes = [];
  const quotedPath = gitPath.slice(1, -1);
  const escapeCharacters = {
    a: '\x07',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    '"': '"',
    '\\': '\\',
  };
  for (let characterIndex = 0; characterIndex < quotedPath.length; characterIndex += 1) {
    const character = quotedPath[characterIndex];
    if (character !== '\\') {
      pathBytes.push(...Buffer.from(character, 'utf8'));
      continue;
    }
    const escapedValue = quotedPath[characterIndex + 1];
    if (escapedValue === undefined) {
      pathBytes.push(...Buffer.from('\\', 'utf8'));
      continue;
    }
    const octalMatch = quotedPath.slice(characterIndex + 1).match(/^[0-7]{1,3}/);
    if (octalMatch !== null) {
      pathBytes.push(Number.parseInt(octalMatch[0], 8));
      characterIndex += octalMatch[0].length;
      continue;
    }
    pathBytes.push(...Buffer.from(escapeCharacters[escapedValue] ?? escapedValue, 'utf8'));
    characterIndex += 1;
  }
  return Buffer.from(pathBytes).toString('utf8');
};

const patchPathFromHeader = (header) => {
  const headerPrefix = 'diff --git ';
  if (!header.startsWith(headerPrefix)) return null;
  const headerPaths = header.slice(headerPrefix.length);
  let targetPathValue = null;
  if (headerPaths.startsWith('"')) {
    const quotedHeaderMatch = headerPaths.match(
      /^"(?:\\.|[^"])*" (?<targetPath>"(?:\\.|[^"])*"|b\/.*)$/,
    );
    targetPathValue = quotedHeaderMatch?.groups?.targetPath ?? null;
  } else {
    const unquotedSeparatorIndex = headerPaths.indexOf(' b/');
    const quotedSeparatorIndex = headerPaths.indexOf(' "b/');
    const separatorIndexes = [unquotedSeparatorIndex, quotedSeparatorIndex].filter(
      (separatorIndex) => separatorIndex >= 0,
    );
    const separatorIndex = Math.min(...separatorIndexes);
    if (Number.isFinite(separatorIndex)) targetPathValue = headerPaths.slice(separatorIndex + 1);
  }
  if (targetPathValue === null) return null;
  const targetPath = decodeGitPath(targetPathValue);
  return targetPath.startsWith('b/') ? targetPath.slice(2) : targetPath;
};

const capPatchLines = (patchLines, lineLimit) => {
  if (patchLines.length <= lineLimit) return patchLines.join('\n');
  return [
    ...patchLines.slice(0, lineLimit),
    `@@ slopmap: diff truncated (${patchLines.length} lines) @@`,
  ].join('\n');
};

const parsePatches = (patchOutput, lineLimit) => {
  const patchesByPath = new Map();
  const patchChunks = patchOutput
    .split(/(?=^diff --git )/m)
    .filter((patchChunk) => patchChunk.startsWith('diff --git '));
  for (const patchChunk of patchChunks) {
    const normalizedChunk = patchChunk.endsWith('\n') ? patchChunk.slice(0, -1) : patchChunk;
    const patchLines = normalizedChunk.split('\n');
    const filePath = patchPathFromHeader(patchLines[0]);
    if (filePath === null) continue;
    const binaryLine = patchLines.find((patchLine) => /^Binary files .* differ$/.test(patchLine));
    patchesByPath.set(
      filePath,
      binaryLine === undefined ? capPatchLines(patchLines, lineLimit) : binaryLine,
    );
  }
  return patchesByPath;
};

const untrackedPatch = (filePath, content, lineLimit) => {
  const contentLines = content.length === 0 ? [] : content.split('\n');
  if (contentLines.at(-1) === '') contentLines.pop();
  return capPatchLines(
    [
      `diff --git a/${filePath} b/${filePath}`,
      'new file',
      ...contentLines.map((line) => `+${line}`),
    ],
    lineLimit,
  );
};

const enforceTotalPatchSize = (files) => {
  const patchFiles = files
    .filter((file) => typeof file.patch === 'string')
    .map((file) => ({ file, byteLength: Buffer.byteLength(file.patch, 'utf8') }))
    .sort(
      (firstFile, secondFile) =>
        secondFile.byteLength - firstFile.byteLength ||
        firstFile.file.path.localeCompare(secondFile.file.path),
    );
  let totalByteLength = patchFiles.reduce(
    (totalBytes, patchFile) => totalBytes + patchFile.byteLength,
    0,
  );
  for (const patchFile of patchFiles) {
    if (totalByteLength <= PATCH_TOTAL_BYTE_LIMIT) break;
    patchFile.file.patch = null;
    totalByteLength -= patchFile.byteLength;
  }
};

const collectPatchOutput = (command, argumentsList, repoRoot) =>
  execFileSync(command, argumentsList, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: PATCH_BUFFER_LIMIT,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

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
    (value) => value === undefined || (value !== null && value.startsWith('--')),
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

export const collectChanges = (repoRoot, options, changedFiles) => {
  const patchLineLimit = options.patchLineLimit ?? PATCH_LINE_LIMIT;
  if (options.pr) {
    const pullRequest = options.pullRequestData;
    let patchesByPath = new Map();
    try {
      const patchOutput = collectPatchOutput('gh', ['pr', 'diff', String(options.pr)], repoRoot);
      patchesByPath = parsePatches(patchOutput, patchLineLimit);
    } catch {
      patchesByPath = new Map();
    }
    const statusFromPatch = (patch) => {
      if (!patch) return 'M';
      const header = patch.split('@@')[0];
      if (header.includes('\nnew file mode')) return 'A';
      if (header.includes('\ndeleted file mode')) return 'D';
      if (header.includes('\nrename from ')) return 'R';
      return 'M';
    };
    const files = pullRequest.files.map((file) => ({
      path: file.path,
      status: statusFromPatch(patchesByPath.get(file.path)),
      additions: file.additions,
      deletions: file.deletions,
      patch: patchesByPath.get(file.path) ?? null,
    }));
    enforceTotalPatchSize(files);
    return {
      files,
      totals: {
        additions: pullRequest.additions,
        deletions: pullRequest.deletions,
      },
    };
  }
  if (!options.base) return { files: [], totals: null };

  const patchOutput = collectPatchOutput('git', ['diff', options.base], repoRoot);
  const patchesByPath = parsePatches(patchOutput, patchLineLimit);

  const filesByPath = new Map();
  const ensureFile = (filePath) => {
    if (!filesByPath.has(filePath)) {
      filesByPath.set(filePath, {
        path: filePath,
        status: 'M',
        additions: 0,
        deletions: 0,
        patch: patchesByPath.get(filePath) ?? null,
      });
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
  for (const line of outputLines(
    git(repoRoot, ['diff', '--name-status', `${options.base}...HEAD`]),
  )) {
    const [statusValue, firstPath, secondPath] = line.split('\t');
    const status = statusValue.startsWith('R') ? 'R' : statusValue[0];
    const filePath = status === 'R' ? secondPath : firstPath;
    if (!filePath) continue;
    ensureFile(filePath).status = ['M', 'A', 'D', 'R'].includes(status) ? status : 'M';
  }
  for (const line of outputLines(git(repoRoot, ['diff', '--numstat', 'HEAD']))) {
    addNumstat(line);
  }
  for (const filePath of outputLines(
    git(repoRoot, ['ls-files', '--others', '--exclude-standard']),
  )) {
    let additions = 0;
    let patch = null;
    try {
      const content = fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
      additions = lineCount(content);
      patch = untrackedPatch(filePath, content, patchLineLimit);
    } catch {
      additions = 0;
      patch = null;
    }
    filesByPath.set(filePath, {
      path: filePath,
      status: 'A',
      additions,
      deletions: 0,
      patch,
    });
  }
  for (const filePath of changedFiles) ensureFile(filePath);

  const files = [...filesByPath.values()];
  enforceTotalPatchSize(files);
  const totals = files.reduce(
    (summary, file) => ({
      additions: summary.additions + file.additions,
      deletions: summary.deletions + file.deletions,
    }),
    { additions: 0, deletions: 0 },
  );
  return { files, totals };
};

export const resolveChangedFiles = (repoRoot, options) => {
  if (options.pr) {
    const output = execFileSync(
      'gh',
      [
        'pr',
        'view',
        String(options.pr),
        '--json',
        'number,title,url,state,additions,deletions,files',
      ],
      { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
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
    changed.files,
  );
  const branch = detectBranch(repoRoot);
  const pullRequest = options.pr
    ? changed.pullRequest
    : options.base
      ? detectPullRequest(repoRoot)
      : null;
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
      (changes.totals ? `   +${changes.totals.additions} −${changes.totals.deletions}\n` : '\n') +
      (stats.changedCount > 0
        ? `  changed: ${stats.changedCount}   blast radius: ${stats.dependentCount}   depends on: ${stats.dependencyCount}\n`
        : '') +
      (context.pullRequest
        ? `  PR #${context.pullRequest.number}: ${context.pullRequest.url}\n`
        : '') +
      `  -> ${outPath}\n`,
  );

  if (options.open) {
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    execFileSync(openCommand, [outPath], { stdio: 'ignore' });
  }
};
