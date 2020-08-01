
/**
  @class Module For managing modules
  @extends Backbone.Events
  @exports Module
  @requires [jquery, underscore]
*/
define(
"cerebral/application/classes/Module", [
  "jquery",
  "underscore",
  "cerebral/lib/Backbone"
], 
function( $, _, Backbone ){
  
  /**
    Creates a new Module
    @public
    @constructor
  */
  function Module( attributes ) {
    if( !attributes['name'] ||
        !attributes['root'] ) {
      throw new TypeError( 'Module attributes must contain name and root' )
    }

    attributes = _.extend({}, attributes)

    this.name = attributes[ 'name' ]
    this.root = attributes[ 'root' ]
    this.path = this.root + this.name
    
    this.element = attributes[ 'element' ]
    
    this.mainPath = this.path + "/main"
    this.sandboxPath = this.name + "/sandbox"
  }

  _.extend( Module.prototype, Backbone.Events )

  /**
    Clean up the DOM element of the module
    @public
    @type Function
  */
  Module.prototype.cleanupDOM = function() {
    if( this.element ) {

      $( this.element )
        .find( "*" )
        .andSelf()
        .unbind()
        .empty()

    }
  }

  /**
    Normalize a module definition and extraxt its main if possible destruct functions.
    @public
    @type Function
    @param {Function|Object} definition The definition of the module
  */
  Module.prototype.loadDefinition = function( definition ) {
    if( !definition ) {
      throw new Error( 'The definition did not return' )
    }
    
    if( typeof definition === 'function' ) {
      this.definition = definition
    } else if( typeof definition === 'object' && typeof definition.main === 'function' ) {
      this.definition = definition
    } else {
      throw new TypeError( 'Module must be a main function or Object containing main method' ) 
    }
  }

  /**
    Run the main method of the module definition.
    @public
    @type Function
    @param {Function|Object} definition The definition of the module
  */
  Module.prototype.main = function() {
    if( !this.definition ) {
      return null
    }

    if( typeof this.definition === 'function' ) {
      return this.definition()
    } else if( typeof this.definition === 'object' && typeof this.definition.main === 'function' ) {
      return this.definition.main()
    } 
  }

  /**
    Run the destruct method of the module definition if any.
    @public
    @type Function
  */
  Module.prototype.destruct = function( callback ) {
    if( !this.definition ) {
      return null
    }
    if( typeof this.definition.destruct === 'function' ) {
      this.definition.destruct( callback )
    } else {
      callback()
    }
  }

  return Module
})