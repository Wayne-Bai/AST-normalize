
require([
  "cerebral/application/core",
  "cerebral/application/mediator",
  "cerebral/application/sandbox/factory"
], 
function( core, mediator, sandboxfactory ) {
  
  var moduleRoot = 'test/specs/cerebral/application/testmodules/'

  core.configure({
    moduleRoot: moduleRoot
  })
  
  describe("cerebral/application/core", function() {

  })

})