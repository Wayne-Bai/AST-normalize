describe("Dropdown", function () {

    // this is our simple selection dropdown
    (function () {
        var vm = {
            dropdown: ko.track({
                options: ["Male", "Female"],
                selected: "Male"
            })
        };

        // our first dropdown
        var $el, el;

        $scope = $('<div><s-dropdown data="dropdown" class="foobar"></s-dropdown></div>');

        // TODO: spy on $.fn.dropdown

        ko.applyBindings(vm, $scope.get(0));

        // we do this after applyBindings because the node is replaced
        $el = $scope.children().first();
        el = $el.get(0);

        it("should become a div", function () {
            expect(el.tagName.toLowerCase()).toEqual("div");
        });

        it("should accept additional classes", function () {
            expect(el.className).toContain("foobar");
        });

        it("should populate the menu", function () {
            var $items = $el.find('.menu .item');

            expect($items.length).toEqual(2);
            expect($items.eq(0).text().trim()).toEqual("Male");
            expect($items.eq(1).text().trim()).toEqual("Female");
        });

        it("should change the visible text when selected is changed", function () {
            vm.dropdown.selected = "Male";
            expect($el.find('.text').first().text().trim()).toEqual("Male");
            vm.dropdown.selected = "Female";
            expect($el.find('.text').first().text().trim()).toEqual("Female");
            vm.dropdown.selected = "Male";
            expect($el.find('.text').first().text().trim()).toEqual("Male")
        });

        it("should change selected on click", function () {
            var $items = $el.find('.menu .item');

            $items.eq(0).trigger('click');
            expect($el.find('.text').first().text().trim()).toEqual("Male");
            expect(vm.dropdown.selected).toEqual("Male");

            $items.eq(1).trigger('click');
            expect($el.find('.text').first().text().trim()).toEqual("Female");
            expect(vm.dropdown.selected).toEqual("Female");

            $items.eq(0).trigger('click');
            expect($el.find('.text').first().text().trim()).toEqual("Male");
            expect(vm.dropdown.selected).toEqual("Male");
        });
    })();
});