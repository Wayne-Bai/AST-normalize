describe("chorus.views.DatasetFilter", function() {
    beforeEach(function() {
        this.dataset = backboneFixtures.workspaceDataset.datasetTable();
        this.collection = this.dataset.columns();
        this.collection.reset([backboneFixtures.databaseColumn(), backboneFixtures.databaseColumn()]);

        this.model = new chorus.models.DatasetFilter();
        this.view = new chorus.views.DatasetFilter({ model: this.model, collection: this.collection });
    });

    it("should have a tabular data filter model", function() {
        expect(this.view.model).toBeA(chorus.models.DatasetFilter);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.selectMenuStub = stubSelectMenu();
            spyOn(chorus, "styleSelect").andCallThrough();
            spyOn(chorus, 'datePicker').andCallThrough();

            this.view.render();
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.collection.length);
            var view = this.view;

            this.collection.each(function(model, index) {
                var option = view.$(".column_filter option:eq(" + index + ")");
                expect(option).toContainText(model.get("name"));
                expect(option).toHaveAttr("value", chorus.Mixins.dbHelpers.ensureDoubleQuoted(model.dataset.get("objectName"), model.get("name")));
            }, this);
        });


        it("creates a datepicker widget associated with the year, month and day input fields", function() {
            expect(chorus.datePicker).toHaveBeenCalled();

            var datePickerOptions = chorus.datePicker.lastCall().args[0];
            expect(datePickerOptions["%Y"]).toBe(this.view.$(".filter.date input[name='year']"));
            expect(datePickerOptions["%m"]).toBe(this.view.$(".filter.date input[name='month']"));
            expect(datePickerOptions["%d"]).toBe(this.view.$(".filter.date input[name='day']"));
        });


        context("when a column is selected", function() {
            beforeEach(function() {
                this.view.columnFilter.selectColumn(this.collection.at(1));
            });

            it("should update the model", function() {
                expect(this.view.model.get("column")).toEqual(this.collection.at(1));
            });

            context("when a comparator is selected", function() {
                beforeEach(function() {
                    this.view.model.unset("comparator");
                    this.view.$("select.comparator option[value=not_equal]").prop('selected', true).change();
                });

                context("and it has date inputs", function() {
                    var inputs;

                    beforeEach(function() {
                        this.collection.at(0).set({typeCategory: "DATE"});
                        this.view.columnFilter.selectColumn(this.collection.at(0));
                        inputs = {day: "1", month: "02", year: "3333", value: "in the future"};
                        this.model.set({input: inputs});
                    });

                    it("fills in the values", function() {
                        this.view.$("select.comparator option[value=before]").prop('selected', true).change();
                        expect(this.view.$(".filter.date input[name='day']").val()).toBe("1");
                        expect(this.view.$(".filter.date input[name='month']").val()).toBe("02");
                        expect(this.view.$(".filter.date input[name='year']").val()).toBe("3333");
                    });

                    context("when a user types in the input field", function() {
                        beforeEach(function() {
                            this.model.unset('input');
                            this.view.$('.filter.date input[name="day"]').val('20').trigger('keyup');
                            this.view.$('.filter.date input[name="month"]').val('03').trigger('keyup');
                            this.view.$('.filter.date input[name="year"]').val('2002').trigger('keyup');
                        });

                        it("saves the value on the model", function() {
                            expect(this.model.get("input").value).toBe(["2002", "03", "20"].join("/"));
                            expect(this.model.get("input").day).toBe("20");
                            expect(this.model.get("input").month).toBe("03");
                            expect(this.model.get("input").year).toBe("2002");
                        });
                    });
                });

                context("and it has time inputs", function() {
                    beforeEach(function() {
                        this.collection.at(0).set({typeCategory: "TIME"});
                        this.view.columnFilter.selectColumn(this.collection.at(0));
                        this.model.set({input: {value: "1:02:3333"}});
                    });

                    it("fills in the values", function() {
                        this.view.$("select.comparator option[value=before]").prop('selected', true).change();
                        expect(this.view.$('.filter.time input').val()).toBe("1:02:3333");
                    });

                    context("when a user types in the input field", function() {
                        beforeEach(function() {
                            this.model.unset('input');
                            this.view.$('.filter.time input').val('1:23:04').trigger('keyup');
                        });

                        it("saves the value on the model", function() {
                            expect(this.model.get("input").value).toBe('1:23:04');
                        });
                    });
                });
            });
        });

        context("when the dataset has an aliasedName and the showAliasedName option is enabled", function() {
            beforeEach(function() {
                this.dataset.setDatasetNumber(1);
                this.view = new chorus.views.DatasetFilter({collection: this.collection, showAliasedName: true});
                this.view.render();
                this.view.$(".ui-selectmenu-button .ui-button").click();
            });

            it("has the aliased_name options", function() {
                expect(this.selectMenuStub.find(".aliased_name")).toExist();
                expect(this.selectMenuStub.find(".aliased_name .letter")).toContainText(this.dataset.aliasedName);
            });
        });

        context("when the dataset has a datasetNumber and the datasetNumbers option is disabled", function() {
            beforeEach(function() {
                this.dataset.setDatasetNumber(1);
                this.view.render();
            });

            it("does not have the aliased_name", function() {
                expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
            });
        });


        describe("#validateInput", function() {
            describe("with a numeric column", function() {
                beforeEach(function() {
                    this.collection.models[0].set({typeCategory: "REAL_NUMBER"});
                    this.view.render();
                    spyOn(this.view.map, "performValidation").andCallThrough();
                    spyOn(this.view, "markInputAsInvalid");

                    this.view.$(".filter.default input").val("123");
                });

                it("passes the input argument to the right method", function() {
                    this.view.validateInput();
                    expect(this.view.map).toBeA(chorus.models.DatasetFilterMaps.Numeric);
                    expect(this.view.map.performValidation).toHaveBeenCalledWith({ value: "123" });
                });

                it("adds a qtip with invalid input", function() {
                    this.view.$(".filter.default input").val("abc");
                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).toHaveBeenCalled();
                    var args = this.view.markInputAsInvalid.lastCall().args;

                    expect(args[0]).toBe(this.view.$(".filter.default input"));
                    expect(args[1]).toMatchTranslation("dataset.filter.number_required");
                });

                it("does not add a qtip with valid input", function() {
                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
                });
            });

            describe("with a date column", function() {
                beforeEach(function() {
                    this.collection.models[0].set({ typeCategory: "DATE" });
                    this.view.render();

                    spyOn(this.view.map, "performValidation");
                    spyOn(this.view, "markInputAsInvalid").andCallThrough();

                    this.view.$(".filter.date input[name='year']").val("2012");
                    this.view.$(".filter.date input[name='month']").val("2");
                    this.view.$(".filter.date input[name='day']").val("14");
                });

                it("passes the input argument to the right method", function() {
                    this.view.validateInput();

                    expect(this.view.map).toBeA(chorus.models.DatasetFilterMaps.Date);
                    expect(this.view.map.performValidation).toHaveBeenCalledWith({
                        year: "2012",
                        month: "2",
                        day: "14",
                        value: "2012/2/14"
                    });
                });

                it("adds a qtip with invalid input", function() {
                    stubQtip();

                    this.view.map.performValidation.andCallFake(function() {
                        this.errors = { month: "bad month" };
                        return false;
                    });

                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).toHaveBeenCalled();
                    var args = this.view.markInputAsInvalid.lastCall().args;
                    expect(args[0]).toBe(this.view.$(".filter.date input[name='month']"));
                    expect(args[1]).toBe("bad month");
                });

                it("does not add a qtip with valid input", function() {
                    this.view.map.performValidation.andReturn(true);

                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
                });
            });
        });

        describe("columns with typeCategory: OTHER", function() {
            beforeEach(function() {
                this.collection.models[1].set({typeCategory: "OTHER"});
                this.view.columnFilter.selectColumn(this.collection.at(1));
            });

            it("does not disable the option for the 'other' column", function() {
                expect(this.view.$(".column_filter option:eq(1)")).not.toBeDisabled();
                expect(this.view.$(".column_filter option:eq(0)")).not.toBeDisabled();
            });
        });

        describe("columns with typeCategory: STRING, LONG_STRING", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "STRING"});
                this.view.columnFilter.selectColumn(this.collection.at(0));

                this.keys = [
                    "equal",
                    "not_equal",
                    "null",
                    "not_null",
                    "like",
                    "begin_with",
                    "end_with",
                    "alpha_after",
                    "alpha_after_equal",
                    "alpha_before",
                    "alpha_before_equal"
                ];
            });

            it("adds a second select with the string options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing a comparator", function() {
                _.each(_.keys(chorus.models.DatasetFilterMaps.String.prototype.comparators), function(key) {
                    if (chorus.models.DatasetFilterMaps.String.prototype.comparators[key].usesInput) {
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val("null").change();
                            expect(this.view.$(".filter.default")).toHaveClass('hidden');
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default")).not.toHaveClass('hidden');
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeHidden();
                        });
                    }
                });
            });

            describe("when the input is hidden and a new column is chosen and the default option should show the input", function() {
                beforeEach(function() {
                    this.view.$('select.comparator').prop("selectedIndex", 3).change();
                    expect(this.view.$('.filter.default')).toHaveClass('hidden');
                    this.view.$('.column_filter select').prop("selectedIndex", 1).change();
                });

                it("should show the input box", function() {
                    expect(this.view.$('.filter.default')).not.toHaveClass('hidden');
                });
            });
        });

        describe("columns with typeCategory: BOOLEAN", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "BOOLEAN"});
                this.view.render();
                this.keys = _.keys(chorus.models.DatasetFilterMaps.Boolean.prototype.comparators);
            });

            it("adds a second select with the string options", function() {
                var view = this.view;
                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });
        });

        describe("columns with typeCategory: WHOLE_NUMBER, REAL_NUMBER", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "REAL_NUMBER"});
                this.view.render();

                this.keys = [
                    "equal",
                    "not_equal",
                    "null",
                    "not_null",
                    "greater",
                    "greater_equal",
                    "less",
                    "less_equal"
                ];
            });

            it("adds a second select with the numeric options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing an option", function() {
                _.each(_.keys(chorus.models.DatasetFilterMaps.Numeric.prototype.comparators), function(key) {
                    if (chorus.models.DatasetFilterMaps.Numeric.prototype.comparators[key].usesInput) {
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val("null").change();
                            expect(this.view.$(".filter.default")).toHaveClass('hidden');
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default")).not.toHaveClass('hidden');
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeHidden();
                        });
                    }
                });
            });
        });

        describe("columns with typeCategory: DATE", function() {
            beforeEach(function() {
                this.collection.models[0].set({ typeCategory: "DATE" });
                this.view.render();

                this.comparatorTypes = [
                    "on",
                    "null",
                    "not_null",
                    "before",
                    "after"
                ];

                this.typesRequiringArgument = [
                    "on",
                    "before",
                    "after"
                ];

                this.typesNotRequiringArgument = [
                    "null",
                    "not_null"
                ];
            });

            it("adds a second select with all of the comparator options for date columns", function() {
                _.each(this.comparatorTypes, function(comparatorType) {
                    expect(this.view.$("select.comparator option")).toContainTranslation("dataset.filter." + comparatorType);
                }, this);
            });

            describe("when a comparator is selected that requires a second argument", function() {
                it("it shows the second input field ", function() {
                    _.each(this.typesRequiringArgument, function(comparatorType) {
                        this.view.$(".comparator").val(comparatorType).change();
                        expect(this.view.$(".filter.date")).not.toHaveClass("hidden");
                        expect(this.view.$(".filter.date input[name='year']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.year");
                        expect(this.view.$(".filter.date input[name='month']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.month");
                        expect(this.view.$(".filter.date input[name='day']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.day");
                    }, this);
                });

                it("shows the date picker icon next to the input field", function() {
                    expect(this.view.$(".filter.date")).toHaveClass('hidden');
                    this.view.$(".comparator").val("on").change();
                    expect(this.view.$(".filter.date")).not.toHaveClass('hidden');
                });
            });

            describe("when a comparator is selected that does *not* require a second argument", function() {
                it("it hides the second input field ", function() {
                    _.each(this.typesNotRequiringArgument, function(comparatorType) {
                        this.view.$(".comparator").val(comparatorType).change();
                        expect(this.view.$(".filter.date input")).toBeHidden();
                    }, this);
                });

                it("hides the date picker icon", function() {
                    this.view.$(".comparator").val("on").change();
                    expect(this.view.$(".filter.date")).not.toHaveClass('hidden');
                    this.view.$(".comparator").val("not_null").change();
                    expect(this.view.$(".filter.date")).toHaveClass('hidden');
                });
            });
        });

        describe("columns with typeCategory: DATETIME", function() {
            beforeEach(function() {
                this.collection.models[0].set({ typeCategory: "DATETIME" });
                this.view.render();
            });

            it("uses the Timestamp type", function() {
                expect(this.view.map).toBeA(chorus.models.DatasetFilterMaps.Timestamp);
            });
        });

        describe("#fieldValues", function() {
            beforeEach(function() {
                this.view.$(".filter.default input").val("123");
                this.view.$(".filter.time input").val("12:34");
                this.view.$(".filter.date input[name='year']").val("04");
                this.view.$(".filter.date input[name='month']").val("12");
                this.view.$(".filter.date input[name='day']").val("3");
            });

            describe("with a string column", function() {
                it("returns the value of the default filter input", function() {
                    this.view.map = new chorus.models.DatasetFilterMaps.String();
                    expect(this.view.fieldValues()).toEqual({ value: "123" });
                });
            });

            describe("with a numeric column", function() {
                it("returns the value of the default filter input", function() {
                    this.view.map = new chorus.models.DatasetFilterMaps.Numeric();
                    expect(this.view.fieldValues()).toEqual({ value: "123" });
                });
            });

            describe("with a time column", function() {
                it("returns the value of the time filter input", function() {
                    this.view.map = new chorus.models.DatasetFilterMaps.Time();
                    expect(this.view.fieldValues()).toEqual({ value: "12:34" });
                });
            });

            describe("with a date column", function() {
                beforeEach(function() {
                    this.view.map = new chorus.models.DatasetFilterMaps.Date();
                });

                it("returns the values of the date filter inputs", function() {
                    expect(this.view.fieldValues().month).toBe("12");
                    expect(this.view.fieldValues().year).toBe("04");
                    expect(this.view.fieldValues().day).toBe("3");
                });

                describe("when the fields are populated", function() {
                    it("includes a 'value' field, which formats the year, month and day properly", function() {
                        expect(this.view.fieldValues().value).toBe("04/12/3");
                    });
                });

                describe("when the fields are blank", function() {
                    beforeEach(function() {
                        this.view.$(".filter.date input[name='year']").val("");
                        this.view.$(".filter.date input[name='month']").val("");
                        this.view.$(".filter.date input[name='day']").val("");
                    });

                    it("includes a blank 'value' field", function() {
                        expect(this.view.fieldValues().value).toBe("");
                    });
                });
            });
        });
    });
});
