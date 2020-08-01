/*
 * FlatTurtle
 * @author: Johan Dams (johan.dams@wrdsystems.co.uk)
 * @license: AGPLv3
 */

(function($){

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			_.bindAll(this, "configure");

			this.on("born", this.configure);
			this.on("reconfigure", this.configure);
	
		},
		configure : function(){
			this.trigger("render");
		}
	});

    var view = Backbone.View.extend({
        initialize : function() {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "render");

			// bind render to collection reset
			this.collection.on("render", this.render);
        },
        render : function(){
			var self = this;
			
			switch(self.options.service){
			case 'ustream':
				$.get('turtles/streaming/views/ustream.html', function(template) {
					var data = {
						videoid  : self.options.videoid
					};
					self.$el.empty();
					self.$el.height('100%');
					self.$el.addClass('nopadding');
					self.$el.html(Mustache.render(template, data));
				});
			break;
			case 'aljazeera':
				$.get('turtles/streaming/views/aljazeera.html', function(template) {
					var data = {
					};
					self.$el.empty();
					self.$el.height('100%');
					self.$el.addClass('nopadding');
					self.$el.html(Mustache.render(template, data));
				});
			break;
            case 'rtmp':
                $.get('turtles/streaming/views/rtmp.html', function(template) {
                    var data = {
                        stream  : self.options.stream,
                        videoid : self.options.videoid 
                    };
                    self.$el.empty();
                    self.$el.height('100%');
                    self.$el.addClass('nopadding');
                    self.$el.html(Mustache.render(template, data));
                });
            break;
			default:
				log.error("TURTLE - STREAMING - Unknown streaming service");
			}
        }
    });

    // register turtle
    Turtles.register("streaming", {
		collection : collection,
        view : view
    });


})(jQuery);

