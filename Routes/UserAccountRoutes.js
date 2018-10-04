var express = require('express');

var routes = function(controller){
  let controllerMap = require('../Common/ControllerMap');

  var UserAccountController = require('../Controllers/UserAccountController');
  var controller = new UserAccountController();
  //console.log("registerController UserAccountController")
  controllerMap.registerController(controllerMap.getUserAccountControllerId(), controller);

  var router = express.Router();

  router.post('/create',controller.create)
  router.post('/updateByLineID',controller.updateByLineid)
  router.get('/getByCID',controller.getByCid)
  router.get('/getByLindID',controller.getByLindid)

  return router;
};

module.exports = routes;
