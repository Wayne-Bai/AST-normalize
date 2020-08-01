// HomePageView.js
// -------
define(["jquery", "backbone", "handlebars",
        "views/BaseView", "views/SearchCardsView",
        "views/DsmChartView",
        "text!templates/login_home_page.hbr",
        "text!templates/anonymous_home_page.hbr"
    ],

    function($, Backbone, Handlebars, BaseView,
        SearchCardsView, DsmChartView, loginTemplate, anonymousTemplate) {

        var View = BaseView.extend({

            // The DOM Element associated with this view
            el: "#page-container",
            loginTemplate: Handlebars.compile(loginTemplate),
            anonymousTemplate: Handlebars.compile(anonymousTemplate),

            initialize: function(context) {
                _.extend(this, context);
                if (this.session) {
                    this.session.bind('change', this.render, this);
                }
            },
            // View Event Handlers
            events: {
                //demo only
                "click .control-panel-selector": "selectControlPanel"
            },

            // Renders the view's template to the UI
            render: function() {

                if (this.session && this.session.isLogin()) {
                    this.$el.html(this.loginTemplate(this.session.get('userProfile')));
                } else {
                    this.$el.html(this.anonymousTemplate());
                }
                return this;
            },

            selectControlPanel: function(e) {
                e.preventDefault();
                new DsmChartView().render();
                //demo only
            }

        });

        // Returns the View class
        return View;

    }

);