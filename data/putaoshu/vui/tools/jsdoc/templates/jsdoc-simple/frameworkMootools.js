var LAST_SYMBOL;
JSDOC.PluginManager.registerPlugin(
  "JSDOC.frameworkMootools",
  {
		onFunctionCall: function(functionCall) {
			if (functionCall.name == "Class" || /\.extend$/.test(functionCall.name)) {
			  functionCall.doc = "/** @lends "+LAST_SYMBOL.name+".prototype */";
			}
			if (/\.implement$/.test(functionCall.name) && functionCall.arg1) {
			  if ('Events' == functionCall.arg1 || 'Options' == functionCall.arg1 ||
			    'ta.util.Saveable' == functionCall.arg1) {
			    // interface
			  }
			  else {
			    // function map
  			  functionCall.doc = "/** @lends "+LAST_SYMBOL.name+".prototype */";
  			}
			}
		},
		
		onDocTag: function(tag) {
		  // @option supports type, optional and default
		  if (tag.title == "option") {
		    tag.desc = tag.nibbleName(tag.desc);
		  }
		  // @binds is a list
		  else if (tag.title == "binds") {
		    //tag.desc = tag.nibbleName(tag.desc);
		  }
		},

    onSymbol: function(symbol) {
      LAST_SYMBOL = symbol;
      // @option
      var options = symbol.comment.getTag('option');
      if (options.length) {
        symbol.options = options;
      }
      // @binds
      var binds = symbol.comment.getTag('binds');
      if (binds.length) {
        symbol.binds = [];
        for (var i = 0; i < binds.length; i++){
          var b = binds[i].desc.split(', ');
          for (var x = 0; x < b.length; x++) symbol.binds.push(b[x]);
        }
      }
    },
    
    onFinishedParsing: function(symbolSet) {
      var symbols = symbolSet.toArray();
      var cl, method, methods;
      for (var s = 0; s < symbols.length; s++) {
        if (!symbols[s].is("CONSTRUCTOR")) continue;
        cl = symbols[s];
        methods = cl.methods;
        for (var idx = 0; idx < methods.length; idx++) {
          if (methods[idx].isEvent) continue;
          method = methods[idx];
          if (method.name == "initialize") { // move initialize params to class and remove method
            cl._params = method._params;
            cl.methods[idx] = null;
          }
        }
        // clean up methods array and remove nulls
        var tmp = [];
        for (var idx = 0; idx < methods.length; idx++) {
          if (methods[idx]) tmp.push(methods[idx]);
        }
        cl.methods = tmp;
      }
    }
  }
);
