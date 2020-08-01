(function() {
    var MultiSelect = kendo.ui.MultiSelect,
        select;

    function popuplateSelect() {
        var options = [];
        for (var i=0; i < 5; i++) {
            options.push("<option value='" + i + "'>Option" + i + "</option>");
        }

        select.html(options);
    }

    module("kendo.ui.MultiSelect filtering", {
        setup: function() {
            $.fn.press = function(character) {
                var keyCode = character.charCodeAt(0);
                $(this).trigger({
                    type: "keydown",
                    keyCode: keyCode
                });
            }

            kendo.ns = "kendo-";
            select = $("<select multiple=multiple/>").appendTo(QUnit.fixture);
        },
        teardown: function() {
            kendo.ns = "";
            if (select.data("kendoMultiSelect")) {
                select.data("kendoMultiSelect").destroy();
            }

            select.parents(".k-widget").remove();
        }
    });

    asyncTest("MultiSelect filters items on keydown", 1, function() {
        popuplateSelect();
        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.input.val("Option1").press("1");

        setTimeout(function() {
            start();
            equal(multiselect.ul.children().length, 1);
        });
    });

    test("MultiSelect filters data on rebind depending on the selected items", function() {
        popuplateSelect();

        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.search("Option1");
        multiselect.ul.children().first().click();

        multiselect.open();

        equal(multiselect.dataSource.filter().filters.length, 0);
    });

    test("MultiSelect filters data using selected items too", function() {
        popuplateSelect();

        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.ul.children().first().click();
        multiselect.search("Option1");
        multiselect.ul.children().first().click();

        multiselect.input.click();

        ok(select[0].children[0].selected);
        ok(select[0].children[1].selected);
    });

    test("MultiSelect filters data renders all datasource view data", function() {
        popuplateSelect();

        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.value(["0", "1"]);
        multiselect.search("Opt");

        var children = multiselect.ul.children();

        equal(children.length, multiselect.dataSource.view().length);
    });

    test("MultiSelect does not append tags on list rebind after filter", function() {
        popuplateSelect();

        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.search("Option1");
        multiselect.ul.children().first().click();

        multiselect.open();

        equal(multiselect.tagList.children().length, 1);
    });

    test("MultiSelect allows selection after filter rebind", function() {
        popuplateSelect();

        var multiselect = new MultiSelect(select, {
            delay: 0
        });

        multiselect.search("Option1");
        multiselect.input.blur();
        multiselect.open();

        multiselect.ul.children().first().click();

        equal(multiselect.tagList.children().length, 1);
    });

    test("MultiSelect hides popup if no data", function() {
        popuplateSelect();
        var multiselect = new MultiSelect(select);

        multiselect.wrapper.click();
        multiselect.search("no such item");

        ok(!multiselect.popup.visible());
    });

    test("MultiSelect do not show initial values on rebind", function() {
        popuplateSelect();
        var multiselect = new MultiSelect(select, { delay: 0, value: ["1", "2"] });

        multiselect.search("Option0");
        multiselect.ul.children().first().click();
        multiselect.value(null);

        multiselect.open();

        equal(multiselect.value().length, 0);
        equal(multiselect.element.val(), null);
    });

    test("MultiSelect with autoBind:false binds only once datasource when filter", 1, function() {
        var multiselect = new MultiSelect(select, {
            autoBind: false,
            dataTextField: "text",
            dataValueField: "value",
            filter: "contains",
            value: [{ text: "text", value: "value" }],
            dataSource: {
                transport: {
                    read: function(options) {
                        options.success([
                            { text: "text", value: "1" },
                            { text: "text2", value: "2" },
                            { text: "text3", value: "3" },
                            { text: "text4", value: "4" }
                        ]);
                    }
                },
                serverFiltering: true
            }
        });

        multiselect.dataSource.bind("change", function() {
            ok(true);
        });

        multiselect.search("te");
    });

    asyncTest("MultiSelect filters on empty input", 1, function() {
        var multiselect = new MultiSelect(select, {
            delay: 0,
            minLength: 3,
            dataSource: ["foo", "bar"],
            filter: "contains"
        });

        multiselect.dataSource.one("change", function() {
            multiselect.one("filtering", function(e) {
                start();
                equal(e.filter.value, "");
            });

            multiselect.input.val("").keydown();
        });

        multiselect.input.focus().val("baz").keydown();
    });

    test("MultiSelect renders value of the custom options on filter", 3, function() {
        var multiselect = new MultiSelect(select, {
            dataTextField: "text",
            dataValueField: "value",
            dataSource: [
                { text: "text", value: "1" },
                { text: "text2", value: "2" },
                { text: "text3", value: "3" },
                { text: "text4", value: "4" }
            ],
            value: ["1"]
        });

        multiselect.search("text2");

        var options = select.children();

        equal(options.length, 2);
        equal(options[0].value, "2");
        equal(options[1].value, "1");
    });
})();
