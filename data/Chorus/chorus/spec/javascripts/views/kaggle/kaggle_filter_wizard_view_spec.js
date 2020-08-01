describe("chorus.views.KaggleFilterWizard", function() {
    beforeEach(function() {
        this.view = new chorus.views.KaggleFilterWizard();
        this.filter = new chorus.models.KaggleFilter({name: "rank"});
    });

    describe("#filterView", function() {
        it("returns a KaggleFilter view", function() {
            expect(this.view.filterView()).toBeA(chorus.views.KaggleFilter);
        });
    });

    describe("#filterModel", function() {
        it("returns a KaggleFilter model", function() {
            expect(this.view.filterModel(this.filter)).toBeA(chorus.models.KaggleFilter);
        });
    });

    describe("#filterCollection", function() {
        it("returns a KaggleFilterSet", function() {
            expect(this.view.filterCollection()).toBeA(chorus.collections.KaggleFilterSet);
        });
    });
    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the filter title", function() {
            expect(this.view.$(".filter_title").text()).toMatchTranslation("kaggle.filter.title");
        });

        it("displays one filter when rendered at first", function() {
            expect(this.view.$("li.kaggle_filter").length).toBe(1);
        });

        it("adds the 'last' class to the only li", function() {
            expect(this.view.$("li.kaggle_filter")).toHaveClass("last");
        });

        describe("click the search kaggle users button", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "trigger");
                this.view.$("button.search_kaggle_user").click();
            });

            it("triggers the filterKaggleUsers event with the filters", function() {
                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("filterKaggleUsers", this.view.collection);
            });
        });
    });
});
