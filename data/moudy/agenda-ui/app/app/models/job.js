import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  name: attr('string')
, jobData: attr()
, nextRunAt: attr('date')
, lastRunAt: attr('date')
, lastFinishedAt: attr('date')
, lastModifiedBy: attr('date')
, lockedAt: attr('date')
, failedAt: attr('date')
, failReason: attr('string')
, type: attr('string')
, repeatInterval: attr('string')
, priority: attr('number')

, isFinished: function () {
    return this.get('lastRunAt') && !this.get('isRepeating');
  }.property('lastRunAt')

, isRepeating: function () {
    return this.get('type') === 'single';
  }.property('type')

});

