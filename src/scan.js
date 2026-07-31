import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.mts',
  '.cts',
  '.tsx',
  '.vue',
  '.svelte',
]);

const IGNORED_SEGMENTS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'vendor',
  '.git',
  '.nuxt',
  '.output',
  '.next',
  '.cache',
]);

const IMPORT_PATTERNS = [
  /\bimport\s+[^'"();]+?\s+from\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bexport\s+[^'"();]+?\s+from\s*['"]([^'"]+)['"]/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const isIgnored = (filePath) =>
  filePath.endsWith('.min.js') || filePath.split('/').some((segment) => IGNORED_SEGMENTS.has(segment));

const stripComments = (content) =>
  content.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

export const extractSpecifiers = (content) => {
  const strippedContent = stripComments(content);
  const specifiers = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    for (const regexMatch of strippedContent.matchAll(pattern)) {
      specifiers.add(regexMatch[1]);
    }
  }
  return [...specifiers];
};

export const collectRepoFiles = (repoRoot) => {
  const listFiles = (extraArgs) =>
    execFileSync('git', ['ls-files', '-z', ...extraArgs], { cwd: repoRoot, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean);

  const allFiles = [...new Set([...listFiles([]), ...listFiles(['--others', '--exclude-standard'])])].filter(
    (filePath) => !isIgnored(filePath)
  );

  return {
    sourceFiles: allFiles.filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath))),
    packageFiles: allFiles.filter((filePath) => path.basename(filePath) === 'package.json'),
  };
};

export const scanSources = (repoRoot, sourceFiles) => {
  const sources = [];
  for (const filePath of sourceFiles) {
    let content;
    try {
      content = fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
    } catch {
      continue;
    }
    const specifiers = extractSpecifiers(content);
    sources.push({ filePath, loc: content.split('\n').length, specifiers });
  }
  return sources;
};
