(function ($, $$) {
  // @note: document.body avilable after domready
//  window.addEvent('domready', function() {

	/**
	 * @var     Object   Mock Event object
	 */
	var testEvent = {
		preventDefault		: function(){ this.preventedDefault = true },
		isDefaultPrevented	: function(){ return !!this.preventedDefault },
		stopPropagation		: function(){}
	}

	/**
	 * Helper for testing MooTools deletaged events
	 *
	 * @param   String   type
	 * @param   Element  $target
	 *
	 * @return  Element  To allow chaining
	 */
	function fireDelegated(type, $target, $base) {
		if (!$base) {
			$base = $(document)
		}

		$base.fireEvent( type, Object.merge({ target: $target }, testEvent));

		return $target;
	}


    module("bootstrap-dropdowns")

      test("should provide no conflict", function () {
        var dropdown = Element.dropdown.noConflict()
        ok(!Element.dropdown, 'dropdown was set back to undefined (org value)')
        Element.dropdown = dropdown
      })

      test("should be defined on jquery object", function () {
        ok($(document.body).dropdown, 'dropdown method is defined')
      })

      test("should return element", function () {
        var el = new Element("div")
        ok(el.dropdown() === el, 'same element returned')
      })

      test("should not open dropdown if target is disabled", function () {
        var $dropdownHTML = new Element('ul.tabs', { html:
            '<li class="dropdown">'
          + '<button disabled href="#" class="btn dropdown-toggle" data-toggle="dropdown">Dropdown</button>'
          + '<ul class="dropdown-menu">'
          + '<li><a href="#">Secondary link</a></li>'
          + '<li><a href="#">Something else here</a></li>'
          + '<li class="divider"></li>'
          + '<li><a href="#">Another link</a></li>'
          + '</ul>'
          + '</li>'
            })
          , dropdown = $dropdownHTML.getElement('[data-toggle="dropdown"]').dropdown().fireEvent('click', testEvent)

        ok(!dropdown.getParent('.dropdown').hasClass('open'), 'open class added on click')
      })

      test("should add class open to menu if clicked", function () {
        var $dropdownHTML = new Element('ul.tabs', { html: 
            '<li class="dropdown">'
          + '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown</a>'
          + '<ul class="dropdown-menu">'
          + '<li><a href="#">Secondary link</a></li>'
          + '<li><a href="#">Something else here</a></li>'
          + '<li class="divider"></li>'
          + '<li><a href="#">Another link</a></li>'
          + '</ul>'
          + '</li>'
            })
          , dropdown = $dropdownHTML.getElement('[data-toggle="dropdown"]').dropdown().fireEvent('click', testEvent)

        ok(dropdown.getParent('.dropdown').hasClass('open'), 'open class added on click')
      })

	  test("should test if element has a # before assuming it's a selector", function () {
        var $dropdownHTML = new Element('ul.tabs', { html: 
            '<li class="dropdown">'
          + '<a href="/foo/" class="dropdown-toggle" data-toggle="dropdown">Dropdown</a>'
          + '<ul class="dropdown-menu">'
          + '<li><a href="#">Secondary link</a></li>'
          + '<li><a href="#">Something else here</a></li>'
          + '<li class="divider"></li>'
          + '<li><a href="#">Another link</a></li>'
          + '</ul>'
          + '</li>'
            })
          , dropdown = $dropdownHTML.getElement('[data-toggle="dropdown"]').dropdown().fireEvent('click', testEvent)

        ok(dropdown.getParent('.dropdown').hasClass('open'), 'open class added on click')
      })


      test("should remove open class if body clicked", function () {
        var $dropdownHTML = new Element('ul.tabs', { html: 
            '<li class="dropdown">'
          + '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown</a>'
          + '<ul class="dropdown-menu">'
          + '<li><a href="#">Secondary link</a></li>'
          + '<li><a href="#">Something else here</a></li>'
          + '<li class="divider"></li>'
          + '<li><a href="#">Another link</a></li>'
          + '</ul>'
          + '</li>'
            })
          , dropdown = $dropdownHTML
            .inject('qunit-fixture')
            .getElements('[data-toggle="dropdown"]')
            .dropdown()
            .fireEvent('click', testEvent)
        ok(dropdown.getParent('.dropdown').every(function($parent){ return $parent.hasClass('open') }), 'open class added on click')
//      ok(dropdown[0].getParent('.dropdown').hasClass('open'), 'open class added on click')
		$(document).fireEvent('click', testEvent); // need html, as event has been registered to it
        ok(!dropdown.getParent('.dropdown').every(function($parent){ return $parent.hasClass('open') }), 'open class removed')
//      ok(!dropdown[0].getParent('.dropdown').hasClass('open'), 'open class removed')
        dropdown.destroy()
      })

      test("should remove open class if body clicked, with multiple drop downs", function () {

		  var $dropdownHTML1 = new Element('ul.nav', { html:
			  '    <li><a href="#menu1">Menu 1</a></li>'
			+ '    <li class="dropdown" id="testmenu">'
            + '      <a class="dropdown-toggle" data-toggle="dropdown" href="#testmenu">Test menu <b class="caret"></b></a>'
            + '      <ul class="dropdown-menu" role="menu">'
            + '        <li><a href="#sub1">Submenu 1</a></li>'
            + '      </ul>'
            + '    </li>'
			  })
			, $dropdownHTML2 = new Element('div.btn-group', { html:
		      '    <button class="btn">Actions</button>'
            + '    <button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'
            + '    <ul class="dropdown-menu">'
            + '        <li><a href="#">Action 1</a></li>'
            + '    </ul>'
		      })
		   , dropdowns = document.id('qunit-fixture').adopt($dropdownHTML1, $dropdownHTML2).getElements('[data-toggle="dropdown"]')
		   , first = dropdowns[0]
		   , last = Array.from(dropdowns).getLast()

		 ok(dropdowns.length == 2, "Should be two dropdowns")
		 document.fireEvent('click', testEvent) // Delegated  `first.fireEvent('click');`
		 ok(first.getParents('.open').length == 1, 'open class added on click')
		 ok($$('#qunit-fixture .open').length == 1, 'only one object is open')
		 document.fireEvent('click', testEvent)
		 ok($$("#qunit-fixture .open").length === 0, 'open class removed')

		 document.fireEvent('click', testEvent )
		 ok(last.getParents('.open').length == 1, 'open class added on click')
		 ok($$('#qunit-fixture .open').length == 1, 'only one object is open')
		 document.fireEvent('click', testEvent)
		 ok($$("#qunit-fixture .open").length === 0, 'open class removed')

		 $("qunit-fixture").set('html', "");
      })
//  });
}(document.id, document.getElements))