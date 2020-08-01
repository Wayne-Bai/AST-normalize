//  Tags core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com
/*jshint multistr: true */

define(['app','backbone'], function(app, Backbone) {

  "use strict";

  var Module = {};

  Module.id = 'tags';
  Module.dataTypes = ['TEXT','VARCHAR','CHAR'];

  Module.variables = [
    {id: 'force_lowercase', ui: 'checkbox', def: '1'}
  ];

  var template = '<input type="hidden" value="{{value}}" name="{{name}}" id="{{name}}"> \
                 <input type="text" class="medium" id="tag-input" style="margin-right:10px;"><button class="btn btn-small btn-primary margin-left" type="button">Add</button> \
                 <div style="width:84%;">{{#tags}}<span class="tag">{{this}}</span>{{/tags}}</div>';

  Module.Input = Backbone.Layout.extend({

    tagName: 'div',

    attributes: {
      'class': 'field'
    },

    template: Handlebars.compile( template),

    events: {
      'keydown #tag-input': function(e) {
        // 188 = comma, 13 = enter
        if (e.keyCode === 188 || e.keyCode === 13) {
          e.preventDefault();
          this.insertTag();
        }
      },
      'click span': function(e) {
        var index = $('.tag').index($(e.target));
        this.tags.splice(index,1);
        this.render();
      },
      'click button': 'insertTag'
    },

    insertTag: function() {
      var $input = this.$el.find('#tag-input');
      var data = $input.val();
      var force_lowercase = (this.options.settings && this.options.settings.has('force_lowercase') && this.options.settings.get('force_lowercase') == '0') ? false : true;
      if(force_lowercase){
        data = data.toLowerCase();
      }
      var tempTags = data.split(",");
      for (var i = tempTags.length - 1; i >= 0; i--) {
        var thisTag = tempTags[i].trim();
        if (this.tags.indexOf(thisTag) === -1) {
          this.tags.push(thisTag);
        }
      }
      this.render().$el.find('#tag-input').focus();
    },

    serialize: function() {
      //Filter out empty tags
      this.tags = _.filter(this.tags, function(tag) { return(tag !== ''); });
      return {
        value: this.tags.join(','),
        name: this.options.name,
        tags: this.tags,
        comment: this.options.schema.get('comment')
      };
    },

    initialize: function() {
      this.tags = this.options.value ? this.options.value.split(',') : [];
    }

  });

  Module.validate = function(value, options) {
    if (options.schema.isRequired() && _.isEmpty(value)) {
      return 'This field is required';
    }
  };

  Module.list = function(options) {
    return options.model.attributes.tags;
  };

  return Module;
});