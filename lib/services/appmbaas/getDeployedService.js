var fhMbaasMiddleware = require('fh-mbaas-middleware');
var log = require('../../util/log').get();


/**
 * Listing Deployed Services
 * @param params
 *  - domain: Domain
 *  - environment: Environment
 *  - guid: Service Guid
 * @param cb
 */
module.exports = function getDeployedService(params, cb){

  log.logger.debug("getDeployedService ", params);

  if(!params.domain || !params.environment || !params.guid){
    log.logger.error("getDeployedService: Invalid Parameters, ", {domain: !params.domain, environment: !params.environment});
    return cb(new Error("Missing Parameter: " + (params.domain ? "environment" : "domain")));
  }

  fhMbaasMiddleware.appmbaas().findOne({domain: params.domain, environment: params.environment, isServiceApp: true, guid: params.guid}, function(err, serviceApps){
    if(err){
      log.logger.error("Error Getting Deployed Service ", {error: err, params: params});
    }

    cb(err, serviceApps);
  });
};
