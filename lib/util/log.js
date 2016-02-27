var log = {};

module.exports = {
  get: function(){
    return log;
  },
  set: function(newLogger){
    log.logger = newLogger;
  }
};
