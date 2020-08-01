 /**
  * @namespace nitch.modal
  * @class 
  * @description Creates a simple modal
  * 
  * @example var optionScreen = new nitch.modal("#settings");
  * @param {String} object The object to be tested.
  * @param {Object} [opts]
  * @param {String} [opts.ariaProp="polite"] Sets the WAI-ARIA aria-live attribute 
  * @param {String} [opts.ariaRole="dialog"] Sets the WAI-ARIA role attribute 
  * @param {Boolean} [opts.maskClose=true] Allows user to close modal but clicking the mask
   * @see <a href="examples/modal.html">Simple example</a>
 **/
nitch.modal = function(elem, opts) {

	var defaults = {
		ariaProp: "polite",
		ariaRole: "dialog",
		maskClose: true
	};
	
	this.visiblity = "hidden";
	var options = nitch.util.apply(defaults, opts);
	this.mask = nitch.dom("#nitch-modal-backdrop");
	this.elem =  nitch.dom(elem);
	
	if(!elem || this.elem.nodeList.length === 0) { throw TypeError("No element supplied or found"); }
	
// Check if we already have a mask set up
	if (!this.mask.nodeList[0]) { 
		nitch.dom("body").append('<div id="nitch-modal-backdrop"></div>');
		this.mask = nitch.dom("#nitch-modal-backdrop");
	}
	
	if (options.maskClose) {
		var that = this;
		nitch.dom('#nitch-modal-backdrop').on('click',function(e) {
			that.hide();
		});
	}
	
	this.elem.attr("aria-live", options.ariaProp).attr("role", options.ariaRole);

/**
 * @namespace nitch.modal.show
 * @method 
 * @description Shows the modal
**/
	nitch.modal.prototype.show = function() {
/**
 * @name nitch.modal.show#event:show
 * @event
 * @description Fired when the modal is about to appear on the screen.
**/
		this.elem.fire("show");
		if(this.mask.getStyle("display") == "none") {
			this.mask.css("display:block");
		}
		
		this.elem.css("display:block");
		
/**
 * @name nitch.modal.show#event:shown
 * @event
 * @description Fired when the modal has appeared on the screen.
**/
		this.elem.fire("shown");
		this.visiblity = "shown";
	},
	
/**
 * @namespace nitch.modal.hide
 * @method 
 * @description Hides the modal
**/
	nitch.modal.prototype.hide = function() {
/**
 * @name nitch.modal.show#event:hide
 * @event
 * @description Fired when the modal is about to be hidden from the screen.
**/
		this.elem.fire("hide");
		this.mask.css("display:none");
		this.elem.css("display:none");
		
/**
 * @name nitch.modal.show#event:hidden
 * @event
 * @description Fired when the modal is hidden on the screen.
**/
		this.elem.fire("hidden");
		this.visiblity = "hidden";
	},
	
/**
 * @namespace nitch.modal.toggle
 * @method 
 * @description Toggles the modal from hidden to shown
**/
	nitch.modal.prototype.toggle = function() {
		if(this.elem.getStyle("display") == "block") {
			this.hide();
		} else {
			this.show();
		}
	};
};