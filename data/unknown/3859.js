! ✖ / env;
node;
var copy = require("dryice").copy;
var aceHome = __dirname;
function shadow(input)  {
   if (typeof input !== "string")  {
      input = input.toString();
   }
   return input.replace(/define\(/g, "__ace_shadowed__.define(");
}
;
console.log("# ace ---------");
var project = copy.createCommonJsProject([aceHome + "/support/pilot/lib", aceHome + "/lib"]);
copy( {
      source:"build_support/editor_textarea.html", 
      dest:"build/textarea/editor.html"   }
);
var ace = copy.createDataObject();
copy( {
      source:["build_support/mini_require_textarea.js"], 
      dest:ace   }
);
copy( {
      source:[copy.source.commonjs( {
            project:project, 
            require:["pilot/fixoldbrowsers", "pilot/index", "pilot/plugin_manager", "pilot/environment", "ace/editor", "ace/edit_session", "ace/undomanager", "ace/theme/textmate", "ace/mode/text", "ace/mode/matching_brace_outdent", "ace/virtual_renderer"]         }
      )], 
      filter:[copy.filter.moduleDefines], 
      dest:ace   }
);
copy( {
      source: {
         root:project, 
         include:/.*\.css$|.*\.html$/, 
         exclude:/tests?\//      }, 
      filter:[copy.filter.addDefines], 
      dest:ace   }
);
copy( {
      source: {
         root:project, 
         include:/.*\.png$|.*\.gif$/, 
         exclude:/tests?\//      }, 
      filter:[copy.filter.base64], 
      dest:ace   }
);
copy( {
      source:["build_support/boot_textarea.js"], 
      dest:ace   }
);
copy( {
      source:ace, 
      filter:[shadow, copy.filter.uglifyjs], 
      dest:"build/textarea/src/ace.js"   }
);
copy( {
      source:ace, 
      filter:[shadow], 
      dest:"build/textarea/src/ace-uncompressed.js"   }
);
console.log("# ace modes ---------");
project.assumeAllFilesLoaded();
["css", "html", "javascript", "php", "python", "xml", "ruby", "java", "c_cpp", "coffee", "perl", "svg"].forEach(function(mode)  {
      console.log("mode " + mode);
      copy( {
            source:[copy.source.commonjs( {
                  project:project.clone(), 
                  require:["ace/mode/" + mode]               }
            )], 
            filter:[copy.filter.moduleDefines, shadow, copy.filter.uglifyjs], 
            dest:"build/textarea/src/mode-" + mode + ".js"         }
      );
   }
);
console.log("# ace themes ---------");
["clouds", "clouds_midnight", "cobalt", "dawn", "idle_fingers", "kr_theme", "mono_industrial", "monokai", "pastel_on_dark", "twilight", "eclipse", "merbivore", "merbivore_soft", "vibrant_ink"].forEach(function(theme)  {
      console.log("theme " + theme);
      copy( {
            source:[ {
               root:aceHome + "/lib", 
               include:"ace/theme/" + theme + ".js"            }
], 
            filter:[copy.filter.moduleDefines, shadow, copy.filter.uglifyjs], 
            dest:"build/textarea/src/theme-" + theme + ".js"         }
      );
   }
);
console.log("# License | Readme | Changelog ---------");
