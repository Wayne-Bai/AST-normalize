describe('chorus.handlebarsHelpers.iteration', function() {
    describe("ifAll", function () {
        it("throws an exception if no arguments were passed", function () {
            var exceptionThrown;
            try {
                Handlebars.helpers.ifAll([]);
            } catch (e) {
                exceptionThrown = e;
            }
            expect(exceptionThrown).toMatch(/argument/);
        });

        context("when an else block is present", function () {
            beforeEach(function () {
                this.template = "{{#ifAll first second}}yes{{else}}no{{/ifAll}}";
            });

            it("renders the else block if any arguments are falsy", function () {
                var context = {first:true, second:false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("no");
            });

            it("renders the block if all arguments are truthy", function () {
                var context = {first:true, second:'this string is not normally truthy in IE8'};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("yes");
            });
        });

        context("when an else block is not present", function () {
            beforeEach(function () {
                this.template = "{{#ifAll first second}}yes{{/ifAll}}";
            });

            it("renders nothing if any arguments are falsy", function () {
                var context = {first:true, second:false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("");
            });

            it("renders the block if all arguments are truthy", function () {
                var context = {first:true, second:true};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("yes");
            });
        });
    });

    describe("ifAny", function () {
        it("throws an exception if no arguments were passed", function () {
            var exceptionThrown;
            try {
                Handlebars.helpers.ifAny([]);
            } catch (e) {
                exceptionThrown = e;
            }
            expect(exceptionThrown).toMatch(/argument/);
        });

        context("when an else block is present", function () {
            beforeEach(function () {
                this.template = "{{#ifAny first second}}yes{{else}}no{{/ifAny}}";
            });

            it("renders the else block if all arguments are falsy", function () {
                var context = {first:false, second:false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("no");
            });

            it("renders the block if any arguments are truthy", function () {
                var context = {first:false, second:'hello'};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("yes");
            });
        });

        context("when an else block is not present", function () {
            beforeEach(function () {
                this.template = "{{#ifAny first second}}yes{{/ifAny}}";
            });

            it("renders nothing if all arguments are falsy", function () {
                var context = {first:false, second:false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("");
            });

            it("renders the block if any arguments are truthy", function () {
                var context = {first:'ie8 is cool', second:false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("yes");
            });
        });
    });

    describe("eachFunctionResult", function () {
        var fake = function () {
            return ["1", "2"];
        };

        beforeEach(function () {
            spyOn(fake, "apply").andReturn(["3"]);
            this.template = "{{#eachFunctionResult attachment}}numTimes{{/eachFunctionResult}}";
        });

        it("renders the block with all the arguments", function () {
            var context = {attachment:fake};
            var string = Handlebars.compile(this.template)(context);
            expect(string).toBe("numTimes");
        });
    });
});