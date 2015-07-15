var config = require('fh-mbaas-middleware').config;
var log = require('fh-mbaas-middleware').logger();
var models = require('fh-mbaas-middleware');
var appEnv = require('fh-mbaas-middleware').appEnv;
var _ = require('underscore');


function modelsInfo(req, res, next) {
  var domain = req.params.domain;
  var env = req.params.environment;
  var model = req.appMbaasModel;
  var mBaas = models.mbaas();

  log.logger.debug({name: model.name}, 'getting env vars for app', req.originalUrl);

  mBaas.findOne({domain: domain, environment: env}, function(err, mbaas){
    if(err){
      log.logger.error(err, 'Failed to look up Mbaas/AppMbaas instance');
      return next(new Error('Failed to look up Mbaas/AppMbaas instance'));
    }
    var envs = appEnv[req.appMbaasModel.type]({
      mbaas: mbaas,
      appMbaas: model,
      jsonConfig: config
    });
    req.resultData = {env:envs};
    return next();
  });
}


module.exports = {
  modelsInfo: modelsInfo
};
