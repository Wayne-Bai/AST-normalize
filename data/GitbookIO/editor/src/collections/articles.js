define([
    "hr/hr",
    "hr/utils",
    "models/article"
], function(hr, _, Article) {
    var parseSummary = node.require("gitbook").parse.summary;

    var Articles = hr.Collection.extend({
        model: Article,

        /*
         *  Parse SUMMARY.md content to extract articles tree
         */
        parseSummary: function(content) {
            var summary = parseSummary(content);

            try {
                this.reset(summary.chapters);
            } catch (e) {
                console.error(e.stack);
            }

        },

        /*
         *  Return a markdown representation of the summary
         */
        toMarkdown: function() {
            var bl = "\n";
            var content = "# Summary"+bl+bl;

            var _base = function(_article) {
                var article = _article.toJSON();
                if (article.path) {
                    return "* ["+article.title+"]("+article.path+")";
                } else {
                    return "* "+article.title;
                }
            }

            var convertArticle = function(article, d) {
                content = content + Array(4*d).join(" ") + _base(article)+bl;
                article.articles.each(function(_article) {
                    convertArticle(_article, d + 1);
                });
            };

            this.each(function(chapter) {
                convertArticle(chapter, 0);
            });

            content = content+bl;

            return content;
        },


        /*
         * Get readme
         */
        getIntroduction: function() {
            return this.find(function(article) {
                return article.isIntroduction();
            });
        }
    });

    return Articles;
});