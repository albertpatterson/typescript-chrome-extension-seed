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
const mocha = require('gulp-mocha');
const tslint = require('gulp-tslint');
const gzip = require('gulp-zip');
const watch = require('gulp-watch');
const Server = require('karma').Server;
const karmaConfig = require('./karma.conf');

function makePrefixer(prefix) {
  return name => `${prefix}_${name}`;
}

const fullSuitekarmaOpts = {
  files: [],
  taskDefined: false,
};


const task_factory = {
  clean: function(prefix, dists) {
    return gulp.task(makePrefixer(prefix)('clean'), () => {
      return del(dists, {force: true});
    })
  },

  _sass: function(sassConfig, srcs, dist, name) {
    return gulp.src(srcs)
        .pipe(sass(sassConfig).on('error', sass.logError))
        .pipe(rename(name))
        .pipe(gulp.dest(dist));
  },


  sass: function(prefix, srcs, dist, name) {
    gulp.task(makePrefixer(prefix)('sass'), function() {
      return task_factory._sass({}, srcs, dist, name);
    });
  },

  sassProd: function(prefix, srcs, dist, name) {
    gulp.task(makePrefixer(prefix)('sass-prod'), function() {
      return task_factory._sass({outputStyle: 'compressed'}, srcs, dist, name);
    });
  },

  html: function(prefix, src, dists) {
    gulp.task(makePrefixer(prefix)('html'), () => {
      return gulp.src(src).pipe(gulp.dest(dists));
    });
  },

  htmlProd: function(prefix, src, dists) {
    gulp.task(makePrefixer(prefix)('html-prod'), () => {
      return gulp.src(src)
          .pipe(htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest(dists));
    });
  },

  _tsInit: function(project, entries, name) {
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
  },

  ts: function(prefix, project, entries, dist, name) {
    return gulp.task(
        makePrefixer(prefix)('ts'),
        () => task_factory._tsInit(project, entries, name)
                  .pipe(sourcemaps.init({loadMaps: true}))
                  .pipe(uglify())
                  .pipe(sourcemaps.write())
                  .pipe(gulp.dest(dist)))
  },

  tsProd: function(prefix, project, entries, dist, name) {
    return gulp.task(
        makePrefixer(prefix)('ts-prod'),
        () => task_factory._tsInit(project, entries, name)
                  .pipe(uglify())
                  .pipe(gulp.dest(dist)))
  },

  test: function(prefix, testSrcs) {
    return gulp.task(makePrefixer(prefix)('test'), () => {
      return gulp.src(testSrcs, {read: false})
          .pipe(mocha({reporter: 'spec', require: ['ts-node/register']}));
    })
  },

  _setupKarmaTest: function(name, files, opts) {
    opts = opts || {};

    gulp.task(name, (done) => {
      karmaConfig.clearFiles();
      karmaConfig.addFiles(files);

      new Server(
          {configFile: __dirname + '/karma.conf.js', singleRun: true, ...opts},
          () => {
            done();
          })
          .start();
    });
  },

  testKarma: function(prefix, files) {
    this._setupKarmaTest(makePrefixer(prefix)('test'), files);

    fullSuitekarmaOpts.files.push(...files);
    if (!fullSuitekarmaOpts.taskDefined) {
      this._setupKarmaTest('karma', fullSuitekarmaOpts.files);
      this._setupKarmaTest(
          'karma-travis', fullSuitekarmaOpts.files, {browsers: ['Firefox']});
      fullSuitekarmaOpts.taskDefined = true;
    }
  },

  lint: function(prefix, srcs) {
    return gulp.task(
        makePrefixer(prefix)('lint'),
        () => gulp.src(srcs)
                  .pipe(tslint({formatter: 'verbose'}))
                  .pipe(tslint.report()));
  },

  copy: function(prefix, srcs, dest) {
    return gulp.task(
        makePrefixer(prefix)('copy'),
        () => gulp.src(srcs).pipe(gulp.dest(dest)));
  },

  watch: function(prefix, srcs, tasks) {
    const prefixer = makePrefixer(prefix);
    const watchTasks = tasks.map(prefixer);
    return gulp.task(
        makePrefixer(prefix)('watch'),
        () => watch(srcs, gulp.series.apply(null, watchTasks)));
  }
};

