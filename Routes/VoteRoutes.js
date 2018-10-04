var express = require('express');

var routes = function(controller){
  let controllerMap = require('../Common/ControllerMap');

  var VoteController = require('../Controllers/VoteController');
  var controller = new VoteController();
  //console.log("registerController PollController")
  controllerMap.registerController(controllerMap.getVoteControllerId(), controller);

  var router = express.Router();

  router.post('/createVote',controller.createVote)
  router.get('/getVote',controller.getVote)

  return router;
};

module.exports = routes;
