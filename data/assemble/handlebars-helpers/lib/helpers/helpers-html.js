/**
 * Handlebars HTML Helpers
 * Copyright (c) 2013, 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT).
 */
'use strict';


// Local utils
var Utils = require('../utils/utils');
var HTML  = require('../utils/html');
var nap = require('nap');


module.exports.register = function (Handlebars, opts) {
  opts = opts || {};

  // The module to be exported
  var helpers = {

    /**
     * {{css}}
     * Add an array of <link></link> tags. Automatically resolves
     * relative paths to `opts.assets` in the Assemble task.
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    css: function (context) {
      if (!Array.isArray(context)) {
        context = [context];
      }
      return new Utils.safeString(context.map(function (item) {
        var ext = Utils.getExt(item);
        var css = '<link rel="stylesheet" href="' + opts.assets + '/css/' + item + '">';
        var less = '<link rel="stylesheet/less" href="' + opts.assets + '/less/' + item + '">';
        switch (ext) {
          case "less":
            return less;
          case "css":
            return css;
          default:
            return css;
        }
      }).join("\n"));
    },

    /**
     * {{js "src/to/*.js"}}
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    js: function (context) {
      if (!Array.isArray(context)) {
        context = [context];
      }
      return new Utils.safeString(context.map(function (item) {
        var ext = Utils.getExt(item);
        var js = '<script src="' + opts.assets + '/js/' + item + '"></script>';
        var coffee = '<script type="text/coffeescript" src="' + opts.assets + '/js/' + item + '"></script>';
        switch (ext) {
          case "js":
            return js;
          case "coffee":
            return coffee;
          default:
            return js;
        }
      }).join("\n"));
    },

    /**
     * {{#ul}}
     *   <li></li>
     * {{/ul}}
     * Block helper for creating unordered lists.
     * @param  {[type]} context [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    ul: function (context, options) {
      return ("<ul " + (HTML.parseAttributes(options.hash)) + ">") + context.map(function (item) {
        return "<li>" + (options.fn(item)) + "</li>";
      }).join("\n") + "</ul>";
    },

    /**
     * {{#ol}}
     *   <li></li>
     * {{ol}}
     * Block helper for creating ordered lists.
     * @param  {[type]} context [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    ol: function (context, options) {
      return ("<ol " + (HTML.parseAttributes(options.hash)) + ">") + context.map(function (item) {
        return "<li>" + (options.fn(item)) + "</li>";
      }).join("\n") + "</ol>";
    },

    napJs: function (packageName) {
      return nap.js(packageName).replace('/assets/', opts.assets);
    },

    napCss: function (packageName) {
      return nap.css(packageName).replace('/assets/', opts.assets);
    },

    /**
     * {{thumbnailImage}}
     * Returns a figure with a thumbnail linked to a full picture
     * @author: Marie Hogebrandt <https://github.com/Melindrea>
     * @param  {[type]} context Object with values
     * @return {[type]}         HTML figure with image and optional caption/link
     */
    thumbnailImage: function (context) {
      var figure = '', link = context.full || false, image,
      imageAttributes = {
        alt: context.alt,
        src: context.thumbnail,
        width: context.size.width,
        height: context.size.height
      },
      figureAttributes = {
        id: 'image-' + context.id
      },
      linkAttributes = {
        href: link,
        rel: 'thumbnail'
      };

      if (context.classes) {
        if (context.classes.image) {
          imageAttributes.class = context.classes.image.join(' ');
        }

        if (context.classes.figure) {
          figureAttributes.class = context.classes.figure.join(' ');
        }

        if (context.classes.link) {
          linkAttributes.class = context.classes.link.join(' ');
        }
      }
      figure += '<figure ' + HTML.parseAttributes(figureAttributes) + '>\n';

      image = '<img ' + HTML.parseAttributes(imageAttributes) + '>\n';

      if (link) {
        figure += '<a ' + HTML.parseAttributes(linkAttributes) + '>\n' + image + '</a>\n';
      } else {
        figure += image;
      }

      if (context.caption) {
        figure += '<figcaption>' + context.caption + '</figcaption>\n';
      }
      figure += '</figure>';
      return new Handlebars.SafeString(figure);
    }
  };

  for (var helper in helpers) {
    if (helpers.hasOwnProperty(helper)) {
      Handlebars.registerHelper(helper, helpers[helper]);
    }
  }
};
