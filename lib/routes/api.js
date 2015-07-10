var express = require('express');
var fhmbaasMiddleware = require('fh-mbaas-middleware');
var middleware = require('../middleware/mbaasApp.js');
var util = require('util');

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


module.exports = router;
