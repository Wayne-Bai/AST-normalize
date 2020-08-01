describe("chorus.Mixins.Urls", function() {
    beforeEach(function() {
        this.object = backboneFixtures.workspace({ id: '45' });
        this.object.isDeleted = function() { return false; };
    });

    describe("#showUrl", function() {
        context("when model is deleted", function() {
            beforeEach(function() {
                this.object.isDeleted = function() { return true; };
            });

            it("is empty", function() {
                expect(this.object.showUrl()).toBeNull();
            });
        });

        it("is present", function() {
            expect(this.object.showUrl()).not.toBeNull();
        });

        context("when showUrlTemplate is not set", function() {
            beforeEach(function() {
                this.object.showUrlTemplate = null;
            });

            it("throws an exception", function() {
                expect(_.bind(this.object.showUrl, this.object)).toThrow("No showUrlTemplate defined");
            });
        });

        context("when showUrlTemplate is a function", function() {
            beforeEach(function() {
                this.object.showUrlTemplate = function(suffix) {
                    return "my_items/show/foo/{{id}}/" + suffix;
                };
            });

            it("calls the function with any arguments passed to 'showUrl'", function() {
                expect(this.object.showUrl("banana")).toBe("#/my_items/show/foo/45/banana");
            });
        });

        context("when showUrlTemplate is not a function", function() {
            beforeEach(function() {
                this.object.showUrlTemplate = "my_items/show/{{id}}";
            });

            it("returns #/{{showUrlTemplate}}", function() {
                this.object.showUrlTemplate = "my_items/show/{{id}}";
                expect(this.object.showUrl()).toBe("#/my_items/show/45");
            });
        });
        
        context("#showLink", function() {
            it("shows the link with the model's name", function () {
                expect(this.object.showLink().string).toBe('<a href="#/workspaces/45">Public</a>');
            });

            it("shows the link with the given text", function () {
                expect(this.object.showLink("HI").string).toBe('<a href="#/workspaces/45">HI</a>');
            });


        });
    });
});
