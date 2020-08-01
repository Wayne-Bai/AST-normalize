jasmine.sharedExamples.ItPresentsModelWithTags = function() {
    var view;
    beforeEach(function() {
        view = new this.view.constructor({ model: this.model });
    });

    context("when the model has tags", function () {
        beforeEach(function () {
            this.model.tags().reset([{name: "tag1"}, {name: "tag2"}]);
            view.render();
        });

        it("should show a list of tags", function () {
            expect(view.$('.item_tag_list')).toContainTranslation("tag_list.title");
            expect(view.$('.item_tag_list')).toContainText("tag1 tag2");
        });

        it("tags should link to the tag show page", function () {
            expect(view.$(".item_tag_list a:contains(tag1)").attr("href")).toEqual("#/tags/tag1");
        });

        context("when the model has highlighted tags", function() {
            beforeEach(function() {
                this.model.set('highlightedAttributes', {tagNames:['<em>tag1</em>']});
                view.render();
            });

            it("highlights matching tags from search", function () {
                expect(this.view.$('.item_tag_list').html()).toContain("<em>tag1</em>");
                expect(this.view.$('.item_tag_list').html()).toContain("tag2");
            });
        });

        describe("when show tags in the context of a workspace", function() {
            beforeEach(function() {
                view = new this.view.constructor({ model: this.model, workspaceIdForTagLink: 123 });
                view.render();
            });

            it("tags link to the workspace-specific tag show page", function() {
                expect(view.$(".item_tag_list a:contains(tag1)").attr("href")).toEqual("#/workspaces/123/tags/tag1");
            });
        });
    });
};
