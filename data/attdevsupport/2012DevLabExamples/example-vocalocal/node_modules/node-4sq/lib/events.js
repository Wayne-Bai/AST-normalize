/**
 * A module for retrieving information about Events from Foursquare.
 * @param {Object} config A valid configuration.
 * @module node-foursquare/Events
 */
module.exports = function(config) {
  var core = require("./core")(config),
    path = require("path"),
    log4js = require("log4js");

  log4js.configure(config.log4js);
  var logger = log4js.getLogger("node-foursquare.Events");

  /**
   * Retrieve an event from Foursquare.
   * @memberof module:node-foursquare/Events
   * @param {String} eventId The id of the Event to retrieve.
   * @param {String} accessToken The access token provided by Foursquare for the current user.
   * @param {Function} callback The function to call with results, function({Error} error, {Object} results).
   * @see https://developer.foursquare.com/docs/photos/photos.html
   */
  function getEvent(eventId, accessToken, callback) {
    logger.debug("ENTERING: Events.getEvent");

    if(!eventId) {
      logger.error("getEvent: eventId is required.");
      callback(new Error("Events.getEvent: eventId is required."));
      return;
    }
    
    core.callApi(path.join("/events", eventId), accessToken, null, callback);
  }

  /**
   * Search for events.
   * @memberof module:node-foursquare/Events
   * @param {Object} [params] An object containing additional parameters. Refer to Foursquare documentation for details
   * on currently supported parameters.
   * @param {String} [accessToken] The access token provided by Foursquare for the current user.
   * @param {Function} callback The function to call with results, function({Error} error, {Object} results).
   * @see https://developer.foursquare.com/docs/events/search.html
   */
  function search(params, accessToken, callback) {
    logger.debug("ENTERING: Events.getTip");
    core.callApi("/events/search", accessToken, params || {}, callback);
  }

  /**
   * Retrieve event categories from Foursquare.
   * @memberof module:node-foursquare/Events
   * @param {Object} [params] An object containing additional parameters. Refer to Foursquare documentation for details
   * on currently supported parameters.
   * @param {String} [accessToken] The access token provided by Foursquare for the current user.
   * @param {Function} callback The function to call with results, function({Error} error, {Object} results).
   * @see https://developer.foursquare.com/docs/events/categories.html
   */
  function getCategories(params, accessToken, callback) {
    logger.debug("ENTERING: Events.getCategories");
    core.callApi("/events/categories", accessToken, params || {}, callback);
  }


  return {
    "getEvent" : getEvent,
    "search" : search,
    "getCategories" : getCategories
  }
};
