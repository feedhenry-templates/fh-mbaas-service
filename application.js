var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var fhmbaasMiddleware = require('fh-mbaas-middleware');
var util = require('util');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');
var mongoUri = require('mongodb-uri');

var log = bunyan.createLogger({
  name: 'fh-mbaas-service',
  streams:[{
    level: 'info',
    stream: process.stdout,
    src: true
  }]
});
log.info('log created');

// list the endpoints which you want to make securable here
var securableEndpoints = [];

var app = express();

// Enable CORS for all requests
app.use(cors());


// Note: the order which we add middleware to Express here is important!
app.use('/sys',  mbaasExpress.sys(securableEndpoints));

// TODO: is this needed?
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

var mongoUrl;

// some fall back options
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
  mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL;
}
else if (process.env.FH_MONGODB_CONN_URL) {
  mongoUrl = process.env.FH_MONGODB_CONN_URL;
}
else {
  log.error('No environment variable found for mongodb (mongoUrl). Exiting.');
  process.exit(1);
}

// parse mongo connection string e.g.
// mongodb://user:pass@host1,host2,host3:27017/fh-mbaas
// check if database exists else default to admin
var parsedMongoUrl = mongoUri.parse(mongoUrl);
if (!parsedMongoUrl.database) {
  mongoUrl = mongoUrl + "admin";
  parsedMongourl = mongoUri.parse(mongoUrl);
}

log.info('parsedMongoUrl', parsedMongoUrl);
// fhlint-begin: custom-routes
var jsonConfig = {
  mongoUrl: mongoUrl,
  mongo: {
    name: 'fh-mbaas-testing',
    admin_auth: {
      user: parsedMongoUrl.username,
      pass: parsedMongoUrl.password
    }
  },
  logger: log
};

// models are also initialised in this call
fhmbaasMiddleware.init(jsonConfig, function (err) {
  if(err){
    console.error("FATAL: service not started " + util.inspect(err));
    console.trace();
    process.exit(1);
  }

  app.use(bodyParser.json());
  app.use('/api/mbaas', require('./lib/routes/api.js'));
  app.use('/api/app', require('./lib/routes/app.js'));

  // Important that this is last!
  app.use(mbaasExpress.errorHandler());

  var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
  var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

  log.info('listen', host, port);
  app.listen(port, host, function() { // jshint unused:false
    console.log("App started at: " + new Date() + " on port: " + port);
  });
});
// fhlint-end
