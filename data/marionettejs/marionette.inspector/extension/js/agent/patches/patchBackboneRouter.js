;(function(Agent){

  Agent.patchBackboneRouter = function(BackboneRouter) {
    debug.log('Backbone.Router detected');

    Agent.patchBackboneComponent(BackboneRouter, function(router) {
      var routerIndex = Agent.registerAppComponent('Router', router);
      Agent.patchAppComponentTrigger(router);
    });
  };

}(Agent));


