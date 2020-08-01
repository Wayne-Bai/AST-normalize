$.ui.widget.subclass("ui.uicomponent", {
	options: {
		/**
		 * data property is initialized with an empty object <code>{
		 }</code>. 
		 */
		data: {},

		/**
		 * @deprecated turning false by default, from now on pls use the options.elements object for caching elements.
		 * if <code>getChildren</code> is set to true, the widget upon creation will add all the elements with an 
		 * <code>id</code> attribute set to the <code>elements</code> collection for later access.
		 */
		getChildren: false,

		/**
		 * if <code>renderHtmlTemplate</code> set to true, the widget upon creation will try to render into its 
		 * self any content provided on the <code>htmlTemplate</code> option.
		 */
		renderHtmlTemplate: false,

		/**
		 * Content to be rendered into the widget's <code>this.element</code> element.
		 */
		htmlTemplate: ""
		
	},

	/**
	 * The <code>_helpers</code> property is an array that intended to hold instances of any object you
	 * wish to append (extend) in to the widget's structure.
	 * 
	 * This is similar to using an 'include' statement as in other languages. the intention of a helper is to 
	 * share common methods that do not necessarily need to be part of a widget to be used in subclassing.
	 * 
	 * Use case:
	 * 
	 * Take for example some validation methods, you may want to validate if form element is valid. for this
	 * you have many ways to implement your method into the widget. 
	 * 
	 *  - One would be declaring a global validation method and just execute it where ever you want, but 
	 *  this is ugly :).
	 *  
	 *   - Another way would be to have a base widget that has all of your validation routines and you would
	 *   have to sublclass that widget to access them.
	 *   
	 *   - <b>helpers</b> intend to make your life easier, you may declare an object with the validation
	 *   methods and then add them as includes to your class, this way you can at any point add validation 
	 *   features to any object without the need of subclassing, and keeping your code encapsulated. 
	 *   
	 *   Example:
	 *   
	 *   Say you want to check if a text input is more than 4 chars long, so, in a separete file 
	 *   (eg. form.validation.js) you create your helper:
	 *   
	 *    <code>
	 *    var FormValidation = {
	 *          validateLengh: function (value)	{
	 *            return value.length > 5;
	 *	}
	 *	}
	 *    </code>
	 *    
	 *    then on your widget declaration you do:
	 *    
	 *    <code>
	 *    _helpers[FormValidation]
	 *    </code>
	 *   
	 *   now you are ready to use your helpers! inside your widget you may do:
	 *   
	 *   <code>
	 *   submitform: function ()	{
	 *        if (this.validateLengh($('input #name').val())	{
	 *           // execute ajax!
	 *	}
	 *	}
	 *   </code>
	 *   
	 */
	_helpers: [],

	/**
	 * The idea of having this collection is so we can easily access any element inside the widget. Elements
	 * need to have their <code>id</code> attribute set in order to be present on the collection.  for more
	 * explanation on how you may access check the <code>_getChildren()</code> method.
	 */
	elements: {},

	/**
	 * States can provide a way to describe the different states of your components. each state is declared 
	 * as a javascript function where you can alter the way your component behaves or looks.
	 * 
	 * The <code>states</code> object is a simple object used to define states of the widget. You may 
	 * change from state to state with the <code>currentState</code> method. 
	 * 
	 * When ever a state is changed, some events will be triggered in the following order: 
	 * <code>
	 * StateEvents.EXITSTATE
	 * StateEvents.ENTERSTATE
	 * -- new state is executed
	 * StateEvents.ENDSTATE
	 * </code>
	 * 
	 * To declare a new state you can simply add a new method to the <code>states</code> object as 
	 * shown here:
	 * <code>
	 * states: {
	 *     searchView: function() { 
	 *         // clean form elements
	 *         // if there are results from a previous operation, fade them
	 *	},
	 *     resultView:function()	{
	 *         // clean previous results
	 *         // show new results, change opacity of results area
	 *	}
	 *	},
	 * </code>
	 * 
	 * States as any other object in the widget will get merged or overwritten (if declared in parent widget) 
	 * when subclassed. 
	 * 
	 */
	states: {
		_enterState: null,
		_exitState: null
	},

	/**
	 * this object is an object that will hold local properties to be used in your widget, they shoudl be 
	 * delcared as key:value pairs. 
	 * each property that is declared will generate a corresponding method which will be/can be treated as
	 * a getter/setter method. 
	 * For example: if we declare the follwoing:
	 * <code>
	 * _properties: { 
	 *    canDance:true
	 * },
	 * </code>
	 * 
	 * A method will be created for that property with the same name, which you may execute as follows:
	 * 
	 * <code>
	 * _init: function (){ 
	 *    console.log(this.canDance()); // will output 'true'
	 *    this.canDance(false); // will set the value of false to this._properties.canDance
	 *    console.log(this.canDance()); // will output 'false'
	 * },
	 * </code>
	 * 
	 * Every time the 'canDance' is executed as a setter this will happen:
	 * 1. the this._properties.canDanceChanged preoprty will get changed to true;
	 * 2. the this._invalidateProeprties() method will get executed
	 * 
	 * If you wish to catch the propery change, you may use the _commitProperties method as follows:
	 * <code>
	 * _commitProperties: function () {
	 *	if(this._properties.canDanceChanged) {
	 *		// do something
	 *       this._properties.canDanceChanged = false; // reset flag
	 *	}
	 * },
	 * </code>
	 * 
	 * 
	 * 
	 */
	_properties: {
		__currentState: null
	},

	/**
	 * if any helper is defined it will add it to the base class of the widget.
	 * when executed, it will run depending on the widget's configuration the methods:
	 * <code>_renderHtmlTemplate()</code>
	 * <code>_getChildren()</code>
	 */
	_create: function() {
		if (this._helpers != null) {
			for (var h = 0; h < this._helpers.length; h++) {
				$.extend(this, this._helpers[h]);
			}
		}

		this.__createProperties();

		if (this.options.renderHtmlTemplate == true) {
			this._renderHtmlTemplate();
		}

		this._elements = $.extend({},
		this._elements);
		if (this.options.getChildren == true) {
			this._getChildren();
		}

		this.__bindEvents();
		this.__cacheElements();
	},

	__createProperties: function() {
		this._properties = $.extend({},
		this._properties);
		var propertyDefinitions = [];

		for (var propertyName in this._properties) {
			if (this._properties.hasOwnProperty(propertyName) && propertyName.indexOf("__") != 0) {
				propertyDefinitions.push({
					key: propertyName,
					value: this._properties[propertyName]
				});
			}
		}
		for (var i = 0; i < propertyDefinitions.length; i++) {
			var propertyDefinition = propertyDefinitions[i];
			this[propertyDefinition.key] = this.__createProperty(propertyDefinition);
		}
	},

	/**
	 * Generates the getters and setters for the proeprties defined inside the _properties object.
	 */
	__createProperty: function(propertyDefinition) {

		this._properties[propertyDefinition.key + "Changed"] = false;

		return function() {
			if (arguments.length == 0) {
				return this._properties[propertyDefinition.key];
			} else {
				this._properties[propertyDefinition.key + "Changed"] = true;
				this._properties[propertyDefinition.key] = arguments[0];
				this.invalidateProperties();
				return true;
			}
		};

	},

	/**
	 * Searches for all the children elements that have a specified <code>id</code> attribute and adds 
	 * them to the <code>this.element</code> widget property. 
	 * 
	 * Use: if inside the the widget we have something declared such as:
	 * <code><span id='mySpan' >Hello</span></code>
	 * Once this method runs, we will be able to access it via:
	 * <code>this.elements.mySpan</code>  
	 */
	_getChildren: function() {
		var collection = [];
		$('[id]', this.element).each(function() {
			if ($(this).attr('id') != null) {
				collection.push({
					id: $(this).attr('id'),
					instance: $(this)
				});
			}
		});
		this.elements = {};
		for (var index=0; index<collection.length; index++) {
			var o = collection[index];
			this.elements[o.id] = o.instance;
		}
	},

	/**
	* Binds predefined events to the widget following the syntax: 
	* "<selector>::<event>" : "<name of function>" || function
	* 
	* Note: the scope of the event hanlder is the widget itself. 
	* 
	* Implementation:
	* <code>
	*  options: {
	*  	events: {
	*  		"button.cancel::click" : "cancel_clickHandler"
	*  	}
	*  }
	*  
	*  cancel_clickHandler: function (e) { 
	*  	//TODO: implement
	*  }
	* 
	* </code>
	**/
	__bindEvents: function(){
		if(this.options.hasOwnProperty("events")) {
			for(var event in this.options.events) {
				var eventData = event.split("::");
				if(eventData.length==2) {
					var handler;
					if(typeof this.options.events[event] === "function") {
						handler = this.options.events[event];
					} else {
						handler = this[this.options.events[event]];
					}
					this.element.find(eventData[0]).bind(eventData[1], $.proxy(handler, this));
				}
			}
		}
	},
	
	/**
	* Cache elements using the following sintax: 
	* "<elementIdentifier>" : "<selector>" || function || jQuery Object
	* 
	* Important note: the scope of the event hanlder is the widget's this.element. 
	* 
	* Implementation:
	* <code>
	*  options: {
	*  	elements: {
	*  		"message" : "form textarea.message",
	*  		"formInputs" : $("form input"),
	*  		"fromChildren" : function () { 
	*  			// just for demostrating functionality (its dumb to do this)
	*  			return $("form").children();
	*  		}
	*  	}
	*  }
	*  
	*  _init: function (e) { 
	*  	// << points to the selector "form textarea.message"
	*  	this.elements.message.val("sample text");
	*  }
	* 
	* </code>
	**/
	__cacheElements: function() {
	    this.elements = {};
		if (this.options.hasOwnProperty("elements")) {
			for (var elementId in this.options.elements) {
				var element = null;
				var selector = this.options.elements[elementId];
				if (typeof selector === "function") {
					element = $.proxy(selector, this)();
				} else if (typeof selector === "string") {
					element = this.element.find(selector);
				} else if (typeof selector === "object") {
					element = selector;
				}
				this.elements[elementId] = element;
			}
		}
	},

	_renderHtmlTemplate: function(selector) {
		if (this.options.htmlTemplate == null || this.options.htmlTemplate == "") {
			return;
		}
		$(object).trigger(UIComponentEvents.STARTRENDERING);
		var object = this.element;
		if (selector != null) {
			if (typeof(selector) !== "string") {
				object = selector;
			} else {
				object = $(selector);
			}
		}
		object.html(this.options.htmlTemplate);
		$(object).trigger(UIComponentEvents.FINISHRENDERING);
	},

	addElement: function(id, selector, appendTo) {
		if(typeof appendTo == "undefined") appendTo = this.element;
		var child = $(selector)
		if(appendTo != false) {
			child.appendTo(appendTo);
		}
		try {
			if(!this.elements.hasOwnProperty(id)) {
				this.elements[id] = child;
			} else {
				throw "[" + id + "] Element already exists";
			}	
		}	catch(e) {
			console.log(e);
		}
		return child;
	},

	currentState: function(state) {
		if (arguments.length == 0) return this._properties.__currentState;
		var previousStep = this._properties.__currentState;
		var states = state.split(' ');
		var args = new Array();
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		this.__executePredefinedSatates(state);

		if (this.states != null) {
			this._properties.__currentState = states[states.length - 1];
			if (this.states._exitState != null) {
				this.states._exitState.apply(this, [state]);
			} else {
				$(this.element).trigger("exitstate");
			}
			if (this.states._enterState != null) this.states._enterState.apply(this, [state]);
			else $(this.element).trigger("enterstate");
			for (var index = 0; index < states.length; index++) {
				var iteratedState = states[index];

				if (previousStep == null) {
					previousStep = "";
				} else {
					this.element.removeClass("state-" + previousStep);
				}
				this.element.addClass("state-" + iteratedState);

				args.splice(0, 0, previousStep);
				this.states[iteratedState].apply(this, args);
				previousStep = iteratedState;
				args.splice(0, 1);
			}
			if (this.states._endState != null) this.states._endState.apply(this, [state]);
			else $(this.element).trigger("endstate");
		}
		return false;
	},

	__executePredefinedSatates: function(state) {
		var attr = "data-state-" + state;
		var modifiers;
		var tokens;
		$("[" + attr + "]", this.element).each(function() {
			modifiers = $(this).attr(attr);
			if (modifiers != null) {
				tokens = $.parseJSON(modifiers);
				if (tokens != null) {
					for (var method in tokens) {
						if (tokens.hasOwnProperty(method)) $(this)[method](tokens[method]);
					}
				}
			}
		});
	},

	// method to be overriden, it will get executed when ever an invalidateProperties is executed
	_commitProperties: function() {

	},

	// method NOT to be overriden, it is used to invalidate a property when a setter is executed
	invalidateProperties: function() {
		this._commitProperties();
	},

	_updateView: function() {},

	invalidateView: function() {
		this._updateView();
	},

	// ------------------------------------------------------------------------------
	destroy: function() {
		if (this._properties.__currentState != null) {
			this.element.removeClass("state-" + this._properties.__currentState);
		}

		for (var element in this.elements) {
			if (this.elements.hasOwnProperty(element)) {
				this.elements[element].remove();
			}
		}
		$.Widget.prototype.destroy.apply(this, arguments);
	}
});
