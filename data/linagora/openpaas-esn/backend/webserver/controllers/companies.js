'use strict';

var mongoose = require('mongoose');
var Domain = mongoose.model('Domain');

function search(req, res) {
  var company_name = req.query.name;

  if (!company_name) {
    return res.send(400, { error: { status: 400, message: 'Bad Request', details: 'company name is required'}});
  }

  Domain.testCompany(company_name, function(err, company) {

    if (err) {
      return res.send(500, { error: { status: 500, message: 'Server Error', details: 'Can not access domains with ' + company_name}});
    }

    if (company) {
      return res.send(200, [{name: company_name}]);
    }

    return res.send(404);
  });
}

module.exports.search = search;
