// ProjectPageView.js
// 
// -------
define(["jquery", "backbone", "handlebars",
        "./BaseView", "views/UserStatusView", "text!templates/project_page.hbr"
    ],

    function($, Backbone, Handlebars, BaseView, UserStatusView, template) {

        var View = BaseView.extend({

            // The DOM Element associated with this view
            el: "#page-container",
            template: Handlebars.compile(template),

            // View Event Handlers
            events: {

            },

            // Renders the view's template to the UI
            render: function() {

                // Render Layout
                this.$el.html(this.template());
                _.defer(function() {
                    //new UserStatusView({session:this.session}).render();
                }.bind(this));
                return this;
            }

        });

        // Returns the View class
        return View;

    }

);