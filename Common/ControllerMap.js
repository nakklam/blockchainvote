var controllerMap = function(){
  var mapData = {};

  this.registerController = function(id, controllerInstance){
    mapData[id] = controllerInstance;
    //console.log("controllerMap=>",mapData);
  }

  this.getController = function(id){
    //console.log("getController id=>",id ," ", mapData);
    return mapData[id];
  }

  this.getPollControllerId = function(){
    return 'POLL_CTRL';
  }

  this.getVoteControllerId = function(){
    return 'VOTE_CTRL';
  }

  this.getUserAccountControllerId = function(){
    return 'USER_CTRL';
  }
}

/*************************************************************************
 SINGLETON CLASS DEFINITION
 **************************************************************************/
controllerMap.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
controllerMap.getInstance = function(){
  if(this.instance === null){
    this.instance = new controllerMap();
  }
  return this.instance;
}

module.exports = controllerMap.getInstance();
