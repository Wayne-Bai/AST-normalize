describe("chorus.views.SearchWorkspace", function() {
    beforeEach(function() {
        this.result = backboneFixtures.searchResult({workspaces: {results: [
            {
                entityType: "workspace",
                id: "10000",
                "public": false,
                name: "ws",
                summary: "ws <i>other text</i>",
                owner: {
                    firstName: "EDC",
                    id: "InitialUser",
                    lastName: "Admin"
                },
                comments: [
                    {
                        "isPublished": false,
                        "body": "good version",
                        "isComment": false,
                        "id": "10020",
                        "workspaceId": "10000",
                        "isInsight": false,
                        "highlightedAttributes": {"body": ["good <em>version<\/em>"]},
                        "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}
                    }
                ]
            }
        ]}});

        this.model = this.result.workspaces().models[0];
        this.model.set("highlightedAttributes", {
            name: "<em>ws</em>",
            summary: "<em>ws</em> <i>other text</i>"
        });
        this.model.set("tags", [{ name: 'tag' }]);
        this.view = new chorus.views.SearchWorkspace({ model: this.model });
        this.view.render();
    });

    it("includes the correct workspace file icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe(this.model.defaultIconUrl());
    });

    it("has a link to the workspace for each workspace in the collection", function() {
        expect(this.view.$('a.name').attr('href')).toBe("#/workspaces/10000");
    });

    it("shows matching description", function() {
        expect(this.view.$el.html()).toContain("<em>ws</em> <i>other text</i>");
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>ws</em>");
    });

    it("shows comments", function() {
        expect(this.view.$(".comments .comment").length).toBe(1);
    });

    it("shows tags", function() {
        expect(this.view.$('.item_tag_list')).toContainText('tag');
    });

    context("the description does not contain the search string", function() {
        beforeEach(function() {
            this.result = backboneFixtures.searchResult({workspaces: {results: [
                {
                    entityType: "workspace",
                    id: "10000",
                    "public": false,
                    name: "ws",
                    summary: "<i>that is not highlighted</i>",
                    owner: {
                        firstName: "EDC",
                        id: "InitialUser",
                        lastName: "Admin"
                    },
                    comments: [
                        {
                            "isPublished": false,
                            "content": "good version",
                            "isComment": false,
                            "id": "10020",
                            "workspaceId": "10000",
                            "isInsight": false,
                            "highlightedAttributes": {"body": ["good <em>version<\/em>"]},
                            "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}
                        }
                    ]
                }
            ]}});

            this.model = this.result.workspaces().models[0];
            this.model.unset('highlightedAttributes');
            this.view = new chorus.views.SearchWorkspace({ model: this.model });
            this.view.render();
        });

        it("uses the displaySearchMatchFromSafeField method for the description", function() {
            expect(this.view.$el.html()).toContain("<i>that is not highlighted</i>");
        });
    });

    itBehavesLike.ItPresentsModelWithTags();
});
