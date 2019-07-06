module.exports = function(createTaskFactory) {
  const taskFactory = createTaskFactory('manifest');

  const buildDir = 'dist/unpacked';

  const cleanTask = taskFactory.clean([buildDir]);

  const copyTask =
      taskFactory.copy(['src/manifest.json', 'src/icon.png'], buildDir);

  const compileTask =
      taskFactory.compile((series, parallel) => series(cleanTask, copyTask));

  const compileProdTask = taskFactory.compileProd(
      (series, parallel) => series(cleanTask, copyTask));

  taskFactory.watch(['src/*'], [compileTask]);
}