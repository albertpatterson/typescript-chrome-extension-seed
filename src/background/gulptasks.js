module.exports = function (prefix, task_factory) {
  task_factory.clean(prefix, ["dist/background"]);
  task_factory.ts(prefix, "./", ["src/background/main/main.ts"], "dist/background", "background-bundle.js");

  task_factory.test(prefix, ["src/background/test/**/*.ts"]);
  task_factory.lint(prefix, ["src/background/**/*.ts"]);

}