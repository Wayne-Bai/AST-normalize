/**
 * class Spah.DOM.Blueprint < Spah.DOM.Document
 *
 * A "blueprint" is a server-side representation of your application's layout. Blueprints are used during Spah's 
 * cold-rendering cycle, when a user is requesting a page via a regular non-ajax HTTP request. A Blueprint contains
 * all the markup for your app, annotated with SpahQL assertions. Whenever the blueprint is served to a user,
 * the document logic is run, the document set into precisely the state needed to display the relevant UI state to
 * the user and the resulting HTML shipped down the wire to the browser, from whence the Spah client will take over
 * for all future requests.
 * 
 * Blueprints are *compiled* from some source HTML, which will be your app's markup with included document logic,
 * and after the compile step you may add additional customisations by adding resources such as templates
 * and rulesets.
 * 
 * Let's look at an example, with comments:
 *
 *    var blueprint = require('spah').dom.blueprint;
 *    // Prepare your markup. Read it from the file system, get it from a database, whatever.
 *    // We want to end up with a String, not a Buffer.
 *    var html = "<!DOCTYPE HTML><html><head>....</head><body>....</body></html>";
 *    // Now we'll compile the blueprint
 *    blueprint.compile(html, function(err, myBlueprint) {
 *      // Handle errors
 *      if(err) return console.log("ERROR!", err);
 *      // Move on with processing
 *      
 *    })
 **/

Spah.classExtend("Spah.DOM.Blueprint", Spah.DOM.Document, {
  
  // SINGLETONS
  
  /**
   * Spah.DOM.Blueprint.compile(htmlPath, templatePathMask, done) -> void
   * - html (String): The raw HTML that will form the base of this Blueprint instance.
   * - done (Function): The function to call once the document has been compiled. Receives two arguments (error, blueprintInstance).
   *
   * (Server-side only) Creates a new HTML5 blueprint document to work with. Parses the file specified in the <code>docPath</code> argument
   * into a JSDOM environment, and then reads all Mustache files within the templatePathMask into the blueprint,
   * inserting them into script tags at the bottom of the document body.
   *
   * GOTCHA: If your markup is not valid (for instance, opening a tag that expects to be closed, then never closing it)
   * you run the risk of leaving unanswered callbacks from jsdom, which can result in a node process that does not exit
   * properly.
   * 
   **/
  "compile": function(html, done) {
    try {
      var jsdom = require('jsdom').jsdom();
      var contextWindow = jsdom.createWindow();
      var $ = require('jQuery').create(contextWindow);
    }
    catch(e) {
      return done(e, null);
    }
    
    
    // Prepare the event chain
    var extractedDocType = "";
    var docTypeRegexp = /<!DOCTYPE [^>]*>/m;
    var docTypeMatch = html.match(docTypeRegexp);
    if(docTypeMatch && (html.indexOf("<!DOCTYPE") < html.indexOf("<html"))) {
      // There is a doctype declared before the opening tag
      extractedDocType = docTypeMatch[0];
    }
    
    Spah.log("Throwing blueprint markup into jQuery context");
    // Yes, this looks hacky, but due to the context set at
    // the start of this function it is legit.
    $("html")[0].ownerDocument.innerHTML = html;
    
    // Spring into action
    Spah.log("Done. Instantiating new Blueprint and triggering callback.");
    return done(null, new Spah.DOM.Blueprint($, contextWindow, extractedDocType));
  }
  
}, {
  
  // INSTANCE METHODS
  
  /**
   * Spah.DOM.Blueprint#render(state, callback) -> void
   * -> state (Spah.SpahQL): The state object that will be used to render the document's markup
   * -> done (Function): A callback function that will receive (err, markup) as arguments, where 'markup' is the full generated markup to be rendered on the client.
   *
   * Renders markup for the given state
   **/
  "render": function(state, done) {
    this.run(state, function(doc) {
      done(null, doc.toString())
    });
  },

  /**
   * Spah.DOM.Blueprint#toString() -> String
   *
   * Returns a string representation of the document's current markup.
   **/
  "toString": function() {
    return this.docType+this.window.document.innerHTML;
  }
  
});