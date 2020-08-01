chorus.views.DashboardModule = chorus.views.Base.extend({
    constructorName: "DashboardModuleView",
    templateName:"dashboard/module",

    setup: function(options) {
        options = options || {};
        this.contentHeader = this.contentHeader || options.contentHeader;
        this.content = this.content || options.content;
    },

    subviews: {
        ".module_header": "contentHeader",
        ".module_content": "content"
    },

    postRender: function() {
        if (!this.content)  this.$(".content").addClass("hidden");
    }
});
