module.exports = function(createTaskFactory) {
  const taskFactory = createTaskFactory('background');
  const buildDir = 'dist/unpacked/background';

  const cleanTask = taskFactory.clean([buildDir]);

  const tsTask = taskFactory.ts(
      './', ['src/background/main/main.ts'], buildDir, 'background-bundle.js');
  const tsProdTask = taskFactory.tsProd(
      './', ['src/background/main/main.ts'], buildDir, 'background-bundle.js');

  const testFiles =
      ['main/**/*.ts', 'test/**/*Spec.ts'].map(f => `${__dirname}/${f}`);
  const testTask = taskFactory.test(testFiles);

  const lintTask = taskFactory.lint(['src/background/**/*.ts']);

  const compileTask =
      taskFactory.compile((series, paralell) => series(cleanTask, tsTask));

  const compileProdTask = taskFactory.compileProd(
      (series, paralell) => series(cleanTask, tsProdTask));


  taskFactory.watch(['src/background/**/*'], [testTask, compileTask, lintTask]);
}
