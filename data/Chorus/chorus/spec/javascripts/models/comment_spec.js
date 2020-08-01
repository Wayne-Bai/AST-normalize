describe("chorus.models.Comment", function() {
    beforeEach(function() {
        this.model = backboneFixtures.comment({
            id: '41',
            author: {
                id: "45",
                firstName: "LeBron",
                lastName: "James"
            }
        });
    });

    describe("#urlTemplate", function() {
        it("is just comments", function() {
            expect(this.model.url()).toContain("/comments/41");
        });
    });

    describe("validation", function() {
        it("should return a falsy value if there is no text", function() {
            this.model.set({ body: "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a text", function() {
            this.model.set({ body: "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });
    });

    describe("#note", function() {
        it("should return true for a note", function() {
            this.model.set({type: "NOTE"});
            expect(this.model.note()).toBeTruthy();
        });

        it("should return false for everything else", function() {
            this.model.set({type: "SUB_COMMENT"});
            expect(this.model.note()).toBeFalsy();
        });

        it("should return false when undefined", function() {
            this.model.unset("type");
            expect(this.model.note()).toBeFalsy();
        });
    });

    describe("#author", function() {
        beforeEach(function() {
            this.author = this.model.author();
        });

        it("returns a user with the right name", function() {
            expect(this.author.get("firstName")).toBe("LeBron");
            expect(this.author.get("lastName")).toBe("James");
        });

        it("memoizes", function() {
            expect(this.author).toBe(this.model.author());
        });
    });
});
