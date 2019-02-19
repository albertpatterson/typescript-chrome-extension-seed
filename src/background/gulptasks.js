module.exports = function (prefix, task_factory) {
  task_factory.clean(prefix, ["dist/background"]);
  task_factory.ts(prefix, "./", ["src/background/scripts/main.ts"], "dist/background", "background-bundle.js");
}