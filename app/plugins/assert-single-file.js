const countOccurrences = (content, token) => content.split(token).length - 1;

const assertSingleFile = () => ({
  name: 'assert-single-file',
  apply: 'build',
  enforce: 'post',
  generateBundle: (unusedOptions, bundle) => {
    const emittedFiles = Object.values(bundle);
    if (emittedFiles.length !== 1) {
      throw new Error(`slopmap: expected one emitted file, received ${emittedFiles.length}`);
    }

    const emittedFile = emittedFiles[0];
    if (emittedFile.type !== 'asset' || !emittedFile.fileName.endsWith('.html')) {
      throw new Error('slopmap: expected the emitted file to be HTML');
    }

    const html = String(emittedFile.source);
    if (countOccurrences(html, '__SLOPMAP_DATA__') !== 1) {
      throw new Error('slopmap: viewer bundle must contain exactly one payload marker');
    }
    if (countOccurrences(html, '__SLOPMAP_TITLE__') !== 1) {
      throw new Error('slopmap: viewer bundle must contain exactly one title marker');
    }
    if (html.includes('src="')) {
      throw new Error('slopmap: viewer bundle contains an external script source');
    }
    if (html.includes('href="./assets')) {
      throw new Error('slopmap: viewer bundle contains an emitted asset reference');
    }
    if (html.includes('__vitePreload')) {
      throw new Error('slopmap: viewer bundle contains the Vite preload helper');
    }
    if (html.includes('SLOPMAP_DEV_FIXTURE_SENTINEL')) {
      throw new Error('slopmap: viewer bundle contains a development fixture');
    }
  },
});

export default assertSingleFile;
