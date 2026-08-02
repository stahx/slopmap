import { describe, expect, test } from 'vitest';

import { parseUnifiedDiff } from './diffFormat.js';

describe('app/src/lib/diffFormat', () => {
  test('parseUnifiedDiff', () => {
    expect(
      parseUnifiedDiff(
        [
          'diff --git a/file.js b/file.js',
          'index 1234567..abcdefg 100644',
          '--- a/file.js',
          '+++ b/file.js',
          'new file mode 100644',
          'rename from old.js',
          'Binary files a/image.png and b/image.png differ',
          '@@ -1,2 +1,2 @@',
          '+added',
          '-deleted',
          ' context',
        ].join('\n'),
      ),
    ).toEqual([
      { kind: 'meta', text: 'diff --git a/file.js b/file.js' },
      { kind: 'meta', text: 'index 1234567..abcdefg 100644' },
      { kind: 'meta', text: '--- a/file.js' },
      { kind: 'meta', text: '+++ b/file.js' },
      { kind: 'meta', text: 'new file mode 100644' },
      { kind: 'meta', text: 'rename from old.js' },
      { kind: 'meta', text: 'Binary files a/image.png and b/image.png differ' },
      { kind: 'hunk', text: '@@ -1,2 +1,2 @@' },
      { kind: 'add', text: '+added' },
      { kind: 'del', text: '-deleted' },
      { kind: 'context', text: ' context' },
    ]);
    expect(parseUnifiedDiff('@@ slopmap: diff truncated (501 lines) @@')).toEqual([
      { kind: 'hunk', text: '@@ slopmap: diff truncated (501 lines) @@' },
    ]);
    expect(parseUnifiedDiff('Binary files a/image.png and b/image.png differ')).toEqual([
      { kind: 'meta', text: 'Binary files a/image.png and b/image.png differ' },
    ]);
    expect(parseUnifiedDiff('')).toEqual([]);
  });
});
