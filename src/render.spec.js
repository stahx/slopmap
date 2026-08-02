import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { renderHtml } from './render.js';

const GRAPH_FIXTURE = {
  nodes: [{ id: 'src/example.js', label: '<example>' }],
  links: [],
  stats: { fileCount: 1, linkCount: 0 },
  changes: { files: [], totals: null },
};

const TEMPLATE_FIXTURE =
  '<title>__SLOPMAP_TITLE__</title><script id="slopmap-payload" type="application/json">__SLOPMAP_DATA__</script>';

let tempDirectory;
let templatePath;

beforeEach(() => {
  tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'slopmap-render-'));
  templatePath = path.join(tempDirectory, 'index.html');
  fs.writeFileSync(templatePath, TEMPLATE_FIXTURE, 'utf8');
});

afterEach(() => {
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

describe('src/render', () => {
  test('renderHtml substitutes both tokens', () => {
    const html = renderHtml({
      graph: GRAPH_FIXTURE,
      repoName: 'slopmap',
      modeLabel: 'full map',
      context: {},
      templatePath,
    });

    expect(html).toContain('<title>slopmap · slopmap · full map</title>');
    expect(html).toContain('"repoName":"slopmap"');
    expect(html).not.toContain('__SLOPMAP_TITLE__');
    expect(html).not.toContain('__SLOPMAP_DATA__');
  });

  test('renderHtml escapes less-than signs in JSON', () => {
    const html = renderHtml({
      graph: GRAPH_FIXTURE,
      repoName: 'slopmap',
      modeLabel: 'full map',
      context: {},
      templatePath,
    });

    expect(html).toContain('"label":"\\u003cexample>"');
    expect(html).not.toContain('"label":"<example>"');
  });

  test('renderHtml preserves replacement patterns in repository names', () => {
    const html = renderHtml({
      graph: GRAPH_FIXTURE,
      repoName: 'repo-$&-name',
      modeLabel: 'full map',
      context: {},
      templatePath,
    });

    expect(html).toContain('slopmap · repo-$&-name · full map');
    expect(html).toContain('"repoName":"repo-$&-name"');
  });

  test('renderHtml reports a missing viewer bundle', () => {
    expect(() =>
      renderHtml({
        graph: GRAPH_FIXTURE,
        repoName: 'slopmap',
        modeLabel: 'full map',
        context: {},
        templatePath: path.join(tempDirectory, 'missing.html'),
      }),
    ).toThrow('slopmap: viewer bundle not found at dist/index.html — run pnpm build');
  });

  test('renderHtml reports a missing payload marker', () => {
    fs.writeFileSync(templatePath, '<title>__SLOPMAP_TITLE__</title>', 'utf8');

    expect(() =>
      renderHtml({
        graph: GRAPH_FIXTURE,
        repoName: 'slopmap',
        modeLabel: 'full map',
        context: {},
        templatePath,
      }),
    ).toThrow('slopmap: viewer bundle is missing the payload marker — run pnpm build');
  });
});
