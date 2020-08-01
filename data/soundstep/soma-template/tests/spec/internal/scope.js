describe("internal - scope", function () {

	beforeEach(function () {

	});

	afterEach(function () {

	});

	it("create scope", function () {
		var scope = new Scope();
		scope.name = 'john';
		expect(scope).toEqual(jasmine.any(Object));
		expect(scope._parent).toBeNull();
		expect(typeof scope._createChild).toEqual('function');
		expect(scope._children.length).toEqual(0);
		expect(scope.name).toEqual('john');
	});

	it("create child scope", function () {
		var scope = new Scope();
		var child = scope._createChild();
		scope.name = 'john';
		child.name = 'david';
		expect(child._parent).toEqual(scope);
		expect(scope._children.length).toEqual(1);
		expect(scope._children[0]).toEqual(child);
		expect(child._children.length).toEqual(0);
		expect(scope.name).toEqual('john');
		expect(scope._children[0].name).toEqual('david');
		expect(child.name).toEqual('david');
		expect(child._parent.name).toEqual('john');
	});

	it("create scope with data", function () {
		var scope = new Scope({data:1});
		expect(scope.data).toEqual(1);
	});

	it("create child scope with data", function () {
		var scope = new Scope({data:1});
		var child = scope._createChild({data:2});
		expect(scope.data).toEqual(1);
		expect(child.data).toEqual(2);
	});

});
