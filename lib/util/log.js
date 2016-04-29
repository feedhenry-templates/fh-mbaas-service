var bunyan = require('bunyan');

var log = {};

module.exports = {
  get: function(){
    return log;
  },
  set: function(newLogger){
    log.logger = newLogger;
  },
  getDefault: function(){
    log.logger = bunyan.createLogger({
      name: 'fh-mbaas-service',
      streams:[{
        level: 'debug',
        stream: process.stdout,
        src: true
      }]
    });
    return log;
  }
};
