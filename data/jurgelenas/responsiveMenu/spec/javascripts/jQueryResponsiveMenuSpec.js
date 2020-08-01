(function() {
  describe("jQuery.responsiveMenu", function() {
    beforeEach(function() {
      var dummyDiv;
      loadFixtures("oneLevelMenu.html");
      this.one = $("#one-level-menu");
      dummyDiv = $('<div id="dummy"></div>');
      dummyDiv.appendTo("body");
      this.options = {
        switchWidth: 555,
        appendTo: "#dummy"
      };
      afterEach(function() {
        return $("#dummy").remove();
      });
      return this.addMatchers({
        toBeHtmlStuctureEqual: function(expected) {
          var removeGarbage;
          removeGarbage = function(html) {
            html = html.split(' style="display:none;"').join('');
            html = html.split(' style="display:block;"').join('');
            html = html.split(' style="display: none;"').join('');
            html = html.split(' style="display: block;"').join('');
            return html;
          };
          return removeGarbage(this.actual) === expected;
        }
      });
    });
    describe("plugin options behavior", function() {
      it("should be available on the jQuery object", function() {
        return expect($.fn.responsiveMenu).toBeDefined();
      });
      it("should be chainable", function() {
        return expect(this.one.responsiveMenu()).toBe(this.one);
      });
      it("should offer default values", function() {
        var plugin;
        plugin = this.one.responsiveMenu().data("responsiveMenu");
        return expect(plugin.defaults).toBeDefined();
      });
      return it("should overwrite the defaults", function() {
        var options, plugin;
        options = {
          switchWidth: 555,
          currentClass: "this-is",
          appendTo: "#here",
          visualTab: "+",
          manualMediaQueries: true,
          label: "Label"
        };
        plugin = this.one.responsiveMenu(options).data("responsiveMenu");
        expect(plugin.options.switchWidth).toBe(options.switchWidth);
        expect(plugin.options.currentClass).toBe(options.currentClass);
        expect(plugin.options.appendTo).toBe(options.appendTo);
        expect(plugin.options.visualTab).toBe(options.visualTab);
        expect(plugin.options.manualMediaQueries).toBe(options.manualMediaQueries);
        return expect(plugin.options.label).toBe(options.label);
      });
    });
    describe("manualMediaQueries", function() {
      describe("when it is set to false", function() {
        beforeEach(function() {
          return this.plugin = this.one.responsiveMenu(this.options).data("responsiveMenu");
        });
        it("should trigger onResize method", function() {
          spyOn(this.plugin, 'onResize');
          $(window).trigger('resize');
          return expect(this.plugin.onResize).toHaveBeenCalled();
        });
        it("should hide select menu and show actual menu when window width is wider than switchWidth", function() {
          var fakeEvent;
          fakeEvent = {
            width: function() {
              return 600;
            }
          };
          this.plugin.onResize(fakeEvent);
          expect(this.one).toBeVisible();
          return expect($('#dummy select')).toBeHidden();
        });
        return it("should show select menu and hide an actual menu when window width is narrower than switchWidth", function() {
          var fakeEvent;
          fakeEvent = {
            width: function() {
              return 500;
            }
          };
          this.plugin.onResize(fakeEvent);
          expect(this.one).toBeHidden();
          return expect($('#dummy select')).toBeVisible();
        });
      });
      return describe("when it is set to true", function() {
        beforeEach(function() {
          var options;
          options = {
            appendTo: "#dummy",
            manualMediaQueries: true
          };
          return this.plugin = this.one.responsiveMenu(options).data("responsiveMenu");
        });
        return it("shouldn't change visibility of menus", function() {
          spyOn(this.plugin, 'onResize');
          $(window).trigger('resize');
          return expect(this.plugin.onResize).not.toHaveBeenCalled();
        });
      });
    });
    describe("with one level menu", function() {
      it("should generate correct html tree", function() {
        var a, generatedHtml, shouldBeGenerated;
        shouldBeGenerated = '<select class="responsive-select-menu">' + '<option value="#one">One</option>' + '<option value="#two">Two</option>' + '<option value="#three">Three</option>' + '<option value="#four">Four</option></select>';
        a = this.one.responsiveMenu(this.options).data("responsiveMenu");
        generatedHtml = a.select.parent().html();
        return expect(generatedHtml).toBeHtmlStuctureEqual(shouldBeGenerated);
      });
      return it("should set a selected on current page item", function() {
        var generatedHtml, shouldBeGenerated;
        loadFixtures('oneLevelMenuWithCurrent.html');
        this.withCurrent = $('#one-level-menu-with-current');
        shouldBeGenerated = '<select class="responsive-select-menu">' + '<option value="#one">One</option>' + '<option value="#two" selected="selected">Two</option>' + '<option value="#three">Three</option>' + '<option value="#four">Four</option></select>';
        generatedHtml = this.withCurrent.responsiveMenu(this.options).data("responsiveMenu").select.parent().html();
        return expect(generatedHtml).toBeHtmlStuctureEqual(shouldBeGenerated);
      });
    });
    describe("with multi-level menu", function() {
      beforeEach(function() {
        loadFixtures("multiLevelMenu.html");
        this.multi = $("#multi-level-menu");
        loadFixtures("multiLevelMenuWithCurrent.html");
        return this.multiWithCurrent = $("#multi-level-with-current-menu");
      });
      it("should generate corrent html tree", function() {
        var generatedHtml, shouldBeGenerated;
        shouldBeGenerated = '<select class="responsive-select-menu">' + '<option value="#one">One</option>' + '<option value="#two">Two</option>' + '<option value="#sub-one">-- Sub-one</option>' + '<option value="#sub-sub-one">---- Sub-Sub-one</option>' + '<option value="#sub-sub-two">---- Sub-Sub-two</option>' + '<option value="#sub-two">-- Sub-two</option>' + '<option value="#three">Three</option>' + '<option value="#four">Four</option>' + '</select>';
        generatedHtml = this.multi.responsiveMenu(this.options).data("responsiveMenu").select.parent().html();
        return expect(generatedHtml).toBeHtmlStuctureEqual(shouldBeGenerated);
      });
      return it("should correctly set in select menu current page item on multilevel menu", function() {
        var generatedHtml, shouldBeGenerated;
        shouldBeGenerated = '<select class="responsive-select-menu">' + '<option value="#one">One</option>' + '<option value="#two">Two</option>' + '<option value="#sub-one">-- Sub-one</option>' + '<option value="#sub-sub-one">---- Sub-Sub-one</option>' + '<option value="#sub-sub-two" selected="selected">---- Sub-Sub-two</option>' + '<option value="#sub-two">-- Sub-two</option>' + '<option value="#three">Three</option>' + '<option value="#four">Four</option>' + '</select>';
        generatedHtml = this.multiWithCurrent.responsiveMenu(this.options).data("responsiveMenu").select.parent().html();
        return expect(generatedHtml).toBeHtmlStuctureEqual(shouldBeGenerated);
      });
    });
    return describe("with label set", function() {
      return it("should render select with label", function() {
        var a, generatedHtml, options, shouldBeGenerated;
        options = {
          switchWidth: 555,
          appendTo: "#dummy",
          label: "Menu"
        };
        shouldBeGenerated = '<select class="responsive-select-menu">' + '<option value="#no-redirect">Menu</option>' + '<option value="#one">One</option>' + '<option value="#two">Two</option>' + '<option value="#three">Three</option>' + '<option value="#four">Four</option></select>';
        a = this.one.responsiveMenu(options).data("responsiveMenu");
        generatedHtml = a.select.parent().html();
        return expect(generatedHtml).toBeHtmlStuctureEqual(shouldBeGenerated);
      });
    });
  });

}).call(this);
