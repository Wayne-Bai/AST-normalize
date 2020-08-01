//This is the view for the mockup elements (button, checkbox, etc.)

usemockups.views.Mockup = Backbone.View.extend({
    tagName: "div",
    className: "object",
    events: {
        "click": "show_property_dialog",
        "keydown": "keydown"
    },
    initialize: function () {

        this.model.on("change", this.render, this);

        this.article = $("article");
        this.tool = usemockups.toolbox.get(this.model.get("tool")); //gets which kind of mockup element it is (called tool, since they are created via tools). Get model via text string like "text"(for text tool) ,since the toolbox-model’s ids are actually human readable text strings for the represented tools.
        this.template = $(this.tool.get("template")).html();

        this.model.on("destroy", this.detach, this)

    },
    render: function (rendering_options) {

        var options = _.extend({
            focus: true,
            show_property_dialog: true
        }, rendering_options);

        this.$el.css({
            "top": this.model.get("top") + this.article.offset().top,
            "left": this.model.get("left") + this.article.offset().left,
            "width": this.model.get("width") || "auto",
            "height": this.model.get("height") || "auto",
            "z-index": this.model.get("z_index")
        }).addClass(this.model.get("tool")).draggable({
                "containment": "article",
                "stop": function (event, ui) {
                    this.model.set({
                        "top": ui.position.top - this.article.offset().top,
                        "left": ui.position.left - this.article.offset().left
                    })
                }.bind(this)
        }).html(_.template(this.template, this.model.get_attributes()));


        this.$el.find("[data-attribute]").dblclick(function (event) {
            var attribute = $(event.target).data("attribute");
            var input = $("<input>")
                .attr("name", attribute)
                .data("attribute", attribute)
                .val(this.model.get(attribute));
            $(event.target).html(input);
            input.select();

            input.bind("change blur", function (event) {
                var input = $(event.target);
                this.model.set(input.data("attribute"), input.val());
            }.bind(this)).keyup(function (event) {
                usemockups.active_property_dialog.trigger("update_for_attribute", $(event.target));
            }.bind(this));

        }.bind(this))

        this.make_resizable();

        this.$el.bind("click mousedown", function (event) {
            if (!$(event.target).is("input")) {
                this.focus();
            }
        }.bind(this));

        if (options.show_property_dialog)
            this.show_property_dialog();

        if (options.focus)
            this.focus();

        this.determine_z_indexes();

        return this;
    },

    determine_z_indexes: function () {
        var _prototype = usemockups.views.Mockup.prototype,
            min_z_index = _prototype.min_z_index || 1,
            max_z_index = _prototype.max_z_index || 1;

        if (this.model.get("z_index") < min_z_index)
            min_z_index  = this.model.get("z_index");
        if (this.model.get("z_index") > max_z_index)
            max_z_index = this.model.get("z_index");
        _prototype.min_z_index = min_z_index;
        _prototype.max_z_index = max_z_index;
    },

    make_resizable: function () {

        if (!this.model.is_resizable())
            return;

        if (this.$el.hasClass("ui-resizable"))
            this.$el.resizable("destroy");

        this.$el.resizable({
            handles: "se",
            resize: function(event, ui) {
                if (!this.model.has("height"))
                    ui.size.height = ui.originalSize.height;
                if (!this.model.has("width"))
                    ui.size.width = ui.originalSize.width;
                usemockups.active_property_dialog.trigger("update_for_sizes", ui.size);
            }.bind(this),
            stop: function (event, ui) {
                if (this.model.has("width"))
                    this.model.set("width", ui.size.width);
                if (this.model.has("height"))
                    this.model.set("height", ui.size.height)
            }.bind(this),
            minWidth: this.tool.get("min_width"),
            minHeight: this.tool.get("min_height")
        });

    },

    focus: function () {
        this.$el.focus();
        return this;
    },

    show_property_dialog: function () {

        $("footer").show();

        if (usemockups.active_property_dialog &&
            usemockups.active_property_dialog.model === this.model) {
            return;
        }

        if (usemockups.active_property_dialog) {
            usemockups.active_property_dialog.undelegateEvents();
        }

        usemockups.active_property_dialog = (new usemockups.views.PropertyDialog({
            "model": this.model
        })).render()
    },

    detach: function () {
        this.$el.remove();
    },

    /*
     * Moves the mockup if the key was an arrow key.
     */
    keydown_move: function (e) {
        var movements = {
            37: { "left": -5 },
            39: { "left": 5 },
            38: { "top": -5 },
            40: { "top": 5}
        };
        if (movements[e.keyCode]) {
            var movement = movements[e.keyCode];
            for (var direction in movement) {
                this.model.set(direction, this.model.get(direction) + movement[direction]);
            }
            return false;
        }
    },

    /*
     * Deletes the mockup if the key was the del key.
     */
    keydown_destroy: function (e) {
        if (e.keyCode == 46) {
            this.model.destroy();
            return false;
        }
    },

    keydown: function (e) {
        this.keydown_move(e);
        this.keydown_destroy(e);
    }


});

/*
* Custom Mockups
Extend the normal mockups functionality with additional/different functionality
* */

usemockups.views.TableMockup = usemockups.views.Mockup.extend({
    initialize: function () {
        usemockups.views.Mockup.prototype.initialize.apply(this);
        this.model.on("change:columns change:rows", this.persist_values, this);
    },
    render: function () {
        usemockups.views.Mockup.prototype.render.apply(this);
        this.$el.find("input").change(function (event) {
            var input = $(event.target);
            var values = this.model.get("values");
            values[input.data("row")][input.data("column")] = input.val() || "";
            this.model.set("values", values);
            this.model.trigger("persist");

        }.bind(this));
        return this;
    },
    persist_values: function () {
        var values = this.model.get("values"),
            rows = this.model.get("rows"),
            columns = this.model.get("columns");

        for (var i=0; i<rows; i++) {
            values[i] = values[i] || [];
            for (var j=0; j<columns; j++) {
                values[i][j] = values[i][j] || "";
            }
        }

        this.model.set("values", values);
        this.model.trigger("persist");
    }
});
