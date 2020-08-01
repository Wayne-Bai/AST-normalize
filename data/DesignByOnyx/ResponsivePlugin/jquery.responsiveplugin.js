(function($) {
	var registrarName = "responsivePlugin",
		cloneName = registrarName + '_clone',
		origOn = $.fn.on,
		eventRef = {},
		currentNamespace = "",

		// Some reusable variables to help reduce memory usage
		config,
		instance,
		$clone,
		$this,
		$newSelf;

	function tmpOn( types, selector, data, fn, one ) {
		// Types can be a map of types/handlers - code borrowed from core jQuery.on
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		// Add custom namespace and call original on()
		types = types.replace(" ", "." + currentNamespace + " ") + "." + currentNamespace;

		// Store a reference to this bound event
		if( !eventRef[ currentNamespace ] ) {
			eventRef[ currentNamespace ] = [];
		}
		eventRef[ currentNamespace ].push( this );
		//console.log( 'Event registered in namespace "' + currentNamespace + '": ' + types );

		origOn.call(this, types, selector, data, fn, one);

		return this;
	}

	function saveClone() {
		$this = $(this);
		$this.data( cloneName, $this.clone(true) );
	}

	function replaceWithClone() {
		$this = $(this);
		$clone = $this.data( cloneName );

		if( $clone ) {
			// We always work with a clone of the original clean clone
			// We need to put a copy of the clean clone onto every new clone
			$clone.data( cloneName, $clone.clone(true) );

			// Replace the doc fragment with the clean clone
			$this.replaceWith( $clone );
			// The clone will replace "this"
			$newSelf = $newSelf.add( $clone );
		}
	}

	$.fn[ registrarName ] = function( options ) {
		// Silent exit if minimum requirement are not met
		if( !options || !options.pluginName || !options.breakpointOptions || $.isEmptyObject(options.breakpointOptions) ) {
			return this;
		}

		// Error exit if enquire does not exist
		if (!enquire ) {
			throw new Error("enquire.js is required to use the responsive plugin registrar - http://wicky.nillia.ms/enquire.js/");
			return this;
		}

		// Initial stuff here
		// Keep some locally scoped references and shortcuts
		var self = this,
			localNamespace = registrarName + Math.round(Math.random() * 100000000),
			settings = $.extend( {}, $.fn[ registrarName ].defaults, options ),
			pluginName = settings.pluginName,
			breakpointOptions = settings.breakpointOptions,
			destroyMethodName = settings.destroyMethodName;

		//console.log('=============================== ' + localNamespace + ' =============================');

		// Error exit when trying to instantiate non-existent plugin
		if( !$.fn[ pluginName ] ) {
			throw new Error("The '" + pluginName + "' plugin does not exist.");
			return this;
		}

		// Store the original document fragment for restoration later on
		self.each( saveClone );

		// register all breakpoints with enquire
		for( var breakpoint in breakpointOptions ) {
			// We need to create a closure so that breakpoint keeps it's state
			(function(breakpoint) {

				enquire.register(breakpoint, {
					match: function() {
						//console.log('responsive plugin "' + pluginName + '" matched breakpoint: ' + breakpoint);
						config = breakpointOptions[ breakpoint ];

						// Update the current name space to be used by private methods
						currentNamespace = localNamespace;

						if(typeof config.callbackBefore === 'function' ) {
							config.callbackBefore.call( self );
						}

						// Attempt to call the plugin's destroy method
						if( typeof destroyMethodName === "string" ) {
							// TODO: see if we need to use each()
							instance = self.data( pluginName );

							if( instance && instance[ destroyMethodName ] ) {
								// Try to call the destroy method on the instance (royalSlider style)
								instance[ destroyMethodName ]();
								self.removeData( pluginName );
							}

							// Pass the destroyMethodName to the plugin (jQuery UI style)
							// This should gracefully fail if the plugin author didn't account for it
							self[ pluginName ]( destroyMethodName );
						}

						if( typeof destroyMethodName === "function" ) {
							destroyMethodName.call( self );
						}

						// Unbind all events - always do this just in case destroy forgot something
						if( eventRef[ currentNamespace ] ) {
							for( var i = 0, len = eventRef[ currentNamespace ].length; i < len; i++ ) {
								// console.log('Unbinding event in namespace: ' + currentNamespace);
								// console.log(eventRef[ currentNamespace ][ i ]);
								eventRef[ currentNamespace ][ i ].off('.' + currentNamespace);
							}

							eventRef[ currentNamespace ] = [];
						}

						if(typeof config.restoreDOM === 'undefined' || config.restoreDOM !== false) {
							// console.log('RESTORING ORIGINAL DOM');
							$newSelf = $([]);
							self.each( replaceWithClone );
							self = $newSelf;
						}

						//self.addClass('duplicated' + pluginName);

						if( config === "destroy" || (typeof config.options !== 'undefined' && config.options === 'destroy') ) {
							// do nothing
						} else if( config === "hide" || (typeof config.options !== 'undefined' && config.options === 'hide') ) {
							// Hide the document fragment
							self.hide();
						} else {
							// temporarily hijack jQuery event binding so we can keep track of all registered plugin events
							$.fn.on = tmpOn;

							// console.log('instantiating plugin "' + pluginName + '" with (' + (typeof config.options) + ') options: ');
							// console.log( config.options );

							// Instantiate the plugin
							self[ pluginName ]( config.options );

							// restore jQuery's original event binding
							$.fn.on = origOn;
						}

						if(typeof config.callbackAfter === 'function' ) {
							config.callbackAfter.call( self );
						}
					}
				});

			})(breakpoint);
		}

		// Go ahead and fire enquire
		if (enquire.fire) enquire.fire();

		return self;
	};

	$.fn[ registrarName ].defaults = {
		pluginName: "",
		breakpointOptions: {},
		destroyMethodName: "destroy"
	};
}(jQuery));
