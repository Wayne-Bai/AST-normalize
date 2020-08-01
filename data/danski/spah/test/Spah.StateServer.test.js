exports["Spah.StateServer"] = {
	
	"Registers an expander strategy": function(test) {
			var server = Spah.createServer();
			test.equal(server.strategiser.count(), 0);
			server.addExpander({"path": "/*", "if": "/a"}, function(results, root, attachments, strategy) {
					strategy.done();
			});
			test.equal(server.strategiser.count(), 1);
			test.done();
	},

	"Makes methods delegatable": function(test) {
			var server = Spah.createServer();
			var errorThrown = "";
			var errorMessage = "NO FOO";

			test.ok(!server.fooDelegate);
			server.createDelegatedMethod("fooDelegate", errorMessage);

			try {
				server.fooDelegate({});
			}
			catch(e) {
				errorThrown = e.message;
			}

			test.equal(errorThrown.indexOf(errorMessage), 0);
			server.fooDelegate(function(request) { return request.state; });
			test.equal(server.fooDelegate({state: "foo"}), "foo");
			test.done();
	}

};