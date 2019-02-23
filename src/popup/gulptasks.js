module.exports = function (prefix, task_factory) {

  const buildDir = "dist/unpacked/popup/";

  task_factory.clean(prefix, [buildDir]);
  task_factory.sass(prefix, 'src/popup/styles/**/*.scss', buildDir, "popup-styles.css");
  task_factory.html(prefix, 'src/popup/popup.html', buildDir);
  task_factory.ts(prefix, "./", ["src/popup/main/main.ts"], buildDir, "popup-bundle.js");

  task_factory.test(prefix, ["src/popup/test/**/*.ts"]);
  task_factory.lint(prefix, ["src/popup/**/*.ts"]);
}