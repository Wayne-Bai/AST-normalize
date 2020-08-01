
//You must register your plugin with the global tributary object
//id: the id should match what's in the plugin.json
//function: the plugin function which has access to the tributary instance and
//the plugin object
Tributary.plugin("inline-console", tributaryInlineConsolePlugin);

//tributary is the main object available in inlets
//plugin has some gauranteed elements:
//{
//  elId: a UUID that will also be the element id of a div
//}
//You are expected to return a plugin object with the following methods exposed:
//{
//  activate() { //initializes the plugin },
//  deactivate() { //cleans up after the plugin (removes itself) }
//}
function tributaryInlineConsolePlugin(tributary, plugin) {
  var el;
  var config = tributary.__config__;

  plugin.activate = function() {
    el = document.getElementById(plugin.elId);
    tributary.__events__.on("pre:execute", clearWidgets);

    var button = d3.select("#editorcontrols").append("button").attr("id","inline-logs").text("Inline Logs")
      .on("click", function(d) {
        var dis = d3.select(this);
        if( dis.classed("active") ) {
          console.log("Inline logging disabled");
          tributary.__config__.set("inline-console", false)
          tributary.__events__.trigger("execute");
          dis.classed("active", false)
          clearWidgets();
        }
        else {
          console.log("Inline logging initiated");
          tributary.__config__.set("inline-console", true)
          tributary.__events__.trigger("execute");
          dis.classed("active", true)
        }
      })
      .classed("active", tributary.__config__.get("inline-console"))
  }

  plugin.deactivate = function() {
    el = document.getElementById(plugin.elId);
    el.innerHTML = "";
    //TODO: remove all the stuff we added to tributary
    //destroy();
  }

  var widgets = [];
  function clearWidgets() {
    for(var i = widgets.length; i--;) {
      widgets.pop().clear(); //this remove's CodeMirror's handle to the widget;
    }
    d3.select("#widgets").selectAll(".log-widget").remove()
  }
  function clearLineWidgets(cm, line) {
    wRetained = [] //widgets that have not been cleared
    for(var i = widgets.length; i--;) {
      var w = widgets[i];
      var wline = cm.getLineNumber(w.line);
      //clear only widgets from same editor and line
      if(cm == w.cm && wline == line ) {
        w.clear(); //this removes CodeMirror's handle to the widget;
      } else {
        wRetained.push(w)
      }
    }
    widgets = wRetained //update the array
    //d3.select("#widgets").selectAll(".log-widget").remove()
  }

  //this is where we use esprima to interperet our code
  //mainly taken from https://github.com/nornagon/live/blob/master/xform.coffee
  tributary.__parsers__["inline-console"] = function(parsed, code, filename) {
    if(!tributary.__config__.get("inline-console")) { return parsed }
    __hasProp = {}.hasOwnProperty;

    var transformed;
    var id, nextId = 0;
    function replace(e) {
      if(e.type === 'ExpressionStatement' && e.expression && e.expression.type === 'CallExpression') {
        var callee = e.expression.callee;
        if(callee.object && callee.object.name === 'console' && callee.property && callee.property.name === 'log') {
          callee.property.name = 'logJack';
          var pos = e.expression.loc.end;
          pos.line -= 1;
          var newArgs = [
            {
              "type": "ObjectExpression",
              "properties": [
                {
                  "type": "Property",
                  "key": {
                      "type": "Identifier",
                      "name": "line"
                  },
                  "value": {
                      "type": "Literal",
                      "value": pos.line,
                      "raw": pos.line + ""
                  },
                  "kind": "init"
                },
                {
                  "type": "Property",
                  "key": {
                      "type": "Identifier",
                      "name": "ch"
                  },
                  "value": {
                      "type": "Literal",
                      "value": pos.column,
                      "raw": pos.column + ""
                  },
                  "kind": "init"
                },
                {
                  "type": "Property",
                  "key": {
                      "type": "Identifier",
                      "name": "filename"
                  },
                  "value": {
                      "type": "Literal",
                      "value": filename,
                      "raw": filename + ""
                  },
                  "kind": "init"
                }
              ]
            },
            {
            "type": "ArrayExpression",
             "elements": e['expression']['arguments']
            }
          ];
          e['expression']['arguments'] = newArgs;
          //console.log("pos", e, callee.loc.end);
          return transform(e,replace);
        } else {
          return transform(e, replace);
        }
      } else {
        return transform(e, replace);
      }
    }

    //TODO: this is probably more general.
    function transform(object, f) {
      var i, key, newObject, v, value, _i, _len;

      if (object instanceof Array) {
        newObject = [];
        for (i = _i = 0, _len = object.length; _i < _len; i = ++_i) {
          v = object[i];
          if (typeof v === 'object' && v !== null) {
            newObject[i] = f(v);
          } else {
            newObject[i] = v;
          }
        }
      } else {
        newObject = {};
        for (key in object) {
          if (!__hasProp.call(object, key)) continue;
          value = object[key];
          if (typeof value === 'object' && value !== null) {
            newObject[key] = f(value);
          } else {
            newObject[key] = value;
          }
        }
      }
      return newObject;
    }
    transformed = transform(parsed, replace)
    return transformed;
  }

  console.logHTML = function(pos, html,preserve) {
    var widget = d3.select("#widgets").append("div")
      .html(html)
      .classed("html-widget", true)
    console.log.apply(console, [html]);
    putWidget(pos, widget, preserve);
  }
  console.logJack = function(pos, args, preserve) {
    try {
      var text = JSON.stringify(args)
      text = text.slice(1, text.length-1);
    } catch(e) {
      var text = args.toString();
    }
    var widget = d3.select("#widgets").append("div")
      .text(text)
      .classed("log-widget", true)
    console.log.apply(console, args);
    putWidget(pos, widget, preserve);
  }
  putWidget = function(pos, widget, preserve) {
    var context = tributary.getContext(pos.filename);
    var cm = context.editor.cm;
    if(!preserve) {
      clearLineWidgets(cm, pos.line);
    }
    var lwidget = cm.addLineWidget(pos.line, widget.node());
    widgets.push(lwidget);
  }
  console.clearWidgets = function() {
    clearWidgets()
  }
  return plugin;
}


