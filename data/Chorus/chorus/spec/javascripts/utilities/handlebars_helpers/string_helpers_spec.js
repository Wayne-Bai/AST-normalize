describe('chorus.handlebarsHelpers.string', function() {
    describe("encode", function () {
        beforeEach(function () {
            this.template = "{{encode value}}";
        });

        it("encodes the appropriate entities", function () {
            var context = {value:"% /xyz"};
            var string = Handlebars.compile(this.template)(context);
            expect(string).toBe("%25%20%2Fxyz");
        });

        it("handles html-ish stuff correctly", function () {
            var context = {value:"<stuff>"};
            var string = Handlebars.compile(this.template)(context);
            expect(string).toBe("%3Cstuff%3E");
        });
    });

    describe("pluralize", function () {
        it("passes arguments through to the translate function", function () {
            expect(Handlebars.helpers.pluralize(1, "test.mouse_with_param", { hash:{ param:"James" }}))
                .toMatchTranslation("test.mouse_with_param", { param:"James" });
            expect(Handlebars.helpers.pluralize(2, "test.mouse_with_param", { hash:{ param:"Henry" }}))
                .toMatchTranslation("test.mouse_with_param_plural", { param:"Henry" });
        });

        context("when the first argument is an array", function () {
            it("uses the singular string if there is only one element", function () {
                expect(Handlebars.helpers.pluralize([1], "breadcrumbs.home"))
                    .toMatchTranslation("breadcrumbs.home");
            });

            context("when there is more than one element", function () {
                context("and no plural string is present", function () {
                    it("adds an 's' to the singular string", function () {
                        expect(Handlebars.helpers.pluralize([1, 2], "breadcrumbs.home"))
                            .toBe(t("breadcrumbs.home") + "s");
                    });
                });

                context("and a plural string is present", function () {
                    it("uses the plural string", function () {
                        expect(Handlebars.helpers.pluralize([1, 2], "test.mouse"))
                            .toMatchTranslation("test.mouse_plural");
                    });
                });
            });
        });

        context("when the first argument is a number", function () {
            it("uses the singular string if the number is exactly one", function () {
                expect(Handlebars.helpers.pluralize(1, "breadcrumbs.home"))
                    .toMatchTranslation("breadcrumbs.home");
            });

            context("when there is more than one element", function () {
                context("and no plural string is present", function () {
                    it("adds an 's' to the singular string", function () {
                        expect(Handlebars.helpers.pluralize(3, "breadcrumbs.home"))
                            .toBe(t("breadcrumbs.home") + "s");
                    });
                });

                context("and a plural string is present", function () {
                    it("uses the plural string", function () {
                        expect(Handlebars.helpers.pluralize(3, "test.mouse"))
                            .toMatchTranslation("test.mouse_plural");
                    });
                });
            });
        });
    });

    describe("renderTableData", function () {
        beforeEach(function () {
            this.template = "{{renderTableData x}}";
        });

        it("renders the string false for the boolean false", function () {
            var context = {x:false};
            var string = Handlebars.compile(this.template)(context);
            expect(string).toContainText("false");
        });

        it("renders the string 0 for the number 0", function () {
            var context = {x:0};
            var string = Handlebars.compile(this.template)(context);
            expect(string.toString()).toContainText("0");
        });

        it("renders &nbsp; for null", function () {
            var context = {x:null};
            var string = Handlebars.compile(this.template)(context);
            expect(string).toContainText("&nbsp;");
        });

        it("renders NaN for NaN", function () {
            var context = {x:NaN};
            var string = Handlebars.compile(this.template)(context);
            expect(string.toString()).toContainText("NaN");
        });
    });

    describe("hotKeyName", function () {
        it("uses chorus.hotKeyMeta to construct a human-readable hot key description", function () {
            expect(Handlebars.helpers.hotKeyName('k')).toBe(_.str.capitalize(chorus.hotKeyMeta) + " + k");
        });
    });
});
