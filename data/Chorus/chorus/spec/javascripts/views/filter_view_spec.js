describe("chorus.views.Filter", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseColumnSet([
            new chorus.models.DatabaseColumn({name: "mycolumn1"}),
            new chorus.models.DatabaseColumn({name: "mycolumn2"})
        ]);
        this.model = new chorus.models.DatasetFilter();
        this.view = new chorus.views.Filter({model: this.model, collection: this.collection});
    });


    describe("render", function() {
        beforeEach(function() {
            this.selectMenuStub = stubSelectMenu();
            spyOn(chorus, "styleSelect").andCallThrough();
            this.view.render();
        });

        context("when the model is filled with valid data", function() {
            var selectedColumn;

            beforeEach(function() {
                spyOn(this.view.columnFilter, "selectColumn").andCallThrough();
                selectedColumn = this.collection.at(1);
                this.model.set({column: selectedColumn, comparator: "not_equal", input: {value: "jellyfish"}});
                this.view.render();
            });

            it("selects that column", function() {
                expect(this.view.columnFilter.selectColumn).toHaveBeenCalledWith(selectedColumn);
            });

            it("selects that comparator", function() {
                expect(this.view.$("select.comparator option:selected").val()).toBe("not_equal");
            });

            it("fills the input", function() {
                expect(this.view.$("input").val()).toBe("jellyfish");
            });
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.collection.length);
            var view = this.view;

            this.collection.each(function(model, index) {
                var option = view.$(".column_filter option:eq(" + index + ")");
                expect(option).toContainText(model.get("name"));
                expect(option).toHaveAttr("value", model.get("name"));
            }, this);
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("gives long comparators enough room", function() {
            expect(chorus.styleSelect.lastCall().args[1].menuWidth).toBe(240);
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        it("does not have the aliased_name", function() {
            expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
        });

        context("when a column is selected", function() {
            beforeEach(function() {
                this.view.columnFilter.selectColumn(this.collection.at(1));
            });

            it("should update the model", function() {
                expect(this.view.model.get("column")).toEqual(this.collection.at(1));
            });

            describe("#select comparator", function() {
                context("when the model has a comparator", function() {
                    beforeEach(function() {
                        this.model.set({comparator: "not_equal"});
                        this.view.selectComparator();
                    });

                    it("selects that comparator", function() {
                        expect(this.view.$("select.comparator option:selected").val()).toBe("not_equal");
                    });
                });

                context("when the model does not have a comparator", function() {
                    beforeEach(function() {
                        this.model.unset("comparator");
                        this.view.selectComparator();
                    });

                    it("selects the first comparator", function() {
                        expect(this.view.$("select.comparator option:selected").val()).toBe("equal");
                    });
                });
            });

            context("when a comparator is selected", function() {
                beforeEach(function() {
                    this.view.model.unset("comparator");
                    this.view.$("select.comparator option[value=not_equal]").prop('selected', true).change();
                });

                it("should update the model", function() {
                    expect(this.view.model.get("comparator")).toBe("not_equal");
                });

                context("and it has no inputs", function() {
                    it("doesn't crash", function() {
                        this.view.$("select.comparator option[value=null]").prop('selected', true).change();
                    });
                });

                context("and it has default inputs", function() {
                    beforeEach(function() {
                        this.model.set({input: {value: "jellyfish"}});
                    });

                    it("fills in the values", function() {
                        this.view.$("select.comparator option[value=not_equal]").prop('selected', true).change();
                        expect(this.view.$('.filter.default input').val()).toBe("jellyfish");
                    });

                    context("when a user types in the input field", function() {
                        beforeEach(function() {
                            this.model.unset('input');
                            this.view.$('.filter.default input').val('hello').trigger('keyup');
                        });

                        it("saves the value on the model", function() {
                            expect(this.model.get("input").value).toBe('hello');
                        });
                    });
                });

                context("and a value was already selected", function() {
                    beforeEach(function() {
                        this.model.set({input: null});
                        this.view.$('.filter.default input').val('hello');
                        this.view.$("select.comparator option[value=not_equal]").prop('selected', true).change();
                    });

                    it("should clear the value input", function() {
                        expect(this.view.$('.filter.default input').val()).toBe('');
                    });
                });
            });

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
    });
});