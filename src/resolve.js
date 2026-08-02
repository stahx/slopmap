import fs from 'node:fs';
import path from 'node:path';

const RESOLUTION_EXTENSIONS = [
  '.js',
  '.ts',
  '.mjs',
  '.cjs',
  '.jsx',
  '.tsx',
  '.mts',
  '.cts',
  '.vue',
  '.svelte',
];

const ALIAS_PATTERN = /^(?:~~\/|[@~]\/)/;

const normalize = (candidate) => {
  const normalized = path.posix.normalize(candidate);
  return normalized.startsWith('./') ? normalized.slice(2) : normalized;
};

const loadPackages = (repoRoot, packageFiles) => {
  const byName = new Map();
  const roots = new Set();
  for (const packageFile of packageFiles) {
    const packageDir = path.posix.dirname(packageFile);
    roots.add(packageDir);
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, packageFile), 'utf8'));
      if (manifest.name) {
        byName.set(manifest.name, {
          dir: packageDir,
          entry: manifest.main || manifest.module || null,
        });
      }
    } catch {
      continue;
    }
  }
  return { byName, roots };
};

export const createResolver = (repoRoot, repoFiles) => {
  const fileSet = new Set(repoFiles.sourceFiles);
  const packages = loadPackages(repoRoot, repoFiles.packageFiles);

  const tryFile = (candidate) => {
    const normalized = normalize(candidate);
    if (fileSet.has(normalized)) return normalized;
    for (const extension of RESOLUTION_EXTENSIONS) {
      if (fileSet.has(normalized + extension)) return normalized + extension;
    }
    for (const extension of RESOLUTION_EXTENSIONS) {
      const indexCandidate = `${normalized}/index${extension}`;
      if (fileSet.has(indexCandidate)) return indexCandidate;
    }
    return null;
  };

  const nearestPackageRoot = (fromFile) => {
    let current = path.posix.dirname(fromFile);
    while (current !== '.' && current !== '/') {
      if (packages.roots.has(current)) return current;
      current = path.posix.dirname(current);
    }
    return packages.roots.has('.') ? '.' : null;
  };

  const resolveAlias = (fromFile, specifier) => {
    const rest = specifier.replace(ALIAS_PATTERN, '');
    const packageRoot = nearestPackageRoot(fromFile);
    if (packageRoot === null) return null;
    const prefix = packageRoot === '.' ? '' : `${packageRoot}/`;
    return (
      tryFile(`${prefix}src/${rest}`) ||
      tryFile(`${prefix}${rest}`) ||
      tryFile(`${prefix}app/${rest}`) ||
      null
    );
  };

  const resolveWorkspacePackage = (specifier) => {
    for (const [packageName, packageInfo] of packages.byName) {
      if (specifier !== packageName && !specifier.startsWith(`${packageName}/`)) continue;
      const subpath = specifier === packageName ? null : specifier.slice(packageName.length + 1);
      if (subpath) return tryFile(`${packageInfo.dir}/${subpath}`);
      if (packageInfo.entry) {
        const entryHit = tryFile(`${packageInfo.dir}/${normalize(packageInfo.entry)}`);
        if (entryHit) return entryHit;
      }
      return tryFile(`${packageInfo.dir}/index`) || tryFile(`${packageInfo.dir}/src/index`);
    }
    return null;
  };

  const resolve = (fromFile, specifier) => {
    if (specifier.startsWith('.')) {
      return tryFile(path.posix.join(path.posix.dirname(fromFile), specifier));
    }
    if (ALIAS_PATTERN.test(specifier)) {
      return resolveAlias(fromFile, specifier);
    }
    return resolveWorkspacePackage(specifier);
  };

  const isInternalLooking = (specifier) =>
    specifier.startsWith('.') || ALIAS_PATTERN.test(specifier);

  return { resolve, isInternalLooking };
};
