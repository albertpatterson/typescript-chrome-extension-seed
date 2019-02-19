module.exports = function (prefix, task_factory) {
  task_factory.clean(prefix, ["dist/popup"]);
  task_factory.sass(prefix, 'src/popup/styles/**/*.scss', "dist/popup/", "popup-styles.css");
  task_factory.html(prefix, 'src/popup/popup.html', 'dist/popup');
  task_factory.ts(prefix, "./", ["src/popup/scripts/main.ts"], "dist/popup", "popup-bundle.js");
}