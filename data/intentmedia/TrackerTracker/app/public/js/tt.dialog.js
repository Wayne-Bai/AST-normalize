// Modal dialog

var TT = TT || {};
TT.Dialog = (function () {

  var pub = {};

  pub.open = function (content, options) {
    pub.close(function () {
      $('body').addClass('has-modal-dialog');
      var html = TT.View.render('modalDialog', { content: content });
      var element = TT.View.attach(html, 'body');

      if (options && options.fullscreen) {
        $('.modal-dialog').addClass('modal-dialog-fullscreen').find('.container').css({
          width: $(window).width() - 100,
          minHeight: $(window).height() - 100
        });
      }
    });
  };

  pub.close = function (callback) {
    $('body').removeClass('has-modal-dialog');
    $('.modal-dialog, .modal-dialog-overlay').remove();
    if (TT.Utils.isFunction(callback)) {
      callback();
    }

    return false;
  };

  return pub;

}());
