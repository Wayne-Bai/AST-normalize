(function ($, $$) {

    module("bootstrap-alerts")

      test("should provide no conflict", function () {
        var alert = Element.alert.noConflict()
        ok(!Element.alert, 'alert was set back to undefined (org value)')
        Element.alert = alert
      })

      test("should be defined on jquery object", function () {
        ok($(document.body).alert, 'alert method is defined')
      })

      test("should return element", function () {
        ok($(document.body).alert() == document.body, 'document.body returned')
      })

      test("should fade element out on clicking .close", function () {
        var $alertHTML = new Element('div.alert-message.warning.fade.in', { html:
            '<a class="close" href="#" data-dismiss="alert">×</a>'
          + '<p><strong>Holy guacamole!</strong> Best check yo self, you\'re not looking too good.</p>'
          + '</div>'
        })
          , alert = $alertHTML.alert()

        alert.fireEvent('click', {
            target: alert.getElement('.close'), 
            preventDefault: function(){ this.isDefaultPrevented = true }
        });
//      alert.find('.close').click()

        ok(!alert.hasClass('in'), 'remove .in class on .close click')
      })

      test("should remove element when clicking .close", function () {
        Browser.support.transition = false

        var $alertHTML = new Element('div.alert-message.warning.fade.in', { html: 
            '<a class="close" href="#" data-dismiss="alert">×</a>'
          + '<p><strong>Holy guacamole!</strong> Best check yo self, you\'re not looking too good.</p>'
        })
          , alert = $alertHTML.inject('qunit-fixture').alert()
          
        ok($('qunit-fixture').getElements('.alert-message').length, 'element added to dom')

        alert.fireEvent('click', { 
            target              : alert.getElement('.close'),
            preventDefault      : function(){ this.isDefaultPrevented = true; }
        });

        ok(!$('qunit-fixture').getElements('.alert-message').length, 'element removed from dom')
      })

      test("should not fire closed when close is prevented", function () {
        Browser.support.transition = false
        stop();
        new Element('div.alert')
          .addEvent('close', function (e) {
            e.preventDefault();
            ok(true);
            start();
          })
          .addEvent('closed', function () {
            ok(false);
          })
          .alert('close')
      })

}(document.id, document.getElements))