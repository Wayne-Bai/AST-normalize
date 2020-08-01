/**
 * class Spah.DOM.Errors
 *
 * A containing namespace for all exceptions generated within the Spah.DOM library.
 **/
Spah.DOM.Errors = {};

/**
 * class Spah.DOM.Errors.InvalidModifierError
 *
 * Generally raised when registering a document modifier that does not conform to the correct interface.
 **/
Spah.DOM.Errors.InvalidModifierError = function(message) { this.name = "InvalidModifierError"; this.message = (message || ""); };
Spah.DOM.Errors.InvalidModifierError.prototype = Error.prototype;