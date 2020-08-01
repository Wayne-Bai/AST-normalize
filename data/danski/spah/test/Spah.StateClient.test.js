exports["Spah.StateClient"] = {
	
	"Registers a reducer strategy": function(test) {
		var client = Spah.createClient();
		var data = {a: {aa: "a.aa.val", bb: "a.bb.val"}, b: {aa: "b.aa.val", bb: "b.bb.val"}};
		var state =  Spah.SpahQL.db(data);
		client.currentState = state;

		test.equal(client.strategiser.count(), 0);
		client.addReducer({"paths": "/*"}, function(res,root,att,fC) {});
		test.equal(client.strategiser.count(), 1);
		test.done();
	},

	"Applies registered reducers to a clone of the current state": function(test) {
		var client = Spah.createClient();
		var data = {a: {aa: "a.aa.val", bb: "a.bb.val"}, b: {aa: "b.aa.val", bb: "b.bb.val"}};
		var dataClone = Spah.SpahQL.DataHelper.deepClone(data);
		var state = Spah.SpahQL.db(data);
		client.currentState = state;
		
		client.addReducer({"paths": "/*"}, Spah.State.Strategies.remover("/aa"));
		client.addReducer({"paths": "/b"}, Spah.State.Strategies.remover("/bb"));

		client.reduceCurrentState(null, function(reduced, att) {
			test.deepEqual(reduced.value(), {a: {bb: "a.bb.val"}, b: {}});
			test.deepEqual(state.value() , dataClone);
			test.ok(state != reduced);
			test.done();
		});
	}

};