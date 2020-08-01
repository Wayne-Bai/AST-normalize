define([
    "hr/hr",
    "models/article",
    "utils/dragdrop",
    "utils/dialogs",
    "views/articles",
    "text!resources/templates/summary.html"
], function(hr, Article, dnd, dialogs, ArticlesView, templateFile) {
    var normalizePath = node.require("normall").filename;
    var gui = node.gui;

    var Summary = hr.View.extend({
        className: "summary",
        template: templateFile,
        events: {
            "contextmenu": "contextMenu"
        },

        initialize: function() {
            Summary.__super__.initialize.apply(this, arguments);

            // Drag and drop of tabs
            this.drag = new dnd.DraggableType();

            this.articles = new ArticlesView({}, this);

            this.menu = new gui.Menu();
            this.menu.append(new gui.MenuItem({
                label: 'Add Chapter',
                click: this.addChapter.bind(this)
            }));
        },

        finish: function() {
            this.articles.$el.appendTo(this.$(".inner"));
            return Summary.__super__.finish.apply(this, arguments);
        },

        /*
         * Load summary from SUMMARY.md
         */
        load: function() {
            var that = this;

            return this.parent.model.contentRead("SUMMARY.md")
            .then(function(content) {
                that.articles.collection.parseSummary(content);
            }, function(err) {
                console.log("error", err);
            });
        },

        /*
         * Save summary content
         */
        save: function() {
            var that = this;
            return this.parent.model.contentWrite("SUMMARY.md", this.articles.collection.toMarkdown())
            .then(function() {
                return that.load();
            });
        },

        /*
         * Add a new main chapter
         */
        addChapter: function(e) {
            var that = this;
            if (e) e.preventDefault();


            dialogs.prompt("Add New Chapter", "Enter a title for the new chapter", "Chapter")
            .then(function(title) {
                if (!title) throw "You need to enter a title to create a new chapter";

                var _title = normalizePath(title),
                    article = {
                        title: title,
                        path: _title +'/README'
                    };
                that.articles.collection.add(article);
                return that.save();
            })
            .fail(dialogs.error);
        },

        /*
         * Get article by its path
         */
        getArticle: function(_path, collection) {
            var that = this;
            collection = collection || this.articles.collection;

            if (_path == "README.md") {
                return collection.getIntroduction();
            }

            // Search in this collection
            var article = collection.find(function(_article) {
                console.log("->", _article.get("path"), _path)
                return _article.get("path") == _path;
            });
            if (article) return article;

            // Search in sub collection
            collection.each(function(_article) {
                article = article || that.getArticle(_path, _article.articles);
                if (article) return false;
            });

            return article;
        },

        /*
         *  Return introduction
         */
        getIntroduction: function() {
            return this.getArticle("README.md");
        },

        contextMenu: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.menu.popup(e.originalEvent.x, e.originalEvent.y);
        }
    });

    return Summary;
});