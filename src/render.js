import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const locateLibrary = () => {
  const directPath = path.join(toolRoot, 'node_modules', '3d-force-graph', 'dist', '3d-force-graph.min.js');
  if (fs.existsSync(directPath)) return directPath;

  let resolvedEntry = null;
  try {
    const packageRequire = createRequire(import.meta.url);
    resolvedEntry = packageRequire.resolve('3d-force-graph');
  } catch {
    resolvedEntry = null;
  }

  if (resolvedEntry !== null) {
    const fallbackPath = path.join(path.dirname(resolvedEntry), '3d-force-graph.min.js');
    if (fs.existsSync(fallbackPath)) return fallbackPath;
  }

  throw new Error('slopmap: cannot locate 3d-force-graph UMD bundle');
};

export const renderHtml = ({ graph, repoName, modeLabel }) => {
  const librarySource = fs.readFileSync(locateLibrary(), 'utf8');
  const template = fs.readFileSync(path.join(toolRoot, 'src', 'template.html'), 'utf8');
  const serializedData = JSON.stringify({ graph, repoName, modeLabel }).replace(/</g, '\\u003c');
  const title = `slopmap · ${repoName} · ${modeLabel}`;

  return template
    .replaceAll('__SLOPMAP_TITLE__', () => title)
    .replaceAll('__SLOPMAP_LIB__', () => librarySource)
    .replaceAll('__SLOPMAP_DATA__', () => serializedData);
};

export const writeOutput = (outPath, html) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
};
