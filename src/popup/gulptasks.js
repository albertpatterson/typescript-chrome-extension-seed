module.exports = function(createTaskFactory) {
  const taskFactory = createTaskFactory('popup');
  const buildDir = 'dist/unpacked/popup/';

  const cleanTask = taskFactory.clean([buildDir]);

  const sassTask = taskFactory.sass(
      'src/popup/styles/**/*.scss', buildDir, 'popup-styles.css');

  const sassProdTask = taskFactory.sassProd(
      'src/popup/styles/**/*.scss', buildDir, 'popup-styles.css');

  const htmlTask = taskFactory.html('src/popup/popup.html', buildDir);

  const htmlProdTask = taskFactory.htmlProd('src/popup/popup.html', buildDir);

  const tsTask = taskFactory.ts(
      './', ['src/popup/main/main.ts'], buildDir, 'popup-bundle.js');

  const tsProdTask = taskFactory.tsProd(
      './', ['src/popup/main/main.ts'], buildDir, 'popup-bundle.js');

  const testFiles =
      ['main/**/*.ts', 'test/**/*Spec.ts'].map(f => `${__dirname}/${f}`);
  const testTask = taskFactory.test(testFiles);

  const lintTask = taskFactory.lint(['src/popup/**/*.ts']);

  const compileTask = taskFactory.compile(
      (series, parallel) =>
          series(cleanTask, parallel(tsTask, htmlTask, sassTask)));

  const compileProdTask = taskFactory.compileProd(
      (series, parallel) =>
          series(cleanTask, parallel(tsProdTask, htmlProdTask, sassProdTask)));

  taskFactory.watch(['src/popup/**/*'], [testTask, compileTask, lintTask]);
}
