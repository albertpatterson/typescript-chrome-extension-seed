module.exports = function(createTaskFactory) {
  const taskFactory = createTaskFactory('injected');

  const buildDir = 'dist/unpacked/injected';

  const cleanTask = taskFactory.clean([buildDir]);

  const sassTask = taskFactory.sass(
      'src/injected/styles/**/*.scss', buildDir, 'injected-styles.css');
  const sassProdTask = taskFactory.sassProd(
      'src/injected/styles/**/*.scss', buildDir, 'injected-styles.css');

  const tsTask = taskFactory.ts(
      './', ['src/injected/main/main.ts'], buildDir, 'injected-bundle.js');
  const tsProdTask = taskFactory.tsProd(
      './', ['src/injected/main/main.ts'], buildDir, 'injected-bundle.js');

  const testFiles =
      ['main/**/*.ts', 'test/**/*Spec.ts'].map(f => `${__dirname}/${f}`);
  const testTask = taskFactory.test(testFiles);

  const lintTask = taskFactory.lint(['src/injected/**/*.ts']);

  const compileTask = taskFactory.compile(
      (series, parallel) => series(cleanTask, parallel(tsTask, sassTask)));

  const compileProdTask = taskFactory.compileProd(
      (series, parallel) =>
          series(cleanTask, parallel(tsProdTask, sassProdTask)));

  const watchTask = taskFactory.watch(
      ['src/injected/**/*'], [testTask, compileTask, lintTask]);
}
