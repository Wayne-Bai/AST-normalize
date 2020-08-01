
/**
  @class ViewCollection for managing subviews for a view
  @extends Backbone.Events
  @requires [underscore, cerebral/lib/Backbone]
  @exports ViewCollection
*/
define(
"cerebral/mvc/ViewCollection",[
  "underscore",
  "cerebral/lib/Backbone"
], 
function( _, Backbone ) {
  
  /**
    Creates a new ViewCollection
    @public
    @constructor
    @property {Array} views Internal array of all the views attached
    @property {Number} length The number of attached subviews
  */
  function ViewCollection( options ) {
    this.views = {}
    this.length = 0
  }

  _.extend( ViewCollection.prototype, Backbone.Events )

  /**
    Implement underscore collection methods on ViewCollection.prototype, using subviews as list parameter
    and the rest(splat) as arguments to the method call.
    @public
    @type Function
    @borrows underscore[methodname] as this[methodname]
  */
  _.each([
    "each","map","reduce","reduceRight","find",
    "filter","reject","all","any","include",
    "invoke","pluck","max","min","sortBy",
    "groupBy","sortedIndex","shuffle","toArray","size"
  ], function( methodName ) {

    ViewCollection.prototype[ methodName ] = function() {
      var args

      args = [ this.views ].concat( [].slice.call(arguments, 0) )
      return _[ methodName ].apply( this, args )
    }

  })


  /**
    @private
    @type Function
    @event #attach [name, view]
    @param {String} name The name of the view
    @param {Backbone.View|cerebral/mvc/View} name The view to attach
  */
  function attach( name, subview ) {
    if( typeof name !== 'string' )
      throw new TypeError( 'parameter name not of type "string"' )
    if( !(subview instanceof Backbone.View) )
      throw new TypeError( 'subview parameter not instance of Backbone.View' )
    if( this.views[name] )
      throw new Error( 'subview with that name allready attached' )

    this.views[ name ] = subview
    this.length++
    
    subview.on( "dispose", this.subviewOnDispose, this )
    this.trigger( 'attach', name, subview )
  }

  /**
    Attach a array of views
    @private
    @type Function
    @param {Backbone.View|cerebral/mvc/View[]} array Array of views
  */
  function attachArray( array ) {
    _.each(array, function( subview ) {
      attach.call( this, subview.cid, subview )
    }, this)
  }

  /**
    Attach a object of views, keys are names and values are the views
    @private
    @type Function
    @param {Object} obj Keys ar handles as names for the values wich must be Backbone.View or cerebral view
  */
  function attachObject( obj ) {
    _.each(obj, function( subview, name ) {
      attach.call( this, name, subview )
    }, this)
  }

  /**
    Attach view[s] to the collection, delegates to private functions depending on parameter type
    @public
    @type Function
    @param {Array|Object} subview The subview[s] to attach
  */
  ViewCollection.prototype.attach = function( subviews ) {
    if( _.isArray(subviews) )
      return attachArray.call( this, subviews )
    if( typeof subviews === 'object' )
      return attachObject.call( this, subviews )

    throw new TypeError( 'parameter subviews not of correct type. Accepted: object{name: subview}, subviews, array of subviews' )
  }

  /**
    Detach a view by reference to the view itself
    @private
    @type Function
    @param {Backbone.View|cerebral/mvc/View} instance The view to detach
    @return {Object} detachedView Name and the view itself
  */
  function detachByInstance( instance ) {
    var key, view

    for( key in this.views ) {
      view = this.views[ key ]

      if( view === instance ) {
        delete this.views[ key ]
        return {
          name: key,
          instance: view
        }   
      }
    }
  }

  /**
    Detach a view by its name or cid
    @private
    @type Function
    @param {string} name The name or cid of the view
    @return {Object} detachedView Name and the view itself
  */
  function detachByName( name ) {
    var view

    if( this.views[name] ) {
      view = this.views[ name ]

      delete this.views[ name ]
      return {
        name: name,
        instance: view
      }
    }
  }

  /**
    Detach view[s] from the collection, delegates to private functions depending on parameter type
    @public
    @type Function
    @event #detach [name, view]
    @param {Backbone.View|cerebral/mvc/View} nameOrView The name or view instance to detach
    @param options options for the detachment
    @param options.dispose Should the view allso call dispose on itself
  */
  ViewCollection.prototype.detach = function( nameOrView, opts ) {
    var options, detachedView

    if( typeof nameOrView === 'string' ) {
      detachedView = detachByName.call( this, nameOrView )
    }
    if( typeof nameOrView === 'object' ) {
      detachedView = detachByInstance.call( this, nameOrView )
    }

    if( detachedView ) {

      options = _.extend({
        dispose: false
      }, opts)

      this.length--

      if( detachedView.instance.subviews && detachedView.instance.subviews.length > 0 )
        detachedView.instance.subviews.detachAll( options )
      if( options.dispose )
        detachedView.instance.dispose()
      if( !options.silent )
        this.trigger( 'detach', detachedView.name, detachedView.instance )
    }
  }

  /**
    Detach all view[s] from the collection
    @public
    @type Function
    @param options options for the detachment, ref ViewCollection.prototype.detach
  */
  ViewCollection.prototype.detachAll = function( options ) {
    this.each(function( view, name ) {
      this.detach( name, options )
    }, this)
  }

  /**
    Event handler for view#dispose
    @public
    @event
    @param {Backbone.View|cerebral/mvc/View} view The view that called dispose
  */
  ViewCollection.prototype.subviewOnDispose = function( view ) {
    this.detach( view, {dispose: false} )
  }

  /**
    Get a view stored on a given key
    @public
    @param {String} key The name given when attach was called or the cid of the view
    @return {Backbone.View|cerebral/mvc/View}
  */
  ViewCollection.prototype.get = function( key ) {
    return this.views[ key ]
  }

  /**
    Find views where the selecor parameter is found within the views $el
    @public
    @type Function
    @param {String} selector Selector for the dom node
    @returns {cerebral/mvc/ViewCollection[]}
  */
  ViewCollection.prototype.querySelector = function( selector ) {
    var matchingViews

    matchingViews = []

    this.each(function( view ) {
      var matchedElements
      matchedElements = view.$el.find( selector )
      if( matchedElements && matchedElements.length ) {
        matchingViews.push( view )
      }
    }, this)
    
    return matchingViews
  }

  return ViewCollection
})