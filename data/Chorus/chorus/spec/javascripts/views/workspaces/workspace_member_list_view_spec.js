describe("chorus.views.WorkspaceMemberList", function() {
    var members;
    beforeEach(function() {
        this.modalSpy = stubModals();
        this.workspace = backboneFixtures.workspace();
        members = this.members = this.workspace.members();
    });

    context('when the view is instantiated without members', function(){
        beforeEach(function(){
            this.view = new chorus.views.WorkspaceMemberList();
        });

        it('renders an empty collection',function(){
            expect(this.view.$(".members li a").length).toEqual(0);
        });
    });

    context('when the view is instantiated with members', function(){
        beforeEach(function(){
            this.view = new chorus.views.WorkspaceMemberList({collection: this.workspace.members()});
        });

        describe("when there are fewer than 24 members", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.members,
                    [backboneFixtures.user({id: 123}), backboneFixtures.user({id: 456})],
                    {requireRows: true},
                    {records:2}
                );
            });

            it("includes an image for each member", function() {
                var images = this.view.$(".members img");
                expect(images.length).toBe(2);
                expect(images.eq(0).attr("src")).toBe(this.members.models[0].fetchImageUrl({ size: "icon" }));
                expect(images.eq(1).attr("src")).toBe(this.members.models[1].fetchImageUrl({ size: "icon" }));
            });

            it("has a title for each member that is their display Name", function() {
                var links = this.view.$(".members li a");
                expect(links.eq(0).attr("title")).toBe(this.members.models[0].displayName());
                expect(links.eq(1).attr("title")).toBe(this.members.models[1].displayName());
            });

            it("includes a link to each member's page", function() {
                var links = this.view.$(".members li a");
                expect(links.length).toBe(2);
                expect(links.eq(0).attr("href")).toBe(this.members.models[0].showUrl());
                expect(links.eq(1).attr("href")).toBe(this.members.models[1].showUrl());
            });

            it("does not have the more workspace members link", function() {
                expect(this.view.$(".members a.more_members")).not.toExist();
            });

            describe("when a workspace:selected event is trigger", function() {
                beforeEach(function() {
                    this.workspace = backboneFixtures.workspace({id: 456});
                });

                it("fetches and renders members from the new workspace", function() {
                    expect(this.view.$(".members li a").length).toEqual(2);
                    chorus.PageEvents.trigger("workspace:selected", this.workspace);
                    this.server.completeFetchAllFor(this.workspace.members(),
                        [backboneFixtures.user({id: 123})],
                        {records:1}
                    );
                    expect(this.view.$(".members li a").length).toEqual(1);
                });
            });
        });

        describe("when there are more than 24 members", function() {
            beforeEach(function() {
                var memberList = _.map(_.range(0,25), function(id) {
                    return backboneFixtures.user({id: id});
                });
                this.server.completeFetchAllFor(this.members,
                    memberList,
                    {requireRows: true},
                    {records: memberList.length}
                );
            });

            it("only shows the first 24 images", function() {
                expect(this.view.$(".members img").length).toBe(24);
            });

            it("has a X more workspace members link", function() {
                expect(this.view.$(".members a.more_members")).toExist();
            });

            itBehavesLike.aDialogLauncher("a.more_members", chorus.dialogs.WorkspaceMembersMore);
        });

        it('setting the workspace a second time does not fetch the members', function(){
            this.server.reset();
            chorus.PageEvents.trigger("workspace:selected", this.workspace);
            expect(this.server.fetches().length).toEqual(0);
        });

        it('resetting the members causes a re-render', function() {
            expect(this.view.$(".members li a").length).toEqual(0);
            members.reset([backboneFixtures.user()]);
            expect(this.view.$(".members li a").length).toEqual(1);
        });
    });

    describe("when a workspace:selected event is trigger", function() {
        beforeEach(function() {
            this.view = new chorus.views.WorkspaceMemberList();
            this.workspace = backboneFixtures.workspace({id: 456});
            this.workspace.members().reset([backboneFixtures.user({id: 789})]);
        });

        it("renders members from the new workspace", function() {
            expect(this.view.$(".members li a").length).toEqual(0);
            chorus.PageEvents.trigger("workspace:selected", this.workspace);
            expect(this.view.$(".members li a").length).toEqual(1);
        });
    });
});
