const TaskManager = require('./gulputils/TaskManager');
const gulp = require('gulp');

const taskManager = new TaskManager(gulp);
function createTaskFactory(name) {
  return taskManager.createTaskFactory(name);
}

const taskFactory = createTaskFactory('main');
const fullCleanTask = taskFactory.clean('dist');
const zipTask = taskFactory.zip(['dist/unpacked/**'], 'extension.zip', 'dist');

const submoduleTaskDefinitions = [
  './src/gulptasks',
  './src/background/gulptasks',
  './src/popup/gulptasks',
  './src/injected/gulptasks',
];
for (const submoduleTaskDefinition of submoduleTaskDefinitions) {
  require(submoduleTaskDefinition)(createTaskFactory);
}

gulp.task(
    'build',
    gulp.series(
        fullCleanTask,
        'test',  // test is performed via ts-node (not against transpiled js)
        'compile',
        'lint',  // tslint recommends building before linting
        ));

gulp.task(
    'build-prod',
    gulp.series(
        fullCleanTask,
        'test',  // test is performed via ts-node (not against transpiled js)
        'compile-prod',
        'lint',  // tslint recommends building before linting
        zipTask));