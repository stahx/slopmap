import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { collectChanges, resolveChangedFiles } from '../src/cli.js';
import { buildGraph } from '../src/graph.js';
import { createResolver } from '../src/resolve.js';
import { collectRepoFiles, scanSources } from '../src/scan.js';

const parseArguments = (argumentsList) => {
  const positionalArguments = [];
  let baseRef = null;
  for (let argumentIndex = 0; argumentIndex < argumentsList.length; argumentIndex += 1) {
    const argument = argumentsList[argumentIndex];
    if (argument === '--base') {
      argumentIndex += 1;
      baseRef = argumentsList[argumentIndex];
    } else {
      positionalArguments.push(argument);
    }
  }
  if (baseRef === undefined) {
    throw new Error('slopmap: missing value for --base');
  }
  if (positionalArguments.length > 2) {
    throw new Error('Usage: node scripts/make-fixture.js [repo] [output] [--base ref]');
  }
  return {
    repoPath: positionalArguments[0] ?? '.',
    outputPath: positionalArguments[1] ?? `app/fixtures/payload.${baseRef ? 'diff' : 'full'}.json`,
    baseRef,
  };
};

const git = (repoRoot, argumentsList) =>
  execFileSync('git', argumentsList, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();

const detectBranch = (repoRoot) => {
  try {
    const branch = git(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
    return branch === 'HEAD' ? null : branch;
  } catch {
    return null;
  }
};

const makeFixture = ({ repoPath, outputPath, baseRef }) => {
  const repoRoot = git(path.resolve(repoPath), ['rev-parse', '--show-toplevel']);
  const options = { base: baseRef, pr: null };
  const changed = resolveChangedFiles(repoRoot, options);
  const changes = collectChanges(repoRoot, options, changed.files);
  const repoFiles = collectRepoFiles(repoRoot);
  const sources = scanSources(repoRoot, repoFiles.sourceFiles);
  const resolver = createResolver(repoRoot, repoFiles);
  const builtGraph = buildGraph({
    sources,
    resolver,
    changedFiles: changed.files,
    changes,
  });
  const { changes: graphChanges, ...graph } = builtGraph;
  const fixture = {
    sentinel: 'SLOPMAP_DEV_FIXTURE_SENTINEL',
    graph,
    changes: graphChanges,
    repoName: path.basename(repoRoot),
    modeLabel: changed.modeLabel,
    context: {
      branch: detectBranch(repoRoot),
      baseRef,
      pullRequest: null,
      generatedAt: new Date().toISOString(),
    },
  };
  const resolvedOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  process.stdout.write(`slopmap: wrote ${resolvedOutputPath}\n`);
};

makeFixture(parseArguments(process.argv.slice(2)));
