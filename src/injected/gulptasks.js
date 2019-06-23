module.exports = function(prefix, task_factory) {
  const buildDir = 'dist/unpacked/injected';

  task_factory.clean(prefix, [buildDir]);

  task_factory.sass(
      prefix, 'src/injected/styles/**/*.scss', buildDir, 'injected-styles.css');
  task_factory.sassProd(
      prefix, 'src/injected/styles/**/*.scss', buildDir, 'injected-styles.css');

  task_factory.ts(
      prefix, './', ['src/injected/main/main.ts'], buildDir,
      'injected-bundle.js');
  task_factory.tsProd(
      prefix, './', ['src/injected/main/main.ts'], buildDir,
      'injected-bundle.js');

  const testFiles =
      ['main/**/*.ts', 'test/**/*Spec.ts'].map(f => `${__dirname}/${f}`);
  task_factory.testKarma(prefix, testFiles);
  task_factory.lint(prefix, ['src/injected/**/*.ts']);

  task_factory.watch(
      prefix, ['src/injected/**/*'], ['test', 'default', 'lint']);
}