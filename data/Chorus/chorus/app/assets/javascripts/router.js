(function() {
    // apply arbitrary number of arguments to constructor (for routes with parameters)
    // code taken from http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/1608546#1608546
    function applyConstructor(constructor, args) {
        function chorus$Page() {
            return constructor.apply(this, args);
        }

        chorus$Page.prototype = constructor.prototype;
        return new chorus$Page();
    }

    chorus.Router = Backbone.Router.include(
        chorus.Mixins.Events
    ).extend({
        constructor: function chorus$Router() {
            Backbone.Router.apply(this, arguments);
        },

        maps:[
            // routes are evaluated in LIFO format, so adding a match-all route first will act as a fallback properly
            // (as long as `maps` is evaluated in order)
            ["*path", "InvalidRoute"],
            ["unauthorized", "Unauthorized"],
            ["forbidden", "Forbidden"],
            ["invalidRoute", "InvalidRoute"],
            ["notLicensed", "NotLicensed"],
            ["unprocessableEntity", "UnprocessableEntity"],
            ["?*query", "Dashboard"],
            ["", "Dashboard"],
            ["login", "Login"],
            ["search/:query", "SearchIndex"],
            ["search/:scope/:entityType/:query", "SearchIndex"],
            ["users", "UserIndex"],
            ["users/:id", "UserShow"],
            ["users/:id/edit", "UserEdit"],
            ["users/:id/dashboard_edit", "UserDashboardEdit"],
            ["users/new", "UserNew"],
            ["workspaces", "WorkspaceIndex"],
            ["workspaces/:id", "WorkspaceShow"],
            ["workspaces/:id/quickstart", "WorkspaceQuickstart"],
            ["workspaces/:workspaceId/workfiles", "WorkfileIndex"],
            ["workspaces/:workspaceId/datasets/:datasetId", "WorkspaceDatasetShow"],
            ["workspaces/:workspaceId/chorus_views/:datasetId", "ChorusViewShow"],
            ["workspaces/:workspaceId/hadoop_datasets/:datasetId", "HdfsDatasetShow"],
            ["workspaces/:workspaceId/workfiles/:workfileId", "WorkfileShow"],
            ["workspaces/:workspaceId/workfiles/:workfileId/versions/:versionId", "WorkfileShow"],
            ["workspaces/:workspaceId/datasets", "WorkspaceDatasetIndex"],
            ["workspaces/:workspaceId/kaggle", "KaggleUserIndex"],
            ["workspaces/:workspaceId/jobs", "JobsIndex"],
            ["workspaces/:workspaceId/milestones", "MilestonesIndex"],
            ["workspaces/:workspaceId/jobs/:jobId", "JobsShow"],
            ["workspaces/:workspaceId/search/:query", "WorkspaceSearchIndex"],
            ["workspaces/:workspaceId/search/:scope/:entityType/:query", "WorkspaceSearchIndex"],
            ["workspaces/:workspaceId/tags/:name", "WorkspaceTagShow"],
            ["workspaces/:workspaceId/tags/:scope/:entityType/:name", "WorkspaceTagShow"],
            ["data_sources", "DataSourceIndex"],
            ["data_sources/:dataSourceId/databases", "DatabaseIndex"],
            ["databases/:databaseId", "GpdbSchemaIndex"],
            ["schemas/:schemaId", "SchemaDatasetIndex"],
            ["datasets/:id", "DatasetShow"],
            ["gnip_data_sources/:id", "GnipDataSourceShow"],
            ["hdfs_data_sources/:dataSourceId/browse", "HdfsEntryIndex"],
            ["hdfs_data_sources/:dataSourceId/browse/:id", "HdfsEntryIndex"],
            ["hdfs_data_sources/:dataSourceId/browseFile/:id", "HdfsShowFile"],
            ["notifications", "NotificationIndex"],
            ["styleguide", "StyleGuide"],
            ["tags", "TagIndex"],
            ["tags/:name", "TagShow"],
            ["tags/:scope/:entityType/:name", "TagShow"],
            ["data_sources/:id/schemas", "OracleSchemaIndex"],
            ["work_flows/:id", "WorkFlowShow"],
            ["about", "About"]
        ],

        initialize:function (app) {
            var self = this;
            self.app = app;

            _.each(this.maps, function (map) {
                var pattern = map[0],
                    pageClassName = map[1],
                    callback = self.generateRouteCallback(pageClassName);
                self.route(pattern, pageClassName, callback);
            });

            var alternateHomePage = chorus.models.Config.instance().license().homePage();
            alternateHomePage && self.route("", alternateHomePage, self.generateRouteCallback(alternateHomePage));

            self.route("logout", "Logout", self.app.session.logout);
        },

        navigate:function (fragment, pageOptions) {
            this.app.pageOptions = pageOptions;
            fragment = fragment.match(/#?(.*)/)[1];
            var fragComparison = fragment.match(/\/?(.*)/)[1];
            if (Backbone.history.fragment === fragComparison || Backbone.history.fragment === decodeURIComponent(fragComparison)) {
                Backbone.history.loadUrl(fragment);
            } else {
                pageOptions = pageOptions || { trigger: true };
                Backbone.Router.prototype.navigate.call(this, fragment, pageOptions);
            }
        },

        reload: function() {
            this.navigate(Backbone.history.fragment);
        },

        pageRequiresLogin: function(pageName) {
            return !_.include(["Login", "StyleGuide"], pageName);
        },

        generateRouteCallback: function(className) {
            var self = this;
            return function () {
                var args = _.map(_.toArray(arguments), function(arg) {
                    return decodeURIComponent(arg);
                });
                var navFunction = function() {
                    chorus.PageEvents.off();
                    if (className === "Login" && self.app.session.loggedIn()) {
                        self.navigate("");
                    } else {
                        self.trigger("leaving");
                        var pageClass = chorus.pages[className + "Page"];
                        var page = applyConstructor(pageClass, args);
                        page.pageOptions = self.app.pageOptions;
                        delete self.app.pageOptions;
                        self.app.page = page;
                        self.app.updateCachebuster();

                        $("#page").html(page.render().el).attr("data-page", className).addClass(page.pageClass);

                        if (self.app.modal) self.app.modal.closeModal();
                    }
                    self.app.scrollToTop();
                };

                if (this.pageRequiresLogin(className) && !self.app.session.loaded) {
                    self.app.session.fetch(
                        {
                            success: navFunction,
                            error: function() { self.navigate("login"); }
                        });
                } else {
                    navFunction();
                }
            };
        }
    });
})();

