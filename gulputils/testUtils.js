const Server = require('karma').Server;
const karmaConfig = require('../karma.conf');
function createTestTask(files, opts) {
  opts = opts || {};

  return (done) => {
    karmaConfig.clearFiles();
    karmaConfig.addFiles(files);

    new Server(
        {configFile: __dirname + '/../karma.conf.js', singleRun: true, ...opts},
        () => {
          done();
        })
        .start();
  };
};

module.exports = createTestTask;