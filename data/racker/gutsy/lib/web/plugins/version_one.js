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

var selection = ["Custom_Severity.Name",
                "ChangedBy",
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
                "ResolutionReason",
                "Timebox",
                "Resolution",
                "Scope",
                "Priority"];

/**
 *
 * @returns A default dictionary for defects aggregation
 */
function def_dict() {
  return {
    total_count: 0,
    sev_count: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      '?': 0
    },
    defects: []
  };
}

module.exports = {
  name: 'version_one',
  poll_interval: 20 * 60 * 1000,
  related_apis: ['version_one'],
  priority: 1,
  worker: function(payload) {
    var api_config = payload.get_config('version_one');
    var scope = v1.scope_maker(api_config.project);
    var path = [
      "/Data/Defect?sel=",
       selection,
       "&where=AssetState='0','64';Scope=",
       scope];
    var options = v1.options(api_config, path);

    utils.request_maker(options,
      function(err, data){
        var byAge = {};
        var project_count = scope.split(",").length;
        var now = new Date();
        var defectCreateDate;
        var assets;
        var diff;
        var severity;
        var type;
        var highPriority = [];
        var age0 = 'defects Today';
        var age1 = 'defects 1 - 5 days old';
        var age2 = 'defects 5 - 10 days old';
        var age3 = 'defects 10 - 30 days old';
        var age4 = 'defects more than 30 days old';
        byAge[age0] = def_dict();
        byAge[age1] = def_dict();
        byAge[age2] = def_dict();
        byAge[age3] = def_dict();
        byAge[age4] = def_dict();

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
            defectCreateDate = new Date(asset.attributes['CreateDate'].text);
            diff = Math.ceil((now.getTime()-defectCreateDate.getTime())/(1000*60*60*24));
            if (diff <= 1) { type = age0; }
            else if (diff <= 5) { type = age1; }
            else if (diff <= 10){ type = age2; }
            else if (diff <= 30){ type = age3; }
            else if (diff > 30){ type = age4; }
            else { type = age0; }
            byAge[type].defects.push(asset);
            byAge[type].total_count += 1;
            severity = asset.attributes['Custom_Severity.Name'];
            severity = (severity && severity.text) ? severity.text[0] : '?';
            asset.severity = severity;
            byAge[type].sev_count[severity] += 1;
            priority = asset.attributes['Priority.Name'];
            if (priority.text === 'High') {highPriority.push(asset);}
          });

          v1_data = {
            'total': assets.length,
            'byAge': byAge,
            'highPriority': highPriority,
            'project_count': project_count
          };
          payload.set_data(null, v1_data);
        });
    });
  }
};
