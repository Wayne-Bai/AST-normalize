describe("chorus.pages.TagShowPage", function() {
    var tag, page;
    beforeEach(function() {
        tag = new chorus.models.Tag({name: "tag-name"});
        page = new chorus.pages.TagShowPage(tag.name());
    });

    describe("breadcrumbs", function() {
        beforeEach(function() {
            page.render();
        });

        it("displays the Tags breadcrumb", function() {
            var breadcrumbs = page.$("#breadcrumbs .breadcrumb a");

            expect(breadcrumbs.eq(0).attr("href")).toBe("#/tags");
            expect(breadcrumbs.eq(0).text()).toBe(t("breadcrumbs.tags"));

            expect(page.$("#breadcrumbs .breadcrumb .slug")).toContainText(tag.name());
        });
    });

    describe("#render", function() {
        context("when tags are found", function() {
            beforeEach(function() {
                page.render();
                this.server.completeFetchFor(page.search, backboneFixtures.searchResult());
            });

            it('displays the page title', function() {
                expect(page.$('h1')).toContainTranslation("tag.show.title", {name: "tag-name"});
            });

            it('marks Other Files as unavailable', function() {
                expect(page.$('.popup_filter li[data-type=attachment] span')).toHaveClass("unavailable");
            });
        });

        context("when no tags are found", function() {
            beforeEach(function() {
                page.render();
                this.server.completeFetchFor(page.search, backboneFixtures.emptySearchResult());
            });

            it("displays a special message", function() {
                expect(page.$('.sorry')).toContainTranslation("tag.show.no_results");
            });
        });
    });

    it("searches tags", function() {
        expect(page.search.get("isTag")).toBeTruthy();
    });
});
