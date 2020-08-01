define([ "jquery", "public/assets/javascripts/lib/page/breadcrumbs.js" ], function($, Breadcrumbs) {

  "use strict";

  describe("Breadcrumbs", function() {

    var breadcrumbs;

    describe("Functionality", function() {

      beforeEach(function() {
        loadFixtures("breadcrumbs.html");
        breadcrumbs = new Breadcrumbs({});
      });

      it("updates the nav bar when given the place", function() {
        var $placeTitleLink = $(".js-place-title-link");

        breadcrumbs._updateNavBar({ slug: "foo", name: "Foo" });

        expect($placeTitleLink.attr("href")).toBe("/foo");
        expect($placeTitleLink.text()).toBe("Foo");
      });

      it("updates the breadcrumbs when given the html", function() {
        breadcrumbs._updateBreadcrumbs(".js-breadcrumbs-content");

        expect($(".js-breadcrumbs-content").html()).toBe("Bar");
      });

    });

  });
});
