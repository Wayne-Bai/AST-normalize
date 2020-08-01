/**
 * class Spah.SpahQL.Token
 *
 * A containing module for all token types - queries, filters, comparison operators, sets, literals etc.
 * that are encountered during the parsing process.
 **/
 
// Define and export
Spah.classCreate("Spah.SpahQL.Token", {
  
  /**
   * Spah.SpahQL.Token.parseAt(i, query) -> Array result
   *
   * Attempts to locate a token of any valid top-level type at the given index in the given string query.
   **/
  "parseAt": function(i, query) {
    return  Spah.SpahQL.Token.ComparisonOperator.parseAt(i, query) ||
            Spah.SpahQL.Token.String.parseAt(i, query) ||
            Spah.SpahQL.Token.Numeric.parseAt(i, query) ||
            Spah.SpahQL.Token.Boolean.parseAt(i, query) ||
            Spah.SpahQL.Token.Set.parseAt(i, query) ||
            Spah.SpahQL.Token.SelectionQuery.parseAt(i, query) ||
            null;
  },
  
  /**
   * Spah.SpahQL.Token.throwParseErrorAt(i, query, message) -> void
   * 
   * Throws an exception at the given index in the given query string with the given error message.
   **/
  "throwParseErrorAt": function(i, query, message) {
    throw new Error("Parse error: '"+(message||"failure")+"' at index "+i+" in query '"+query+"'.");
  },
  
});