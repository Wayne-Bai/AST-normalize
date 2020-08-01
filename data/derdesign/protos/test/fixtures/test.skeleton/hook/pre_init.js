
function pre_init(app) {
  app.hooks.pre_init.__loaded = true;
  app.__envDataLoadedOnPreInit = protos.__envData.tested;
}

module.exports = pre_init;