exports["Spah.SpahQL.Token.FilterQuery"] = {
  
  "Returns a correct new index and found number when reading ahead for filter queries": function(test) {
    test.deepEqual([18, new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("/moo == ']'"))], Spah.SpahQL.Token.FilterQuery.parseAt(5, "/key1[/moo == ']']"));
    test.equal(null, Spah.SpahQL.Token.FilterQuery.parseAt(5, "/key1/moo == ']'"));
    test.done();
  }
  
};