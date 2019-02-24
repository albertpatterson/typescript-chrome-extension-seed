module.exports = function (prefix, task_factory) {

  const buildDir = "dist/unpacked/background";

  task_factory.clean(prefix, [buildDir]);

  task_factory.ts(
    prefix,
    "./",
    ["src/background/main/main.ts"],
    buildDir,
    "background-bundle.js");
  task_factory.tsProd(
    prefix,
    "./",
    ["src/background/main/main.ts"],
    buildDir,
    "background-bundle.js");

  task_factory.test(prefix, ["src/background/test/**/*.ts"]);
  task_factory.lint(prefix, ["src/background/**/*.ts"]);
}