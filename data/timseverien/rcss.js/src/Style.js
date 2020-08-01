/**
 * A CSS style object
 * @param {String} [media] A valid CSS media query
 */
RCSS.Style = function(media) {
	RCSS.BlockContainer.call(this);
	
	this.element = document.createElement('style');
	this.element.type = 'text/css';
	
	if(media) this.element.setAttribute('media', media);
};

RCSS.Style.prototype = Object.create(RCSS.BlockContainer.prototype);

/**
 * Clear all styles
 */
RCSS.Style.prototype.clear = function() {
	this.blocks.length = 0;
};


/**
 * Injects the style element to DOM
 */
RCSS.Style.prototype.inject = function() {
	if(!this.element.parentNode) {
		document.body.appendChild(this.element);
	}
	
	this.element.innerHTML = this.toString();
};

/**
 * Enables the style element
 */
RCSS.Style.prototype.enable = function() {
	this.element.disabled = false;
};

/**
 * Disables the style element
 */
RCSS.Style.prototype.disable = function() {
	this.element.disabled = true;
};

/**
 * Removes the style element
 */
RCSS.Style.prototype.destroy = function() {
	if(this.element.parentNode) {
		document.body.removeChild(this.element);
	}
};