function createGulpTasks(prefix, gulptaskRegister) {
  gulptaskRegister(prefix, task_factory);
  const prefixer = makePrefixer(prefix);
  return {
    prefixer: prefixer,
    default: prefixer('default'),
    prod: prefixer('prod')
  };
}

const {prefixer: popupPrefixer, default: popupDefault, prod: popupProd} =
    createGulpTasks('popup', require('./src/popup/gulptasks'));
gulp.task(
    popupDefault,
    gulp.series(
        popupPrefixer('clean'),
        gulp.parallel(
            popupPrefixer('sass'), popupPrefixer('html'),
            popupPrefixer('ts'))));
gulp.task(
    popupProd,
    gulp.series(
        popupPrefixer('clean'),
        gulp.parallel(
            popupPrefixer('sass-prod'), popupPrefixer('html-prod'),
            popupPrefixer('ts-prod'))));

const {
  prefixer: injectedPrefixer,
  default: injectedDefault,
  prod: injectedProd
} = createGulpTasks('injected', require('./src/injected/gulptasks'));
gulp.task(
    injectedDefault,
    gulp.series(
        injectedPrefixer('clean'),
        gulp.parallel(injectedPrefixer('sass'), injectedPrefixer('ts'))));
gulp.task(
    injectedProd,
    gulp.series(
        injectedPrefixer('clean'),
        gulp.parallel(
            injectedPrefixer('sass-prod'), injectedPrefixer('ts-prod'))));

const {
  prefixer: backgroundPrefixer,
  default: backgroundDefault,
  prod: backgroundProd
} = createGulpTasks('background', require('./src/background/gulptasks'));
gulp.task(
    backgroundDefault,
    gulp.series(
        backgroundPrefixer('clean'), gulp.parallel(backgroundPrefixer('ts'))));
gulp.task(
    backgroundProd,
    gulp.series(
        backgroundPrefixer('clean'),
        gulp.parallel(backgroundPrefixer('ts-prod'))));

const {prefixer: manifestPrefixer, default: manifestDefault} =
    createGulpTasks('manifest', require('./src/gulptasks'));
gulp.task(
    manifestDefault,
    gulp.series(manifestPrefixer('clean'), manifestPrefixer('copy')));

const prefixers = [popupPrefixer, injectedPrefixer, backgroundPrefixer];
const lintNames = prefixers.map(f => f('lint'));
gulp.task('lint', gulp.series.apply(null, lintNames));

gulp.task('test', gulp.series('karma', 'background_test'));
gulp.task('test-travis', gulp.series('karma-travis', 'background_test'))

const watchNames = prefixers.map(f => f('watch'));
gulp.task('watch', gulp.parallel.apply(null, watchNames));

gulp.task('zip', function() {
  return gulp.src(['dist/unpacked/**'])
      .pipe(gzip('extension.zip'))
      .pipe(gulp.dest('dist'))
})

gulp.task(
    'compile',
    gulp.parallel(
        popupDefault, injectedDefault, backgroundDefault, manifestDefault));

gulp.task(
    'compile-prod',
    gulp.parallel(popupProd, injectedProd, backgroundProd, manifestDefault));

gulp.task(
    'default',
    gulp.series(
        'test',  // test is performed via ts-node (not against transpiled js)
        'compile',
        'lint',  // tslint recommends building before linting
        'zip'));

gulp.task(
    'prod',
    gulp.series(
        'test',  // test is performed via ts-node (not against transpiled js)
        'compile-prod',
        'lint',  // tslint recommends building before linting
        'zip'));
