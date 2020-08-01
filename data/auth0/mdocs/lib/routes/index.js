module.exports = function (app, socketServer) {
  require('./docs-routes')(app, socketServer);
  require('./signin-out')(app);
  require('./auth0-provisioning')(app);
  require('./users-routes')(app);
  require('./search')(app);
};