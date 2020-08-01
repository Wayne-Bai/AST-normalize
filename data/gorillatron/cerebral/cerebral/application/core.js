
/**
  The core module, responsible for mediating between modules using the publish-subscribe pattern.
  This should not be directly exposed to the submodules of the application, rather expose methods like publish and
  subscribe through a facade. Google facade pattern.
  @exports core
  @requires [underscore]
*/
define(
"cerebral/application/core",[
  "underscore",
  "jquery",
  "cerebral/application/mediator",
  "cerebral/application/classes/Module",
  "cerebral/application/sandbox/factory"
], 
function( _, $, mediator, Module, sandboxfactory ){
  
  var core, modules, startDefaultOptions

  core = { }

  /**
    Get the the channels. Meant for testing and debugging only.
    @public
    @type Function
    @returns {Object} channels
  */
  core.__getChannels = function() {
    return channels
  }

  /**
    Holds all loaded modules
    @private
    @type Object
  */
  modules = {}

  /**
    Get the the modules. Meant for testing and debugging only.
    @public
    @type Function
    @returns {Object} channels
  */
  core.__getModules = function() {
    return modules
  }

  /**
    The configuration of the core.
    @public
    @type Object
  */
  core.configuration = {
    moduleRoot: '/'
  }

  /**
    Configure the core,
    @public
    @type Function
    @param {Object} configuration The configuration object to extend the cores configuration with
    @returns {cerebral/core} core
  */
  core.configure = function( configuration ) {
    _.extend( this.configuration, configuration )
    return core
  }

  /**
    Require a module from the moduleRoot namespace, will automagicaly look for the main.js within the modulename folder.
    @public
    @type Function
    @param {String} modulename The name of the namespace/folder that contains the module
    @param {Function} callback The continuation to call when either an error os produced or the module is found.
    @returns {cerebral/core} core
  */
  core.loadModule = function( options, callback ) {
    var module, sandboxAttributes, sandbox
    
    module = new Module({
      root: this.configuration.moduleRoot,
      name: options.name
    })

    modules[ module.name ] = module
    
    if( options.sandbox ) {
      if( sandboxfactory.isSandbox(options.sandbox) ) {
        sandbox = options.sandbox
      } else {
        sandbox = sandboxfactory.create( options.sandbox )
      }
    } else {
      sandbox = sandboxfactory.create({ })
    }

    if( options && options.sandbox && options.sandbox.element )
      module.element = options.sandbox.element

    module.sandbox = sandbox

    define(
      module.sandboxPath,[
      ],
      sandbox
    )

    require([ module.mainPath ], 
      function( definition ) {

        try {
          module.loadDefinition( definition )
        } catch( exception ) {
          return callback( exception )
        }

        callback( null, module )  
        
      },
      function( error ) {
        
        core.unloadModule( module.name )
        callback( error )
        
      })
    return core
  }

  /**
    Check if a module is loaded and started
    @public
    @type Function
    @param {String} modulename The name of the namespace/folder that contains the module
    @returns Boolean
  */
  core.modulesIsLoaded = function( modulename ) {
    return ( modulename in modules )
  }
  

  /**
    Unload a module, undefining it in the amd loader and propegating down to all dependecies within the same module namespace.
    @public
    @type Function
    @param {String} modulename The name of the namespace/folder that contains the module
    @returns {cerebral/core} core
  */
  core.unloadModule = function( modulename ) {
    var definedModules, name, module
    
    definedModules = require.s.contexts._.defined

    module = modules[ modulename ]

    if( module ) {

      if( require.defined(module.sandboxPath) ) {
        require.undef( module.sandboxPath )
      }

      for( name in definedModules ) {
        if( definedModules.hasOwnProperty(name) && name.indexOf(module.name) !== -1 ) {

          require.undef( name )

        }
      }  

      module.cleanupDOM()

      delete modules[ modulename ]
    }
    
    return core
  }

  /**
    Default options for core.start
    @private
    @type Object
  */
  startDefaultOptions = {
    onDomReady: true
  }

  /**
    Load and start a module by running the returned main function with a new sandbox object.
    @public
    @type Function
    @param {String} modulename The name of the namespace/folder that contains the module
    @param {Object} options Options for the module and sandbox
    @param options.onDomReady If the module should wait for DOM to be ready before executing the modules main function
    @param options.sandbox The sandbox or an object of attrubutes to set on the sandbox for the module to start
    @param. options.sandbox.element The element to restrict dom access to
    @returns {cerebral/core} core
  */
  core.start = function( modulename, options ) {
    if( core.modulesIsLoaded(modulename) ) {
      return core
    }
      
    options = _.extend( startDefaultOptions, options )

    core.loadModule({
      name: modulename,
      sandbox: options.sandbox
    }, 
    function( err, module ) {

      if( err ) {
        throw err
      }

      try {

        if( options.onDomReady ) {
          $( document ).ready(function() {
            module.main()
          })
        } else {
          module.main()
        }

      } catch( exception ) { 
        console.log( "module: " + modulename + " main method threw expection: " )
      }
    })  
  
    return core
  }

  /**
    Stops a running module.
    @public
    @type Function
    @param {String} modulename The name of the namespace/folder that contains the module
    @returns {cerebral/core} core
  */
  core.stop = function( modulename ) {
    var module

    if( !core.modulesIsLoaded(modulename) )
      return core

    module = modules[ modulename ]

    mediator.unsubscribe( null ,null, module.sandbox )
    
    module.destruct(function() {
      core.unloadModule( modulename )
    })

    return core
  }

  return core
})