describe("chorus.views.KaggleFilter", function () {
    beforeEach(function () {
        this.model = new chorus.models.KaggleFilter({name: 'rank'});
        this.view = new chorus.views.KaggleFilter({model: this.model});
    });

    it("should have kaggle column set as collection", function () {
        expect(this.view.collection).toBeA(chorus.collections.KaggleColumnSet);
    });

    it("should have a KaggleFilter model", function () {
        expect(this.view.model).toBeA(chorus.models.KaggleFilter);
    });

    describe("#render", function() {
        beforeEach(function () {
            this.selectMenuStub = stubSelectMenu();
            spyOn(chorus, "styleSelect").andCallThrough();
            this.model.set({'input': { value: "QSAR"}});
            this.view.render();
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.view.collection.length);
            var view = this.view;
            view.collection.each(function(model, index) {
                var option = view.$(".column_filter option:eq(" + index + ")");
                expect(option).toContainText(model.get("name"));
            }, this);
        });

        it("populates the competition_type's select options", function() {
            var list = ["actuarial", "binary classification", "computer vision", "credit", "data manipulation",
                "exploratory", "finance", "government", "graph", "health", "high dimensionality", "insurance",
                "life sciences", "multiclass classification", "natural language processing", "public policy",
                "QSAR", "ranking", "regression", "research", "retail", "semi-supervised learning", "social",
                "start-ups", "supervised learning", "time series", "unstructured", "unsupervised learning",
                "visualization"];

            var view = this.view;
            expect(this.view.$(".filter.competition_type select option").length).toBe(list.length);
            _.each(list, function(name, index) {
                var option = view.$(".filter.competition_type select option:eq(" + index + ")");
                expect(option).toContainText(name);
            }, this);
            expect(this.view.$(".filter.competition_type select option:selected").length).toBe(1);
            expect(this.view.$(".filter.competition_type select option:selected").eq(0).attr('value')).toBe('QSAR');
        });

        it("does not have the aliased_name", function() {
            expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        describe("clicking on the remove button", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "deleted");
                this.view.$(".remove").click();
            });

            it("raises the deleted event", function() {
                expect("deleted").toHaveBeenTriggeredOn(this.view);
            });
        });

        describe("#validateInput", function() {
            describe("with a numeric column", function() {
                beforeEach(function() {
                    this.view.collection.models[0].set({name: "Rank"});
                    this.view.render();
                    spyOn(this.view.map, "performValidation").andCallThrough();
                    spyOn(this.view, "markInputAsInvalid");

                    this.view.$(".filter.default input").val("123");
                });

                it("passes the input argument to the right method", function() {
                    this.view.validateInput();
                    expect(this.view.map).toBeA(chorus.models.KaggleFilterMaps.Numeric);
                    expect(this.view.map.performValidation).toHaveBeenCalledWith({ value: "123" });
                });

                it("adds a qtip with invalid input", function() {
                    this.view.$(".filter.default input").val("abc");
                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).toHaveBeenCalled();
                    var args = this.view.markInputAsInvalid.lastCall().args;

                    expect(args[0]).toBe(this.view.$(".filter.default input"));
                    expect(args[1]).toMatchTranslation("kaggle.filter.rank_required");
                });

                it("does not add a qtip with valid input", function() {
                    this.view.validateInput();
                    expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
                });
            });
        });

        describe("columns with name: location ( String )", function() {
            beforeEach(function() {
                this.view.collection.models[1].set({name: "Location"});
                this.view.columnFilter.selectColumn(this.view.collection.at(1));
            });

            it("adds a second select with the string options", function() {
                expect(this.view.$("option")).toContainTranslation("kaggle.filter.includes");
            });

            describe("when choosing a comparator", function() {
                it("correctly shows the input for equal", function() {
                    this.view.$(".comparator").val("equal").change();
                    expect(this.view.$(".filter.default")).not.toHaveClass('hidden');
                });
            });

        });

        describe("columns with name: competition_type ( CompetitionType )", function() {
            beforeEach(function() {
                this.view.collection.models[1].set({name: "Past Competition Types"});
                this.view.columnFilter.selectColumn(this.view.collection.at(1));
            });

            it("adds a second select with the string options", function() {
                expect(this.view.$("option")).toContainTranslation("kaggle.filter.equal");
            });

            describe("when choosing a comparator", function() {
                it("correctly shows the input for equal comparator", function() {
                    this.view.$(".comparator").val("equal").change();
                    expect(this.view.$(".filter.competition_type")).not.toHaveClass('hidden');
                });
            });
        });

        describe("columns with name: Competition ( Numeric )", function() {
            beforeEach(function() {
                this.view.collection.models[0].set({typeCategory: "REAL_NUMBER"});
                this.view.render();

                this.keys = [
                    "greater",
                    "less"
                ];
            });

            it("adds a second select with the numeric options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("kaggle.filter." + key);
                });
            });

            describe("when choosing an option", function () {
                _.each(_.keys(chorus.models.DatasetFilterMaps.Numeric.prototype.comparators), function (key) {
                    it("correctly shows the input for " + key, function () {
                        this.view.$(".comparator").val(key).change();
                        expect(this.view.$(".filter.default")).not.toHaveClass('hidden');
                    });
                });
            });
        });


    });
});