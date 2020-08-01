/** Adds versionone field to devops if version_one related api_config is present
 * @param {object} devops devops object
 *
 * The MetaAPI which includes all our custom fields is available here:
 * https://www15.v1host.com/RACKSPCE/meta.v1/?xsl=api.xsl
 *
 * http://community.versionone.com/sdk/Documentation/DataAPI.aspx
 * Date Created isn't a default value, so we have to query it manually.
 *
 */

var _ = require('underscore');

var utils = require('../../utils').common;
var v1 = require('../../utils').v1;


var selection = ["ChangedBy",
                  "CreateDate",
                  "Owners",
                  "SecurityScope",
                  "AssetState",
                  "Owners",
                  "AssetType",
                  "Status",
                  "Number",
                  "Order",
                  "Description",
                  "Scope.Name",
                  "Name",
                  "Timebox",
                  "Scope",
                  "Priority"];

module.exports = {
  name: 'version_one_stories',
  poll_interval: 20 * 60 * 1000,
  related_apis: ['version_one'],
  priority: 1,
  worker: function(payload) {
    var api_config = payload.get_config('version_one');
    var scope = v1.scope_maker(api_config.project);
    var path = [
      "/Data/Story?sel=",
       selection,
       "&where=AssetState='0','64';Scope=",
       scope];
    var options = v1.options(api_config, path);

    utils.request_maker(options,
      function(err, data){
        var project_count = scope.split(",").length;
        var now = new Date();
        var assets;
        var diff;
        var severity;
        var type;
        var highPriority = [];

        if (err){
          payload.set_data(err);
          return;
        }

        v1.parse(data.data, function(err, assets){
          var v1_data;
          if (err){
            payload.set_data(err);
            return;
          }

          _.each (assets, function(asset) {
            storyCreateDate = new Date(asset.attributes['CreateDate'].text);
            diff = Math.ceil((now.getTime()-storyCreateDate.getTime())/(1000*60*60*24));
            severity = asset.attributes['Custom_Severity.Name'];
            severity = (severity && severity.text) ? severity.text[0] : '?';
            asset.severity = severity;
            priority = asset.attributes['Priority.Name'];
            if (priority.text === 'High') {highPriority.push(asset);}
          });

          v1_stories_data = {
            'total': assets.length,
            'highPriority': highPriority,
            'project_count': project_count
          };

          payload.set_data(null, v1_stories_data);
        });
    });
  }
};
