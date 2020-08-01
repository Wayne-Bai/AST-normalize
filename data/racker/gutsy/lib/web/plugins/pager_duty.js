var utils = require('../../utils').common;
var _ = require('underscore');

/** Adds pagerduty field to devops if pagerduty related api is present
 * @param {string} devops_filename the filename of the devopsjson file relative to the fixtures directory
 * @param {fn} request_maker A function that takes two arguments, options and on_end_cb:
 *   options an options dict for making an XHR, such as would be used by http.request
 *   on_end_cb a callback that gets called with the XHR response data
 */

module.exports = {
  name: 'pager_duty',
  poll_interval: 10 * 60 * 1000,
  related_apis: ['pager_duty'],
  priority: 1,
  worker: function(payload) {
    var api_config = payload.get_config();

    // PagerDuty requires the date range for all requests.
    var now, until, options;

    now = new Date();
    until = new Date();
    until.setDate(now.getDate() + 4);
    now = now.toISOString().split('T')[0];
    until = until.toISOString().split('T')[0];

    options = {
      port: api_config.port,
      host: api_config.subdomain + '.pagerduty.com',
      path: ['/api/v1/schedules/',
             api_config.schedule_id,
             '/entries?since=',
             now,
             '&until=',
             until].join(''),
      method: 'GET',
      auth: api_config.auth,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    utils.request_maker(
      options,
      function(err, data) {
        var parsed_data;
        if(err){
          payload.set_data(err);
          return;
        }
        try{
          parsed_data = JSON.parse(data.data);
        } catch (e){
          payload.set_data(e);
          return;
        }
        payload.set_data(null, parsed_data);
      }
    );
  }
};
