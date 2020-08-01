(function(global, _) {

  var Dataset = global.Miso.Dataset;

  /**
   * Miso.Dataset.Events are objects that will be passed to event callbacks
   * bound to dataset objects that contain information about the event and what
   * has changed. See [the Events
   * tutorial](http://misoproject.com/dataset/dataset/tutorials/events) for
   * more information.
   *
   * @constructor
   * @name Event
   * @memberof Miso.Dataset
   *
   * @param {Delta[]} deltas
   */
  Dataset.Event = function(deltas, dataset) {
    if (!_.isArray(deltas)) {
      deltas = [deltas];
    }
    this.deltas = deltas;
    this.dataset = dataset || null;
  };

  _.extend(Dataset.Event.prototype, {
    /**
     * @externalExample {runnable} event/affected-columns
     *
     * @returns {Array} Columns affected by the event
     */
    affectedColumns : function() {
      var cols = [];
      _.each(this.deltas, function(delta) {
        delta.old = (delta.old || []);
        delta.changed = (delta.changed || []);
        cols = _.chain(cols)
          .union(_.keys(delta.old), _.keys(delta.changed) )
          .reject(function(col) {
            return col === this.dataset.idAttribute;
          }, this).value();
      }, this);

      return cols;
    }
  });

   _.extend(Dataset.Event,
    /** @lends Miso.Dataset.Event */
    {

    /**
     * @externalExample {runnable} event/is-remove
     *
     * @returns {Boolean} true if the event is a deletion
     */
    isRemove : function(delta) {
      if (_.isUndefined(delta.changed) || _.keys(delta.changed).length === 0) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * @externalExample {runnable} event/is-add
     *
     * @returns {Boolean} true if the event is an add event
     */
    isAdd : function(delta) {
      if (_.isUndefined(delta.old) || _.keys(delta.old).length === 0) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * @externalExample {runnable} event/is-update
     *
     * @returns {Boolean} true if the event is an update
     */
    isUpdate : function(delta) {
      if (!this.isRemove(delta) && !this.isAdd(delta)) {
        return true;
      } else {
        return false;
      }
    }
  });
  
  
  //Event Related Methods
  Dataset.Events = {};

  // Used to build event objects accross the application.
  Dataset.Events._buildEvent = function(delta, dataset) {
    return new Dataset.Event(delta, dataset);
  };

  /**
   * @typedef Delta
   * @type {Object}
   * @property {Object} changed
   * @property {Object} old
   */

}(this, _));
