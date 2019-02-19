module.exports = function (prefix, task_factory) {
  task_factory.clean(prefix, ["dist/injected"]);
  task_factory.sass(prefix, 'src/injected/styles/**/*.scss', "dist/injected", "injected-styles.css");
  task_factory.ts(prefix, "./", ["src/injected/scripts/main.ts"], "dist/injected", "injected-bundle.js");
}