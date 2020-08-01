// CreativityGraphView.js
// -------
define(["jquery", "backbone", "handlebars",
        "./BaseView", "arbor", "../utils/Renderer",
        "models/GenericModel", "text!templates/creativity_graph.hbr"
    ],

    function($, Backbone, Handlebars, BaseView,
        arbor, Renderer, Model, template) {

        var View = BaseView.extend({

            // The DOM Element associated with this view
            el: "#creativity-graph-container",
            template: Handlebars.compile(template),

            // View constructor
            initialize: function(context) {
                _.extend(this, context);
                this.model = new Model({
                    query: this.query
                });
                this.model.fetch({
                    success: function() {
                        this.render();
                    }.bind(this)
                });
            },

            changeQuery: function(query) {
                this.model = new Model({
                    query: query
                });
                this.model.fetch({
                    success: function() {
                        this.render();
                    }.bind(this)
                });
            },

            // View Event Handlers
            events: {

            },

            // Renders the view's template to the UI
            render: function() {
                // Render Layout
                this.$el.html(this.template());
                _.defer(function() {
                    // create the system with sensible repulsion/stiffness/friction
                    var sys = arbor.ParticleSystem(1000, 600, 0.5);
                    sys.parameters({
                        gravity: true
                    });
                    sys.renderer = Renderer("#creativity-graph");
                    if ("graph" in this.model.attributes) {
                        sys.graft(this.model.attributes.graph);
                    }
                }.bind(this));
                // Maintains chainability
                return this;
            }

        });

        // Returns the View class
        return View;

    }

);