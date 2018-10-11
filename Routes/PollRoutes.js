var express = require('express');

var routes = function(controller){
  let controllerMap = require('../Common/ControllerMap');

  var PollController = require('../Controllers/PollController');
  var controller = new PollController();
  //console.log("registerController PollController")
  controllerMap.registerController(controllerMap.getPollControllerId(), controller);

  var router = express.Router();

  router.post('/createQuestion',controller.createQuestion)
  router.get('/getQuestion',controller.getQuestion)
  router.post('/updateQuestion',controller.updateQuestion)
  router.get('/getQuestionOfStatus',controller.getQuestionOfStatus)

  return router;
};

module.exports = routes;
