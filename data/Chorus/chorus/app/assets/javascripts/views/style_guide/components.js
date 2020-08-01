chorus.views.Components = chorus.views.Base.extend({
    constructorName: "ComponentsView",
    templateName:"style_guide_components",

    typographies: [
        "<h1>h1.heading level one</h1>",
        "<h2>h2.heading level two</h2>",
        "<h3>h3.heading level three</h3>",
        "<h4>h4.heading level four</h4>",
        "<h5>h5.heading level five</h5>",
        "<h6>h6.heading level six</h6>",
        "<h5 class='h2'>h5 with h2 class</h5>",
        "<p>Standard paragraphy text. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>",
        '<p class="deemphasized">deemphasized text</p>',
        '<p class="low_light">Low light text</p>',
        '<strong>Strong text!!!</strong>'
    ],

    links: [
        "<a href='#'>default link</a>",
        "<a class='link_low_light' href='#'>lowlight link</a>"
    ],

    postRender: function() {
        _.each(this.$(".example"), _.bind(function(example) {
            var markup = $(example).removeClass('example').outerHtml();
            $(example).append('<pre><code class="language-markup">' + Handlebars.Utils.escapeExpression(markup) + '</code></pre>');
        }, this));
    },

    additionalContext: function() {
        return {
            typographies: this.typographies,
            links: this.links
        };
    }
});