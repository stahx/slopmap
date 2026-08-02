import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { beforeEach, describe, expect, test } from 'vitest';

import { createResolver } from './resolve.js';

const ROOT_MANIFEST = {
  name: 'fixture-root',
  private: true,
  workspaces: ['packages/*'],
};

const WORKSPACE_MANIFEST = {
  name: '@fixture/ui',
  main: 'src/index.ts',
};

const SOURCE_FILES = [
  'src/main.ts',
  'src/utils/tool.ts',
  'src/features/index.ts',
  'config.ts',
  'packages/ui/src/index.ts',
  'packages/ui/button.ts',
];

const PACKAGE_FILES = ['package.json', 'packages/ui/package.json'];

let repoRoot;

beforeEach(() => {
  repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'slopmap-'));
  fs.mkdirSync(path.join(repoRoot, 'packages/ui'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'package.json'), JSON.stringify(ROOT_MANIFEST));
  fs.writeFileSync(
    path.join(repoRoot, 'packages/ui/package.json'),
    JSON.stringify(WORKSPACE_MANIFEST),
  );
});

describe('src/resolve', () => {
  test('resolve', () => {
    const resolver = createResolver(repoRoot, {
      sourceFiles: SOURCE_FILES,
      packageFiles: PACKAGE_FILES,
    });

    expect(resolver.resolve('src/main.ts', './utils/tool')).toBe('src/utils/tool.ts');
    expect(resolver.resolve('src/main.ts', './features')).toBe('src/features/index.ts');
    expect(resolver.resolve('src/main.ts', '@/utils/tool')).toBe('src/utils/tool.ts');
    expect(resolver.resolve('src/main.ts', '~/config')).toBe('config.ts');
    expect(resolver.resolve('src/main.ts', '@fixture/ui')).toBe('packages/ui/src/index.ts');
    expect(resolver.resolve('src/main.ts', '@fixture/ui/button')).toBe('packages/ui/button.ts');
    expect(resolver.resolve('src/main.ts', 'external-package')).toBeNull();
  });

  test('isInternalLooking', () => {
    const resolver = createResolver(repoRoot, {
      sourceFiles: SOURCE_FILES,
      packageFiles: PACKAGE_FILES,
    });

    expect(resolver.isInternalLooking('./utils/tool')).toBe(true);
    expect(resolver.isInternalLooking('@/utils/tool')).toBe(true);
    expect(resolver.isInternalLooking('~/config')).toBe(true);
    expect(resolver.isInternalLooking('~~/config')).toBe(true);
    expect(resolver.isInternalLooking('external-package')).toBe(false);
  });
});
