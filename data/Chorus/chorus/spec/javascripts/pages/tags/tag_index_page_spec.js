describe("chorus.pages.TagIndexPage", function() {
    beforeEach(function() {
        spyOn(chorus.pages.TagIndexPage.prototype, "render").andCallThrough();
        this.page = new chorus.pages.TagIndexPage();
        this.tagSet = new chorus.collections.TagSet();
    });


    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        });

        it('displays the page title', function() {
            expect(this.page.$('h1[title=Tags]')).toContainTranslation("tags.title_plural");
        });
    });

    describe("when the tags have loaded", function() {
        beforeEach(function() {
            this.fetchedTags = [{ id: 1, name: "IamTag"}, { id:2, name: "IamAlsoTag" }];
            this.server.completeFetchAllFor(this.tagSet, this.fetchedTags);
        });

        it("displays the tags", function() {
            _.each(this.fetchedTags, function(tag) {
                expect(this.page.$('.content')).toContainText(tag.name);
            }, this);
        });

        it("loads the correct count", function() {
            expect(this.page.$('.count')).toContainText(this.fetchedTags.length);
        });
    
        describe("selecting the first tag", function(){
            beforeEach(function(){
                this.page.$('.item_wrapper:eq(0)').click();
            });

            it("shows it on the sidebar", function() {
                var firstTag = this.page.$('.tag_item:first .name').text();
                var $tag_title = this.page.$('.tag_title');
                expect($tag_title).toContainText(firstTag);
            });
        });
    });

    describe("when a tag has been destroyed", function() {
        beforeEach(function() {
            this.fetchedTags = [{ name: "IamTag"}, { name: "IamAlsoTag" }];
            this.server.completeFetchAllFor(this.tagSet, this.fetchedTags);
        });

        it("renders the page", function() {
            var renderCallCount = this.page.render.calls.count();
            this.page.mainContent.collection.models[0].destroy();
            expect(this.page.render.calls.count()).toBe(renderCallCount + 1);
        });
    });
});
