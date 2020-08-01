describe("chorus.models.DatasetFilterMaps", function() {
    function itReturnsTheRightClauseFor(key, columnName, inputValue, expected, ignoreEmptyCase) {
        it("returns the right clause for " + key, function() {
            expect(this.datasetFilterMap.comparators[key].generate(columnName, inputValue)).toBe(expected);
        });

        if(!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(this.datasetFilterMap.comparators[key].generate(columnName, "")).toBe("");
            });
        }
    }

    describe("String", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.String();
        });

        itReturnsTheRightClauseFor("equal", "column_name", "some_v'alue", "column_name = 'some_v''alue'");
        itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "column_name <> 'some_value'");
        itReturnsTheRightClauseFor("like", "column_name", "some_value", "column_name LIKE 'some_value'");
        itReturnsTheRightClauseFor("begin_with", "column_name", "some_value", "column_name LIKE 'some_value%'");
        itReturnsTheRightClauseFor("end_with", "column_name", "some_value", "column_name LIKE '%some_value'");
        itReturnsTheRightClauseFor("alpha_after", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("alpha_after_equal", "column_name", "some_value", "column_name >= 'some_value'");
        itReturnsTheRightClauseFor("alpha_before", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("alpha_before_equal", "column_name", "some_value", "column_name <= 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks all strings as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "2342gegrerger*(&^%" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "';DROP TABLE users;--" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "\n                    \t" })).toBeTruthy();
        });
    });

    describe("Boolean", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Boolean();
        });

        itReturnsTheRightClauseFor("true", "column_name", "some_value", "column_name = TRUE", true);
        itReturnsTheRightClauseFor("false", "column_name", "some_value", "column_name = FALSE", true);
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);
    });

    describe("Numeric", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Numeric();
        });

        itReturnsTheRightClauseFor("equal", "column_name", "some_value", "column_name = 'some_value'");
        itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "column_name <> 'some_value'");
        itReturnsTheRightClauseFor("greater", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("greater_equal", "column_name", "some_value", "column_name >= 'some_value'");
        itReturnsTheRightClauseFor("less", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("less_equal", "column_name", "some_value", "column_name <= 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks whole numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "1234" })).toBeTruthy();
        });

        it("marks floating comma numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "4,5" })).toBeTruthy();
        });

        it("marks floating point numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "4.5" })).toBeTruthy();
        });

        it("marks non-numerical strings as invalid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "I'm the string" })).toBeFalsy();
        });

        it("marks negative numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "-1" })).toBeTruthy();
        });

        it("marks numbers with lots of dashes as invalid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "--1" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "-1-" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "-" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "-1,2,.-" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "1-" })).toBeFalsy();
        });

        it("marks the empty field valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "" })).toBeTruthy();
        });
    });

    describe("Other", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Other();
        });

        itReturnsTheRightClauseFor("equal", "column_name", "some_value", "column_name = 'some_value'");
        itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "column_name <> 'some_value'");
        itReturnsTheRightClauseFor("greater", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("greater_equal", "column_name", "some_value", "column_name >= 'some_value'");
        itReturnsTheRightClauseFor("less", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("less_equal", "column_name", "some_value", "column_name <= 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks whole numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "1234" })).toBeTruthy();
        });

        it("marks floating comma numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "4,5" })).toBeTruthy();
        });

        it("marks floating point numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "4.5" })).toBeTruthy();
        });

        it("marks non-numerical strings as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "I'm the string" })).toBeTruthy();
        });

        it("marks negative numbers as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "-1" })).toBeTruthy();
        });

        it("marks the empty field valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "" })).toBeTruthy();
        });

        it("marks all kinds of random strings as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "#$%^&*(HGgfhweg" })).toBeTruthy();
        });
    });

    describe("Timestamp", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Timestamp();
        });

        itReturnsTheRightClauseFor("equal", "column_name", "some_value", "column_name = 'some_value'");
        itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "column_name <> 'some_value'");
        itReturnsTheRightClauseFor("greater", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("greater_equal", "column_name", "some_value", "column_name >= 'some_value'");
        itReturnsTheRightClauseFor("less", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("less_equal", "column_name", "some_value", "column_name <= 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks all values as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "2342gegrerger*(&^%" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "';DROP TABLE users;--" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "\n                    \t" })).toBeTruthy();
        });
    });

    describe("Time", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Time();
        });

        itReturnsTheRightClauseFor("equal", "column_name", "some_value", "column_name = 'some_value'");
        itReturnsTheRightClauseFor("before", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("after", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks times as valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "13:37" })).toBeTruthy();
            expect(this.datasetFilterMap.performValidation({ value: "13:13:37" })).toBeTruthy();
        });

        it("marks anything but times as invalid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "4,5" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "Greetings" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "www.google.com" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "13.45" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ value: "12am" })).toBeFalsy();
        });

        it("marks the empty field valid", function() {
            expect(this.datasetFilterMap.performValidation({ value: "" })).toBeTruthy();
        });
    });

    describe("Date", function() {
        beforeEach(function() {
            this.datasetFilterMap = new chorus.models.DatasetFilterMaps.Date();
        });

        itReturnsTheRightClauseFor("on", "column_name", "some_value", "column_name = 'some_value'");
        itReturnsTheRightClauseFor("before", "column_name", "some_value", "column_name < 'some_value'");
        itReturnsTheRightClauseFor("after", "column_name", "some_value", "column_name > 'some_value'");
        itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "column_name IS NOT NULL", true);
        itReturnsTheRightClauseFor("null", "column_name", "some_value", "column_name IS NULL", true);

        it("marks dates as valid", function() {
            expect(this.datasetFilterMap.performValidation({ month: "02", day: "14", year: "2012" })).toBeTruthy();
        });

        it("marks anything else as invalid", function() {
            expect(this.datasetFilterMap.performValidation({ month: "hi", day: "14", year: "2012" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ month: "1", day: "&^", year: "2012" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({ month: "1", day: "31", year: "google" })).toBeFalsy();
        });

        it("has the right error messages", function() {
            this.datasetFilterMap.performValidation({ month: "hi", day: "14", year: "2012" });
            expect(this.datasetFilterMap.errors.month).toMatchTranslation("dataset.filter.month_required");

            expect(this.datasetFilterMap.performValidation({ month: "1", day: "&^", year: "2012" })).toBeFalsy();
            expect(this.datasetFilterMap.errors.day).toMatchTranslation("dataset.filter.day_required");

            expect(this.datasetFilterMap.performValidation({ month: "1", day: "31", year: "google" })).toBeFalsy();
            expect(this.datasetFilterMap.errors.year).toMatchTranslation("dataset.filter.year_required");
        });

        it("is not valid if there are empty and non-empty parts", function() {
            expect(this.datasetFilterMap.performValidation({  month: "", day: "14", year: "2012" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({  month: "5", day: "", year: "2012" })).toBeFalsy();
            expect(this.datasetFilterMap.performValidation({  month: "5", day: "14", year: "" })).toBeFalsy();
        });

        it("is valid when all fields are empty", function() {
            expect(this.datasetFilterMap.performValidation({  month: "", day: "", year: "" })).toBeTruthy();
        });
    });
});
