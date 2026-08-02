const isMetaLine = (line) =>
  line.startsWith('diff ') ||
  line.startsWith('index ') ||
  line.startsWith('---') ||
  line.startsWith('+++') ||
  line.startsWith('new file') ||
  line.startsWith('rename') ||
  line.startsWith('Binary');

const kindForLine = (line) => {
  if (isMetaLine(line)) return 'meta';
  if (line.startsWith('@@')) return 'hunk';
  if (line.startsWith('+')) return 'add';
  if (line.startsWith('-')) return 'del';
  return 'context';
};

export const parseUnifiedDiff = (patchText) => {
  if (typeof patchText !== 'string' || patchText.length === 0) return [];
  return patchText.split('\n').map((line) => ({ kind: kindForLine(line), text: line }));
};
