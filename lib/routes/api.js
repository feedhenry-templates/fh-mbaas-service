var express = require('express');
var fhmbaasMiddleware = require('fh-mbaas-middleware');
var middleware = require('../middleware/mbaasApp.js');

var router = new express.Router({
  mergeParams: true
});

//All Of The Routes Required For Forms Operations For Each Mbaas Environmnet
router.use('/:domain/:environment/appforms', require('./forms.js'));


router.get('/apps/:domain/:environment/:appname/env', fhmbaasMiddleware.app.findMbaasApp, middleware.modelsInfo, function(req, res){
  return res.json(req.resultData);
});

//This route stores deployment information to fhmbaas
router.post('/apps/:domain/:environment/:appname/deploy', fhmbaasMiddleware.app.findOrCreateMbaasApp, fhmbaasMiddleware.app.updateMbaasApp, function(req, res){
  //Finished and no errors.
  res.json(req.appMbaasModel.toJSON());
});


/**
 * Error Handler For Admin API Requests
 *
 */

router.use(function(err, req, res, next){ // jshint unused:false
  return next(err,req,res);
});

//
// Events, Alerts and Notifications for MBaaS
//
router.get("/:domain/:env/apps/:guid/events", fhmbaasMiddleware.events.list, end);
router.post("/:domain/:env/apps/:guid/events", fhmbaasMiddleware.events.create, end);
router.get('/:domain/:env/apps/:guid/alerts', fhmbaasMiddleware.alerts.list, end);
router.post('/:domain/:env/apps/:guid/alerts', fhmbaasMiddleware.alerts.create, end);
router.put('/:domain/:env/apps/:guid/alerts/:id', fhmbaasMiddleware.alerts.update, end);
router["delete"]('/:domain/:env/apps/:guid/alerts/:id', fhmbaasMiddleware.alerts.del, end);
router.get('/:domain/:env/apps/:guid/notifications', fhmbaasMiddleware.notifications.list, end);

function end(req,res){
  return res.json(req.resultData);
}

module.exports = router;
