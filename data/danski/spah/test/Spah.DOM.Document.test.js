var html, htmlPrimitive;
if(Spah.inBrowser()) {
	// TODO
}
else {
	var fs = require('fs');
	html = fs.readFileSync(__dirname+"/fixtures/layout.html", "utf-8");	
	htmlPrimitive = fs.readFileSync(__dirname+"/fixtures/layout-primitive.html", "utf-8");	
}


exports["Spah.DOM.Document"] = {
  
  "Runs against internal document logic": function(test) {
    test.done();

    // Load blueprint document
    	// Spawn basic Document instance from blueprint innards
  },

  "Adds default handlers when instantiated": function(test) {
    test.expect(Spah.DOM.Document.defaultModifiers.length + 1);

    // Compiles a blueprint and extracts to a Document instance
    Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      for(var i=0; i<Spah.DOM.Document.defaultModifiers.length; i++) {
      	test.ok(tDoc.modifiers.indexOf(Spah.DOM.Document.defaultModifiers[i]) >= 0);
      }
      
      test.done();
    });    
  },
  "Does not add a modifier if the modifier is already registered": function(test) {
  	test.expect(3);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      var count = tDoc.modifiers.length;
      test.ok(count > 0);
      tDoc.addModifiers(Spah.DOM.Actions.Show);
      test.equal(tDoc.modifiers.length, count);
      
      test.done();
    });    
  },
  "Calls modifier.added on addition, if the modifier defines it": function(test) {
  	test.expect(2);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      tDoc.addModifiers({
      	"added": function(d) {
      		d.ranTestModifier = true;
      	}
      });
      test.ok(tDoc.ranTestModifier);
      
      test.done();
    });    
  },
  "Calls modifer.removed on removal, if the modifier defines it": function(test) {
  	test.expect(4);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      var modifier = {
      	"removed": function(d) {
      		d.removedTestModifier = true;
      	}
      };
      test.ok(!tDoc.removedTestModifier);
      tDoc.addModifiers(modifier);
      test.ok(!tDoc.removedTestModifier);
      tDoc.removeModifiers(modifier);
      test.ok(tDoc.removedTestModifier);
      
      test.done();
  	});
  },
  
  "Runs the embedded document logic with a test modifier": function(test) {
    test.expect(11);
  	Spah.DOM.Blueprint.compile(htmlPrimitive, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      	  tDoc.addModifiers({
      	  		"actionName": function(e) { return "test"; },
      	  		"up": function(e, flags, state, $) { 
	      	  		e.html(e.html()+"up");
	      	  	},
	      	  	"down": function(e, flags, state, $) { 
	      	  		e.html(e.html()+"down");
	      	  	}
      	  });

      // Create an example SpahQL state
      var state = Spah.SpahQL.db({"test": true});

      // Assert starting state
      test.equals(tDoc.jQ("#test-if").html(), "")
      test.equals(tDoc.jQ("#test-unless").html(), "")

      // Run document
      tDoc.runSync(state);
	  test.equals(tDoc.jQ("#test-if").html(), "up");
      test.equals(tDoc.jQ("#test-unless").html(), "down"); 

      // Try run again with identical state
      tDoc.runSync(state);
	  test.equals(tDoc.jQ("#test-if").html(), "up");
      test.equals(tDoc.jQ("#test-unless").html(), "down"); 

      // Flip state and run again
      state.set("test", false);
      tDoc.runSync(state);
	  test.equals(tDoc.jQ("#test-if").html(), "updown");
      test.equals(tDoc.jQ("#test-unless").html(), "downup"); 

      // And repeat
      tDoc.runSync(state);
	  test.equals(tDoc.jQ("#test-if").html(), "updown");
      test.equals(tDoc.jQ("#test-unless").html(), "downup"); 

      // Tada!
      test.done();
  	});
  }

};