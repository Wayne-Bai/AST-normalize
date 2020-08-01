define([
  "backbone",
  "models/label",
  "models/session"
], function(Backbone, labelModel, session) {

  session = session.getSession();

  var Labellist = Backbone.Collection.extend({
    model: labelModel,
    url: session.getBaseUrl() + "/api/labels"
  });

  Labellist.getIds = function(labels) {
    return _.filter(labels, function(val) {
      return val !== "";
    }).map(function(val) {
      return (val.id) ? +val.id : +val;
    });
  };

  Labellist.getAdded = function(oldlabels, newlabels) {
    return _.filter(newlabels, function(val) {
      return oldlabels.indexOf(val) < 0;
    });
  };

  /**
   * Gets labels deleted from old list
   * @param {Array} oldlabels array of integers
   * @param {Array} newlabels array of integers
   */

  Labellist.getDeleted = function(oldlabels, newlabels) {
    return _.filter(oldlabels, function(val) {
      return newlabels.indexOf(val) < 0;
    });
  };

  return Labellist;
});
