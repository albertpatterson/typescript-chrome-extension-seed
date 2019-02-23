const del = require("del");
const sass = require("gulp-sass");
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const browserify = require("browserify");
const source = require('vinyl-source-stream');
const tsify = require("tsify");
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const tslint = require('gulp-tslint');

function makePrefixer(prefix) {
  return name => `${prefix}_${name}`;
}


const task_factory = {
  clean: function (prefix, dists) {
    return gulp.task(makePrefixer(prefix)("clean"), () => {
      return del(dists, { force: true });
    })
  },

  sass: function (prefix, srcs, dist, name) {
    gulp.task(makePrefixer(prefix)("sass"), function () {
      return gulp.src(srcs)
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename(name))
        .pipe(gulp.dest(dist));
    });
  },

  html: function (prefix, src, dists) {
    gulp.task(makePrefixer(prefix)("html"), () => {
      return gulp.src(src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(dists));
    });
  },

  ts: function (prefix, project, entries, dist, name) {
    return gulp.task(makePrefixer(prefix)("ts"), () =>
      browserify({
        basedir: '.',
        debug: true,
        entries: entries,
        cache: {},
        packageCache: {}
      })
        .plugin(
          tsify,
          { "project": project })
        .bundle()
        .pipe(source(name))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist)))
  },

  test: function (prefix, testSrcs) {
    return gulp.task(makePrefixer(prefix)("test"), () => {
      return gulp.src(testSrcs, { read: false })
        .pipe(mocha({
          reporter: 'spec',
          require: ['ts-node/register']
        }));
    })
  },

  lint: function (prefix, srcs) {
    return gulp.task(makePrefixer(prefix)("lint"), () =>
      gulp.src(srcs)
        .pipe(tslint({
          formatter: "verbose"
        }))
        .pipe(tslint.report())
    );
  }
}

const popupPrefix = "popup";
const popupPrefixer = makePrefixer(popupPrefix);
require("./src/popup/gulptasks")(popupPrefix, task_factory);
const popupDefault = popupPrefixer("default");
gulp.task(popupDefault, gulp.series(
  popupPrefixer("clean"),
  gulp.parallel(
    popupPrefixer("sass"),
    popupPrefixer("html"),
    popupPrefixer("ts"))));


const injectedPrefix = "injected";
const injectedPrefixer = makePrefixer(injectedPrefix);
require("./src/injected/gulptasks")(injectedPrefix, task_factory);
const injectedDefault = injectedPrefixer("default");
gulp.task(injectedDefault, gulp.series(
  injectedPrefixer("clean"),
  gulp.parallel(
    injectedPrefixer("sass"),
    injectedPrefixer("ts"))));


const backgroundPrefix = "background";
const backgroundPrefixer = makePrefixer(backgroundPrefix);
require("./src/background/gulptasks")(backgroundPrefix, task_factory);
const backgroundDefault = backgroundPrefixer("default");
gulp.task(backgroundDefault, gulp.series(
  backgroundPrefixer("clean"),
  gulp.parallel(
    backgroundPrefixer("ts"))));

const prefixers = [popupPrefixer, injectedPrefixer, backgroundPrefixer];

const lintNames = prefixers.map(f => f("lint"));
gulp.task("lint", gulp.series.apply(null, lintNames));

const testNames = prefixers.map(f => f("test"));
gulp.task("test", gulp.series.apply(null, testNames));


gulp.task("copy-manifest", () => gulp.src(["src/manifest.json", "src/icon.png"]).pipe(gulp.dest("dist")))

gulp.task("default",
  gulp.series(
    "test",
    gulp.parallel(
      popupDefault,
      injectedDefault,
      backgroundDefault,
      "copy-manifest"),
    "lint",
  ));
