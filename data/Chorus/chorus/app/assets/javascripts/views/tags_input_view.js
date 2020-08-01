chorus.views.TagsInput = chorus.views.Base.extend({
    templateName: "tags_input",
    constructorName: "TagsInputView",
    tags: [], // to make jshint happy

    setup: function() {
        this.tags = this.options.tags;
        this.taggable = this.options.taggable;

        this.listenTo(this.taggable, 'change:tags', this.render);
    },

    postRender: function() {
        this.$input = this.$('input');
        this.buildTextExt();
    },

    buildTextExt: function() {
        var tagsForTextext = this.tags.map(function(tag) {
            return {name: tag.name(), model: tag};
        });

        this.$input.textext({
            plugins: 'tags autocomplete ajax',
            tagsItems: tagsForTextext,
            itemManager: chorus.utilities.TagItemManager,
            keys: {
                8: 'backspace',
                9: 'tab',
                13: 'enter!',
                27: 'escape',
                37: 'left',
                38: 'up!',
                39: 'right',
                40: 'down!',
                46: 'delete',
                108: 'numpadEnter',
                188: 'comma'
            },
            ajax: {
                url: '/tags',
                dataType: 'json',
                existingTagCollection: this.tags
            },
            autocomplete: {
                render: function(suggestion) {
                    return suggestion.text;
                },
                dropdown: {
                    maxHeight: '200px'
                }
            }
        });

        this.textext = this.$input.textext()[0];
    },

    events: {
        'setFormData input.tag_editor': 'updateTags',
        'isTagAllowed input.tag_editor': 'textExtValidate',
        'setInputData input.tag_editor': 'restoreInvalidTag',
        'focus input.tag_editor': 'resizeTextExt',
        'tagClick input.tag_editor': 'triggerTagClick',
        'commaKeyUp input.tag_editor': 'handleComma'

    },

    triggerTagClick: function(e, tag, value, callback) {
        this.trigger("tag:click", value.model);
    },

    handleComma: function(e, data) {
        this.$input.trigger("enterKeyPress", e, data);
        this.$input.trigger("setInputData", '');
        // Trigger getSuggestions to fix a bug where a "," suggestion would show up for "Create new" option.
        this.$input.trigger("getSuggestions");
    },

    resizeTextExt: function() {
        this.textext && this.textext.trigger('postInvalidate');
    },

    updateTags: function(e, tags) {
        if(tags.length > this.tags.length) {
            for(var i = this.tags.length; i < tags.length; ++i) {
                this.addTag(tags[i].model);
            }
        } else if(tags.length < this.tags.length) {
            this.removeMissingTag(tags);
        }
        this.focusInput();
    },

    addTag: function(newTag) {
        var duplicate = this.tags.find(function(tag) {
            return tag.matches(newTag.name());
        });
        if(duplicate) {
            this.tags.remove(duplicate, {silent: true});
        }

        this.tags.add(newTag);
        this.taggable.updateTags({add: newTag});
        this.render();
    },

    removeMissingTag: function(tags) {
        var tagNames = _.pluck(tags, "name");
        var missingTag = this.tags.find(function(tag) {
            return !_.contains(tagNames, tag.name());
        });
        this.tags.remove(missingTag);
        this.taggable.updateTags({remove: missingTag});
    },

    textExtValidate: function(e, data) {
        this.invalidTagName = "";
        data.tag.name = $.trim(data.tag.name);
        data.tag.model = new chorus.models.Tag({name: data.tag.name});
        if(!this.validateTag(data.tag.model)) {
            data.result = false;

            if(this.keepInvalidTagName) {
                this.invalidTagName = data.tag.name;
                this.keepInvalidTagName = false;
            }
        }
    },

    validateTag: function(tag) {
        this.clearErrors();
        if(!tag.performValidation(tag.attributes)) {
            this.markInputAsInvalid(this.$input, tag.errors.name, false);
            this.keepInvalidTagName = true;
            return false;
        }
        return true;
    },

    restoreInvalidTag: function(e, tag) {
        this.$input.val(tag || this.invalidTagName);
        this.invalidTagName = "";
    },

    additionalContext: function() {
        return {
            tags: this.tags.models,
            hasTags: this.tags.length > 0
        };
    },

    focusInput: function() {
        this.$input.focus();
    }
});
