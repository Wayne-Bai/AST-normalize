/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 * @license: AGPLv3
 */

(function($) {

    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            // prevents loss of "this" inside methods
            _.bindAll(this, "configure");

            // fetch data when born
            this.on("born", this.configure);
            this.on("refresh", this.configure);
            this.on("reconfigure", this.configure);

            // default error value
            options.error = false;
        },
        configure : function() {
            // don't fetch if there is no feed
            if (this.options.data == null || !this.options.data)
                return;

            var data = JSON.parse(this.options.data);
            this.options.data = [];

            for(var taxi in data){
                this.options.data.push({
                   "name" : taxi,
                   "number" : data[taxi]
                });
            }
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            // prevents loss of "this" inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if(this.template == null) {
                $.get("turtles/taxi/views/fullscreen.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template) {
                var data = {
                    error : this.options.error,
                    entries : this.options.data
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                // position element
                var shiftleft = this.$el.find('.taxi').width()/2 + 20;
                this.$el.find('.taxi').css('margin-left','-'+ shiftleft + 'px');

                var shifttop = this.$el.find('.taxi').height()/2 + 20;
                this.$el.find('.taxi').css('margin-top','-'+ shifttop + 'px');
            }
        }
    });

    // register turtle
    Turtles.register("taxi", {
        collection : collection,
        view : view
    });

})(jQuery);
