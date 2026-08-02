import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultTemplatePath = path.join(toolRoot, 'dist', 'index.html');

export const renderHtml = ({
  graph,
  repoName,
  modeLabel,
  context,
  templatePath = defaultTemplatePath,
}) => {
  if (!fs.existsSync(templatePath)) {
    throw new Error('slopmap: viewer bundle not found at dist/index.html — run pnpm build');
  }
  const template = fs.readFileSync(templatePath, 'utf8');
  if (!template.includes('__SLOPMAP_DATA__')) {
    throw new Error('slopmap: viewer bundle is missing the payload marker — run pnpm build');
  }
  const { changes, ...graphPayload } = graph;
  const serializedData = JSON.stringify({
    graph: graphPayload,
    changes,
    repoName,
    modeLabel,
    context,
  }).replace(/</g, '\\u003c');
  const title = `slopmap · ${repoName} · ${modeLabel}`;

  return template
    .replaceAll('__SLOPMAP_TITLE__', () => title)
    .replaceAll('__SLOPMAP_DATA__', () => serializedData);
};

export const writeOutput = (outPath, html) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
};
