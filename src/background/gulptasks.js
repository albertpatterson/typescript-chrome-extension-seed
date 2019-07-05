module.exports = function(prefix, task_factory) {
  const buildDir = 'dist/unpacked/background';

  task_factory.clean(prefix, [buildDir]);

  task_factory.ts(
      prefix, './', ['src/background/main/main.ts'], buildDir,
      'background-bundle.js');
  task_factory.tsProd(
      prefix, './', ['src/background/main/main.ts'], buildDir,
      'background-bundle.js');


  const testFiles =
      ['main/**/*.ts', 'test/**/*Spec.ts'].map(f => `${__dirname}/${f}`);
  task_factory.test(prefix, testFiles);
  task_factory.lint(prefix, ['src/background/**/*.ts']);

  task_factory.watch(
      prefix, ['src/background/**/*'], ['test', 'default', 'lint']);
}