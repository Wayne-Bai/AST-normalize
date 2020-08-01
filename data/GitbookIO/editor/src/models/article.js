define([
    "hr/hr"
], function(hr) {
    var path = node.require("path");

    var Article = hr.Model.extend({
        defaults: {
            title: null,
            path: null,
            level: "1",
            articles: []
        },

        initialize: function() {
            Article.__super__.initialize.apply(this, arguments);

            var Articles = require("collections/articles");

            this.articles = new Articles({});
            this.articles.reset(this.get("articles"));

            this.on("change:articles", function() {
                this.articles.reset(this.get("articles"));
            }, this);
            this.listenTo(this.articles, "add change remove reset", function() {
                this.set("articles", this.articles.toJSON(), {silent: true});
            });
        },

        level: function() {
            return this.get("level").split(".").length;
        },

        isIntroduction: function() {
            var _path = this.get("path");
            return path.dirname(_path) == "." && path.basename(_path) == "README.md";
        }
    });

    return Article;
});