var docs = require('../docs');

var types = {
  'none':       0,
  'can view':   1,
  'can edit':   2
};

exports.loadSnapshot = function (app) {
  return function (req, res, next) {
    docs.get(req.params.docId, function (err, doc) {
      req.docSnapshot = doc ? (doc.content || '') : '';
      next();
    });
  };
};

exports.requireMinimunPermissions = function (min) {
  min = min || 'can view';

  return function (req, res, next) {
    
    docs.get(req.params.docId, function (err, doc) {
      if(err) return res.send(500);
      if(!doc) return res.send(404);

      req.doc = doc;

      var maxPerm = docs.getMaxPermission(req.user, doc);

      if (types[min] > types[maxPerm]) {
        if(! req.user){
          req.session.returnTo = req.originalUrl;
          return res.redirect('/login');
        }
        
        if(req.method === 'GET'){
          req.session.returnTo = req.originalUrl;
        }

        return res.render('insufficient-permissions', function(err, html) {
          res.send(html, 401);
        });
      }

      next();
    });
  };

};