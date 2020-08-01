if(Meteor.isServer) {
  WebApp.connectHandlers.use(function(req, res, next) {
    if(req.url == '/best') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    next();
  });
}