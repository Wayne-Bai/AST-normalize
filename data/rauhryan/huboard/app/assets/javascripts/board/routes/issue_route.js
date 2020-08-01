var IssueRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set("model", model);

    var appModel = this.modelFor("application"),
      board = appModel.fetchBoard(appModel);

    var repo = board.get("allRepos").find(function (r){
      return (r.full_name).toLowerCase() == model.repo.owner.login.toLowerCase() + "/" + model.repo.name.toLowerCase();
    })
    controller.set("repository", { 
      other_labels: Ember.get(repo, "other_labels"), 
      assignees: Ember.get(repo, "assignees"), 
      milestones: Ember.get(repo, "milestones")
    })
  },
  controllerFor: function(name, _skipAssert) {
    return this._super("issue", _skipAssert);
  },
  afterModel: function (model) {
    return model.loadDetails();
  },
  renderTemplate: function () {
    this.set("controller.commentBody", null);
    this.render("issue",{into:'application',outlet:'modal'})
  },
  actions: {
    error: function(error, transition){
      if (App.loggedIn && error.status === 404) {
        var controller = this.controllerFor("application");
        this.render("empty", {
          into:"application",
          outlet:"loading",
          controller: controller, 
        });
        this.send("sessionErrorHandler");
      }
    }
  }
});

module.exports = IssueRoute;
