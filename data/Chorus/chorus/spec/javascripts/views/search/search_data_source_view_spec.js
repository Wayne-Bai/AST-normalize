describe("chorus.views.SearchDataSource", function() {
    beforeEach(function() {
        this.model = backboneFixtures.hdfsDataSource();
        this.model.tags().reset([{name: "tag1"}, {name: "tag2"}]);
        this.view = new chorus.views.SearchDataSource({ model: this.model });
        this.view.render();
    });


    it('includes the data source icon', function() {
        expect(this.view.$("img.provider").attr("src")).toBe(this.model.providerIconUrl());
    });

    it("includes the state icon", function() {
        expect(this.view.$("img.state").attr("src")).toBe(this.model.stateIconUrl());
    });

    it("includes the state text as a title", function() {
        expect(this.view.$("img.state").attr("title")).toBe(this.model.stateText());
    });

    it('has a link to the data source for each data source in the collection', function() {
        expect(this.view.$('.name').attr('href')).toBe(this.model.showUrl());
    });

    describe("tags", function () {
        it("should show a list of tags", function () {
            expect(this.view.$('.item_tag_list')).toContainTranslation("tag_list.title");
            expect(this.view.$('.item_tag_list')).toContainText("tag1 tag2");
        });

        it("tags should link to the tag show page", function () {
            expect(this.view.$(".item_tag_list a:contains(tag1)").attr("href")).toEqual("#/tags/tag1");
        });
    });

    describe("comments", function() {
        beforeEach(function() {
            this.view.model.set({
                comments: [
                    {
                        "lastUpdatedStamp": "2012-03-07 17:19:14",
                        "isPublished": false,
                        "content": "what an awesome data source",
                        "isComment": false,
                        "id": "10120",
                        "isInsight": true,
                        "highlightedAttributes": {
                            "content": ["what an <em>awesome<\/em> data source"]
                        },
                        "owner": {
                            "id": "InitialUser",
                            "lastName": "Admin",
                            "firstName": "EDC"
                        }
                    }
                ]
            });
            this.view.render();
        });

        it("renders the comments", function() {
            expect(this.view.$(".search_result_comment_list .comment").length).toBe(1);
        });
    });

    itBehavesLike.ItPresentsModelWithTags();
});
