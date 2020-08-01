var fs = require('fs');
var html = fs.readFileSync(__dirname+"/fixtures/layout.html", "utf-8");

exports["Spah.DOM.Blueprint"] = {
  
  "Compiles the blueprint asynchronously": function(test) {
    test.expect(5);
    
    Spah.DOM.Blueprint.compile(html, function(err, doc) {
      
      if(err) console.log(err);
      test.ok(!err);

      test.ok(doc instanceof Spah.DOM.Blueprint);
      test.ok(doc.jQ);
      test.ok(doc.window);
      test.equal(doc.docType, '<!DOCTYPE html>');
      test.done();
    });    
  },
  
  "Injects jQuery without modifying the markup": function(test) {
    test.expect(1);

    Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.equal(doc.jQ("script").length, 0);
      test.done();
    });
  },

  "Renders as a string": function(test) {
    test.expect(3);

    Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(typeof(doc.docType) == "string");
      test.ok(doc.window);
      test.equal(doc.toString(), doc.docType+doc.window.document.innerHTML);
      test.done();
    });
  },
  
}