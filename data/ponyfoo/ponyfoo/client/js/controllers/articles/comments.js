'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus/global');
var throttle = require('../../lib/throttle');
var storage = require('../../lib/storage');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');
var textService = require('../../../../services/text');
var key = 'comment-draft';

module.exports = function (viewModel) {
  var composer = $('.mc-composer');
  var name = $('.mc-name');
  var email = $('.mc-email');
  var site = $('.mc-site');
  var content = $('.mc-content');
  var preview = $.findOne('.mc-preview');
  var send = $('.mc-send');
  var serializeSlowly = throttle(serialize, 200);
  var pony = convertToPonyEditor(content[0], preview);
  var comments = $('.mm-comments');
  var cancelReply = $('.mc-cancel-reply');
  var footer = $('.mm-footer');
  var gravatars = $('.mm-gravatar');

  $('.mm-thread-reply').removeClass('uv-hidden');

  composer.on('keypress keydown keyup paste', serializeSlowly);
  send.on('click', comment);
  comments.on('click', '.mm-thread-reply', attach);
  comments.on('click', '.mm-remove', remove);
  cancelReply.on('click', detach);
  deserialize();

  function deserialize () {
    var data = storage.get(key);
    if (data) {
      name.value(data.name);
      email.value(data.email);
      site.value(data.site);
      content.value(data.content);
      pony.refresh();
    }
  }

  function serialize () { storage.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: name.value(),
      email: email.value(),
      site: site.value(),
      content: content.value()
    };
  }

  function attach (e) {
    var button = $(e.target);
    var thread = button.parents('.mm-thread');
    var reply = thread.find('.mm-thread-reply');
    var replies = $('.mm-thread-reply').but(reply);
    replies.removeClass('uv-hidden');
    reply.addClass('uv-hidden').parent().before(composer);
    cancelReply.removeClass('uv-hidden');
    composer.find('.vw-conventional').remove();
  }

  function detach () {
    var replies = $('.mm-thread-reply');
    footer.append(composer);
    replies.removeClass('uv-hidden');
    cancelReply.addClass('uv-hidden');
    composer.find('.vw-conventional').remove();
  }

  function comment (e) {
    e.preventDefault();

    var thread = send.parents('.mm-thread');
    var endpoint = textService.format('/api/articles/%s/comments', viewModel.article.slug);
    var model = {
      json: getCommentData()
    };
    model.json.parent = thread.attr('data-thread');
    viewModel.measly.put(endpoint, model).on('data', commented);

    function commented (data) {
      content.value('');
      detach();
      serialize();
      raf(deserialize);
      appendResult(data);
    }

    function appendResult (data) {
      var placeholder = $('<div>');
      var template, target, partial;
      var model = {
        user: viewModel.user,
        article: {
          author: viewModel.article.author,
          commentThreads: [{
            comments: [data],
            id: data._id
          }]
        }
      };

      if (thread.length) {
        model.comment = data;
        template = 'articles/comment';
        target = thread.find('.mm-thread-footer');
      } else {
        template = 'articles/comment-thread';
        target = comments.find('.mm-footer');
      }
      taunus.partial(placeholder[0], template, model);
      partial = placeholder.children();
      partial.find('.mm-thread-reply').removeClass('uv-hidden');
      target.before(partial);
    }
  }

  function remove (e) {
    var button = $(e.target);
    var comment = button.parents('.mm-comment');
    var id = comment.attr('data-comment');
    var endpoint = textService.format('/api/articles/%s/comments/%s', viewModel.article.slug, id);

    viewModel.measly.delete(endpoint).on('data', cleanup);

    function cleanup () {
      var comments = $(textService.format('[data-comment="%s"]', id));
      var thread = $(textService.format('[data-thread="%s"]', id));
      if (thread.length && composer.parents(thread).length) {
        detach();
      }
      thread.and(comments).remove();
    }
  }
};
