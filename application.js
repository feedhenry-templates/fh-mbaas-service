var mbaasApi = require('fh-mbaas-api-lcm');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var fhmbaasMiddleware = require('fh-mbaas-middleware');
var util = require('util');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'fh-mbaas-service',
  streams:[ {
    level: 'debug',
    stream: process.stdout,
    src: true
  } ]
});

// list the endpoints which you want to make securable here
var securableEndpoints = [];

var app = express();

// Enable CORS for all requests
app.use(cors());


// Note: the order which we add middleware to Express here is important!
app.use('/sys',  mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

var mongurl;

// some fall back options
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
  mongourl = process.env.OPENSHIFT_MONGODB_DB_URL;
}
else if (process.env.FH_MONGODB_DB_URL) {
  mongourl = process.env.FH_MONGODB_DB_URL;
}
else {
  log.error('No environment variable found for mongodb (mongoUrl)');
  process.exit(1);
}

// fhlint-begin: custom-routes
var jsonConfig = {
  mongoUrl: mongourl,
  mongo: {
    name: 'testing',
    admin_auth: {
      user: 'admin',
      pass: 'admin'
   }
  },
  logger: log
};

// models are also initialised in this call
fhmbaasMiddleware.init(jsonConfig, function (err) {
  if(err){
    console.error("FATAL: service not started " + util.inspect(err));
    console.trace();
    return false;
  }

  app.use(bodyParser.json());
  app.use('/api/mbaas', require('./lib/routes/api.js'));
  app.use('/api/app', require('./lib/routes/app.js'));

  // Important that this is last!
  app.use(mbaasExpress.errorHandler());

  var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
  var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
  app.listen(port, host, function() { // jshint unused:false
    console.log("App started at: " + new Date() + " on port: " + port);
  });
});
// fhlint-end
