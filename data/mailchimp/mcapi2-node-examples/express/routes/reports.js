/*
 * GET the list of sent campaigns.
 */

exports.list = function(req, res){
  mc.campaigns.list({'status':'sent'}, function(data) {
    res.render('reports/index', { title: 'Report', campaigns: data.data });
  }, function(error) {
    if (error.error) {
      req.session.error_flash = error.code + ": " + error.error;
    } else {
      req.session.error_flash = "An unknown error occurred";
    }
    res.redirect("/");
  });
};

/*
 * GET a report.
 */

exports.view = function(req, res){
  mc.campaigns.list({campaign_id: req.params.id}, function(campaignData) {
    var campaign = campaignData.data[0];
    mc.reports.summary({cid:req.params.id}, function(reportData) {
      res.render('reports/view', { title: 'Report for '+campaign.title, campaign: campaign, report:reportData });
    }, function (error) {
      console.log(error);
      if (error.name == "Campaign_DoesNotExist") {
        req.session.error_flash = "The campaign does not exist";
      } else if (error.error) {
        req.session.error_flash = error.code + ": " + error.error;
      } else {
        req.session.error_flash = "An unknown error occurred";
      }
      res.redirect('/reports');
    });
  });
};
