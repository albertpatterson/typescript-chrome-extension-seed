module.exports = function (prefix, task_factory) {

  const buildDir = "dist/unpacked";

  task_factory.clean(prefix, [buildDir]);
  task_factory.copy(prefix, ["src/manifest.json", "src/icon.png"], buildDir);
}