const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const moreLine = (shown, total) =>
  total > shown ? [`  ... ${total - shown} more (raise --limit)`] : [];

const listLines = (items, limit) => [
  ...items.slice(0, limit).map((item) => `  ${item}`),
  ...moreLine(Math.min(items.length, limit), items.length),
];

const titledList = (title, items, limit) =>
  items.length === 0
    ? [`${title}: none`]
    : [`${title} (${items.length}):`, ...listLines(items, limit)];

const sectionSummary = (bySection, limit) => {
  const shown = bySection.slice(0, limit).map(({ section, count }) => `${section} ${count}`);
  const hidden = bySection.length - shown.length;
  return `  by section: ${shown.join(', ')}${hidden > 0 ? `, +${hidden} more` : ''}`;
};

const impactLines = (result, limit, title) => {
  const lines = [
    `${title}: ${plural(result.total, 'dependent')} (${result.direct} direct) across ${plural(result.bySection.length, 'section')}`,
    sectionSummary(result.bySection, limit),
  ];
  const depthCounts = new Map();
  for (const dependent of result.dependents) {
    depthCounts.set(dependent.depth, (depthCounts.get(dependent.depth) ?? 0) + 1);
  }
  const shown = result.dependents.slice(0, limit);
  let currentDepth = 0;
  for (const dependent of shown) {
    if (dependent.depth !== currentDepth) {
      currentDepth = dependent.depth;
      const label = currentDepth === 1 ? 'direct' : `depth ${currentDepth}`;
      lines.push(`${label} (${depthCounts.get(currentDepth)}):`);
    }
    lines.push(`  ${dependent.path}`);
  }
  return [...lines, ...moreLine(shown.length, result.total)];
};

export const formatQuery = (result) => {
  if (result.total === 0) return `no source files match "${result.term}"`;
  const showing =
    result.total > result.files.length ? ` (showing ${result.files.length}, raise --limit)` : '';
  return [
    `${plural(result.total, 'file')} match "${result.term}"${showing}`,
    ...result.files.map(
      (file) =>
        `  ${file.path}  [${file.section}]  ${file.loc} loc, ${plural(file.importerCount, 'importer')}, ${plural(file.importCount, 'import')}`,
    ),
  ].join('\n');
};

export const formatContext = (result, limit) =>
  [
    `${result.path}  [${result.section}]  ${result.loc} loc`,
    ...titledList('imports', result.imports, limit),
    ...titledList('imported by', result.importedBy, limit),
  ].join('\n');

export const formatImpact = (result, limit) => {
  const title =
    result.targets.length === 1 ? result.targets[0] : plural(result.targets.length, 'file');
  if (result.total === 0) return `${title}: nothing imports it`;
  return impactLines(result, limit, title).join('\n');
};

export const formatChanges = (result, limit) => {
  const totals = result.totals ? `, +${result.totals.additions} -${result.totals.deletions}` : '';
  if (result.files.length === 0) return `changes ${result.mode}: nothing changed`;
  const changeRows = result.files.map(
    (file) => `${file.status}  ${file.path}  +${file.additions} -${file.deletions}`,
  );
  return [
    `changes ${result.mode}: ${plural(result.files.length, 'file')}${totals}`,
    ...listLines(changeRows, limit),
    ...(result.total === 0
      ? ['blast radius: nothing imports the changed files']
      : impactLines(result, limit, 'blast radius')),
  ].join('\n');
};

export const formatOverview = (result) =>
  [
    `${plural(result.files, 'source file')}, ${plural(result.imports, 'import')}, ${result.unresolved} unresolved`,
    'sections (files, loc, imports out / in):',
    ...result.sections.map(
      (section) =>
        `  ${section.section}: ${plural(section.files, 'file')}, ${section.loc} loc, out ${section.importsOut} / in ${section.importsIn}`,
    ),
  ].join('\n');
