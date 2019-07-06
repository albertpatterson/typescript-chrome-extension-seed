const createTestTask = require('./testUtils');
const del = require('del');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulp = require('gulp');
const tslint = require('gulp-tslint');
const watch = require('gulp-watch');
const gzip = require('gulp-zip');

class TaskManager {
  constructor(gulp) {
    this.gulp = gulp;
    this.taskFactories = [];
    this._registerTasks();
  }

  createTaskFactory(prefix) {
    const taskFactory = new TaskFactory(this.gulp, prefix);
    this.taskFactories.push(taskFactory);
    return taskFactory;
  }

  _registerTasks() {
    this._registerTest();
    this._registerCompile();
    this._registerCompileProd();
    this._registerLint();
    this._registerWatch();
  }

  _registerTest() {
    const task = (done) => {
      const testFiles =
          this.taskFactories.reduce((all, tf) => [...all, ...tf.testFiles], []);
      const taskInner = createTestTask(testFiles);
      return taskInner(done);
    };
    this.gulp.task('test', task);
  }

  _registerCompile() {
    const task = (done) => {
      const tasks = this.taskFactories.reduce(
          (all, tf) => [...all, ...tf.tasks.compile], []);
      const taskInner = (tasks.length > 0) ? gulp.parallel(tasks) : d => d();
      return taskInner(done);
    };
    this.gulp.task('compile', task);
  }

  _registerCompileProd() {
    const task = (done) => {
      const tasks = this.taskFactories.reduce(
          (all, tf) => [...all, ...tf.tasks.compileProd], []);
      const taskInner = (tasks.length > 0) ? gulp.parallel(tasks) : d => d();
      return taskInner(done);
    };
    this.gulp.task('compile-prod', task);
  }

  _registerLint() {
    const task = (done) => {
      const tasks = this.taskFactories.reduce(
          (all, tf) => [...all, ...tf.tasks.lint], []);
      const taskInner = (tasks.length > 0) ? gulp.parallel(tasks) : d => d();
      return taskInner(done);
    };
    this.gulp.task('lint', task);
  }

  _registerWatch() {
    const task = (done) => {
      const tasks = this.taskFactories.reduce(
          (all, tf) => [...all, ...tf.tasks.watch], []);
      const taskInner = (tasks.length > 0) ? gulp.parallel(tasks) : d => d();
      return taskInner(done);
    };
    this.gulp.task('watch', task);
  }
}

class TaskFactory {
  constructor(gulp, prefix) {
    this.gulp = gulp;
    this.prefix = prefix;

    this.tasks = {
      compile: [],
      compileProd: [],
      lint: [],
      watch: [],
    };

    this.testFiles = [];
  }

  _makeTaskName(task) {
    return `${this.prefix}-${task}`;
  }

  clean(dists) {
    const taskName = this._makeTaskName('clean');
    const task = () => del(dists, {force: true});
    this.gulp.task(taskName, task);
    return taskName;
  }

  _sass(sassConfig, srcs, dist, name) {
    return this.gulp.src(srcs)
        .pipe(sass(sassConfig).on('error', sass.logError))
        .pipe(rename(name))
        .pipe(this.gulp.dest(dist));
  }

  sass(srcs, dist, name) {
    const taskName = this._makeTaskName('sass');
    const task = () => this._sass({}, srcs, dist, name);
    this.gulp.task(taskName, task);
    return taskName;
  }

  sassProd(srcs, dist, name) {
    const taskName = this._makeTaskName('sass-prod');
    const task = () => this._sass(
        {outputStyle: 'compressed'},
        srcs,
        dist,
        name,
    );
    this.gulp.task(taskName, task);
    return taskName;
  }

  html(src, dists) {
    const taskName = this._makeTaskName('html');
    const task = () => this.gulp.src(src).pipe(this.gulp.dest(dists));
    this.gulp.task(taskName, task);
    return taskName;
  }

  htmlProd(src, dists) {
    const taskName = this._makeTaskName('html-prod');
    const task = () => this.gulp.src(src)
                           .pipe(htmlmin({collapseWhitespace: true}))
                           .pipe(this.gulp.dest(dists));
    this.gulp.task(taskName, task);
    return taskName;
  }

  _tsInit(project, entries, name) {
    return browserify({
             basedir: '.',
             debug: true,
             entries: entries,
             cache: {},
             packageCache: {}
           })
        .plugin(tsify, {'project': project})
        .bundle()
        .pipe(source(name))
        .pipe(buffer())
  }

  ts(project, entries, dist, name) {
    const taskName = this._makeTaskName('ts');
    const task = () => this._tsInit(project, entries, name)
                           .pipe(sourcemaps.init({loadMaps: true}))
                           .pipe(uglify())
                           .pipe(sourcemaps.write())
                           .pipe(this.gulp.dest(dist));
    this.gulp.task(taskName, task);
    return taskName;
  }

  tsProd(project, entries, dist, name) {
    const taskName = this._makeTaskName('ts-prod');
    const task = () => this._tsInit(project, entries, name)
                           .pipe(uglify())
                           .pipe(this.gulp.dest(dist));
    this.gulp.task(taskName, task);
    return taskName;
  }

  test(files) {
    const taskName = this._makeTaskName('test');
    const task = createTestTask(files);
    this.gulp.task(taskName, task);
    this.testFiles.push(...files);
    return taskName;
  }

  lint(srcs) {
    const taskName = this._makeTaskName('lint');
    const task = () => this.gulp.src(srcs)
                           .pipe(tslint({formatter: 'verbose'}))
                           .pipe(tslint.report());
    this.gulp.task(taskName, task);
    this.tasks.lint.push(taskName);
    return taskName;
  }

  copy(srcs, dest) {
    const taskName = this._makeTaskName('copy');
    const task = () => this.gulp.src(srcs).pipe(this.gulp.dest(dest));
    this.gulp.task(taskName, task);
    return taskName;
  }

  compile(setup) {
    const taskName = this._makeTaskName('compile');
    const task = setup(this.gulp.series, this.gulp.parallel);
    this.gulp.task(taskName, task);
    console.log(this);
    this.tasks.compile.push(taskName);
    return taskName;
  }

  compileProd(setup) {
    const taskName = this._makeTaskName('compile-prod');
    const task = setup(this.gulp.series, this.gulp.parallel);
    this.gulp.task(taskName, task);
    this.tasks.compileProd.push(taskName);
    return taskName;
  }

  watch(srcs, tasks) {
    const taskName = this._makeTaskName('watch');
    const task = () => watch(srcs, this.gulp.series.apply(null, tasks));
    this.gulp.task(taskName, task);
    this.tasks.watch.push(taskName);
    return taskName;
  }

  zip(srcs, name, dest) {
    const taskName = this._makeTaskName('zip');
    const task = () => gulp.src(srcs).pipe(gzip(name)).pipe(gulp.dest(dest));
    this.gulp.task(taskName, task);
    return taskName;
  }
}

module.exports = TaskManager;