var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var fhmbaasMiddleware = require('fh-mbaas-middleware');
var util = require('util');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');
var mongoUri = require('mongodb-uri');
var multer = require('multer');
var fhServiceAuth = require('fh-service-auth');
var formsUpdater = require('./lib/formsUpdater');
var log = require('./lib/util/log');
var logg = log.get();
var scheduler;

log.set(bunyan.createLogger({
  name: 'fh-mbaas-service',
  streams:[{
    level: 'debug',
    stream: process.stdout,
    src: true
  }]
}));

logg.logger.info('log created');

// list the endpoints which you want to make securable here
var securableEndpoints = [];

var app = express();

// Enable CORS for all requests
app.use(cors());


// Note: the order which we add middleware to Express here is important!
app.use('/sys',  mbaasExpress.sys(securableEndpoints));

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

var mongoUrl;

// some fall back options
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
  mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL;
}
else if (process.env.FH_MONGODB_CONN_URL) {
  mongoUrl = process.env.FH_MONGODB_CONN_URL;
}
else {
  logg.logger.error('No environment variable found for mongodb (mongoUrl). Exiting.');
  process.exit(1);
}

// parse mongo connection string e.g.
// mongodb://user:pass@host1,host2,host3:27017/fh-mbaas
// check if database exists else default to admin
var parsedMongoUrl = mongoUri.parse(mongoUrl);
if (!parsedMongoUrl.database) {
  mongoUrl = mongoUrl + "admin";
  parsedMongoUrl = mongoUri.parse(mongoUrl);
}

logg.logger.info('parsedMongoUrl', parsedMongoUrl);
// fhlint-begin: custom-routes
var jsonConfig = {
  mongoUrl: mongoUrl,
  mongo: {
    name: 'fh-mbaas-testing',
    host: parsedMongoUrl.hosts[0].host,
    port: parsedMongoUrl.hosts[0].port,
    admin_auth: {
      user: parsedMongoUrl.username,
      pass: parsedMongoUrl.password
    }
  },
  logger: logg.logger,
  agenda: {
    enabled: true,
    jobs: {
      data_source_update: {
        schedule: "30 seconds"
      }
    }
  }
};

// models are also initialised in this call
fhmbaasMiddleware.init(jsonConfig, function (err) {
  if(err){
    console.error("FATAL: service not started " + util.inspect(err));
    console.trace();
    process.exit(1);
  }
  fhServiceAuth.init({
        logger: logg.logger
      }, function(err){
        if(err){
          console.error("FATAL: service not started " + util.inspect(err));
          console.trace();
          process.exit(1);
        }

        scheduler = formsUpdater.scheduler(logg.logger, jsonConfig, jsonConfig.mongoUrl);

        app.use(bodyParser.json({limit: '100mb'}));
        app.use(multer());
        app.use('/api/mbaas', require('./lib/routes/api.js'));
        app.use('/api/app', require('./lib/routes/app.js'));
        // Note: moved to allow authorizatiobn to be passed for above mappings
        app.use(mbaasExpress.fhmiddleware());


        // Important that this is last!
        app.use(mbaasExpress.errorHandler());

        var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
        var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

        logg.logger.info('listen', host, port);
        app.listen(port, host, function() { // jshint unused:false
          console.log("App started at: " + new Date() + " on port: " + port);
        });
      });
});
// fhlint-end
