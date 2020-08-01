/*! zfjk - v0.9.0 - 2013-04-05
* Copyright (c) 2013 ; Licensed  */
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.navmenu = {
    name : 'navmenu',

    init : function (scope, method, options) {

      var wp = $('.navsection'),
          ul = $('.navmenu'),
          li = $('.navmenu>li.submenu'),
          content,
          state;

      $(li, this).on('mouseenter', function (e) {

        content = $(this).children('.submenu-content');

        state = ul.find('.submenu.active, .submenu.locked').length > 0;

        ul.find('.submenu').removeClass('active locked');
        $(this).addClass('active locked');

        if (!state) {

          if (window.Zepto) {

            content.animate({ translate: '0, -300px' }, 0);
          }
          else {

            content.css({'transform': 'translate(0, -300px)'});
          }

          setTimeout(function () {

            if (window.Zepto) {

              content.animate({ translate: '0, 0' }, 290);
            }
            else {

              content.css({'transition': 'all 290ms linear', 'transform': 'translate(0,0)'});
            }
          }, 0);
        }
      });

      $(wp, this).on('mouseleave', function (e) {

        wp.find('.submenu').removeClass('active locked');
      });
    }
  };
}(Foundation.zj, this, this.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.panelexpose = {
    name : 'panelexpose',

    init : function (scope, method, options) {
      var self = this;
      this.scope = scope || this.scope;

      var meta   = $('meta[name=viewport]'),
          head   = $('html, body'),
          button = $('.toggle-menu a'),
          peek   = $('#peek'),
          sticky = $('#sticky'),
          page   = $('#scrollable'),
          panel  = $('#panelnav');

      if (window.Zepto) {

        $(this.scope)
          .on('swipeRight', page, function(e){

            if (!peek.hasClass('expose')) {

              button.trigger('click');
            }
          })

          .on('swipeLeft', page, function(e){

            if (peek.hasClass('expose')) {

              button.trigger('click');
            }
          });
      }

      button.click(function (e) {
        e.preventDefault();

        //meta.attr('content', 'width=device-width,minimum-scale=1.0');

        peek.toggleClass('expose');

        if (peek.hasClass('expose')) {

          /* Required. Otherwise, nasty horizontal scroll bar. */
          //$('html').css('overflow-x', 'hidden');
          //$('body').css('overflow-x', 'hidden');

          panel.show();

          if (window.Zepto) {

            peek.animate({translate: '250px, 0'}, 290);
          }
          else {

            peek.css({'transition': 'all 290ms linear', 'transform': 'translate(250px ,0)'});
          }

          page.click(function (e) {
            e.preventDefault();

            self.clean(head, meta, peek, sticky, page, panel, e);

          }); // end page click
        }
        else {

          self.clean(head, meta, peek, sticky, page, panel, e);

        } // end else
      }); // end button click
    },

    clean : function (head, meta, peek, sticky, page, panel, e) {
      var self = this;

      //meta.attr('content', 'width=device-width');

      if (window.Zepto) {

        peek.animate({translate: '0, 0'}, 150);
      }
      else {

        peek.css({'transition': 'all 150ms linear', 'transform': 'translate(0 ,0)'});
      }

      setTimeout(function () {

        peek
          .css('-webkit-transform', 'none')
          .css('-webkit-transform', '')
          .removeClass('expose');

        panel.hide();

        //$('html').css('overflow', 'hidden');
        //$('body').css('overflow', '');

        //$('html').css('overflow-x', 'visible');
        //$('body').css('overflow-x', 'visible');

      }, 300); // just longer than the expose
    }
  };
}(Foundation.zj, this, this.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.iosfix = {
    name : 'iosfix',

    init : function (scope, method, options) {
      var self = this;
      this.scope = scope || this.scope;

      var sticky = $('#sticky'),
          panel  = $('#panelnav');

      if(!/(ip(hone|od|ad))/i.test(navigator.userAgent))
        return false;

      $('input[type="text"], input[type="password"], input[type="search"], textarea').css('font-size', '1em');

      $('input')
        .focus(function(e) {

          sticky.add(panel).css('position', 'absolute');
        })

        .blur(function(e) {

          //window.offset({ top: 0, left: 0 });

          //sticky.add(panel).css({'top': 0, 'position': 'fixed'});
        });

      window.addEventListener("load",function() {

        setTimeout(function () {

          window.scrollTo(0, 1);

        }, 0);
      });
    }
  };
}(Foundation.zj, this, this.document));

$(document).foundation();