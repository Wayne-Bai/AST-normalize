exports["Spah.SpahQL.Token.String"] = {
  
  "Returns a correct new index and found string when reading ahead for string literals": function(test) {
    test.expect(12);
    
    test.deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, '"foo", bar'));
    test.deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, '"foo"'));
    test.deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, '---"foobar"---'));
    test.deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, '---"foobar"---'));
    test.deepEqual([13, new Spah.SpahQL.Token.String('foo\"bar')], Spah.SpahQL.Token.String.parseAt(3, '---"foo\\"bar"'));
    test.deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, "'foo', bar"));
    test.deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, "'foo'"));
    test.deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, "---'foobar'---"));
    test.deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, "---'foobar'---"));
    test.deepEqual([13, new Spah.SpahQL.Token.String("foo'bar")], Spah.SpahQL.Token.String.parseAt(3, "---'foo\\'bar'"));
    
    // No quotes
    test.equal(null, Spah.SpahQL.Token.String.parseAt(0, "foo, bar"));
    
    // Errors
    try { Spah.SpahQL.Token.String.parseAt(3, "---'foobar---") }
    catch(e) { test.ok(e) }
    
    test.done();    
  }
  
};