App.IndexController = Ember.ArrayController.extend(EmberDC.ControllerMixin, {

  /**
   * @property metrics
   * @type {Array}
   * Computed Metrics
   */
  metrics: [
    {value:'sighting',       label: 'Sightings'}
  ],

  startDate: moment().subtract('years', 50),
  endDate: moment().subtract('years', 4),

  /**
   * @method _createDimensions
   * Create the defined dimensions from the controller.
   * @return {void}
   * @private
   */
  _createDimensions: function() {
    var self = this;

    var content = Ember.get(this, 'content');

    content.forEach(function(d, i) {
      d.date = moment(d.sighted, 'YYYYMMDD').toDate();
    });

    d3.json("data/us-states.json", function (statesJson) {
      self.set('usStates', statesJson);
    });

    // Date Dimension
    this.set('dimensions.date', this._crossfilter.dimension(function(d) { return d.date; }));
    this.set('dimensions.state', this._crossfilter.dimension(function (d) { return d.state; }));
    this.set('dimensions.daysOfWeek', this._crossfilter.dimension(function (d) {
      var day = d.date.getDay();
      var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      return day+"."+name[day];
    }));
  },


  /**
   * @method _createGroups
   * Create the defined groups from the controller.
   * @return {void}
   * @private
   */
  _createGroups: function() {
    this.set('groups.all', this._crossfilter.groupAll());
    this.set('groups.daysOfWeek', this.get('dimensions.daysOfWeek').group());
    this.set('groups.dateComposite', this.get('dimensions.date').group(d3.time.month).reduce(
      function(p, v){
          return {
            sighting: p.sighting+1
          }
      },
      function(p, v){
        return {
          sighting: p.sighting-1
        }
      },
      function(){return {sighting:0};}
    ));

    this.set('groups.state', this.get('dimensions.state').group());
  }


});
