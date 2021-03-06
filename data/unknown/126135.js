! ✖ / env;
node(function()  {
      var sys = require("util");
      var fs = require("fs");
      var TYPE = "all";
      var FLAGS =  {
         all: {
            core:true, 
            particles:true, 
            md2:true, 
            md3:true, 
            filter2d:true, 
            collada:true, 
            input:true, 
            wavefront:true, 
            openctm:true, 
            physics:true, 
            devtemplate:true, 
            uglify:true, 
            documents:true, 
            preloader:true, 
            gui:true         }, 
         scripts: {
            core:true, 
            particles:true, 
            md2:true, 
            md3:true, 
            filter2d:true, 
            collada:true, 
            input:true, 
            physics:true, 
            wavefront:true, 
            openctm:true, 
            uglify:true, 
            gui:true, 
            preloader:true         }, 
         docs: {
            core:false, 
            particles:false, 
            md2:false, 
            md3:true, 
            filter2d:false, 
            collada:false, 
            input:false, 
            wavefront:false, 
            openctm:false, 
            documents:true         }, 
         dev: {
            devtemplate:true         }} ;
      var isHelp = false;
      process.argv.forEach(function(val, index, array)  {
            if (val == "--help")  {
               sys.print("GLGE Build Script
");
               sys.print("Usage:
");
               sys.print("build [type] [options]
");
               sys.print("eg building scripts without collada support,
 build SCRIPTS --without-collada
");
               sys.print("
");
               sys.print("Types:
");
               sys.print("all - (DEFAULT) build all options
");
               sys.print("scripts - build the compiled script and uglify
");
               sys.print("docs - build documents
");
               sys.print("dev - build development template
");
               sys.print("
");
               sys.print("Options:
");
               sys.print("--without-particle  : builds without particle support
");
               sys.print("--without-filter2d  : builds without filters support
");
               sys.print("--without-md2  : builds without filters support
");
               sys.print("--without-md3  : builds without filters support
");
               sys.print("--without-collada  : builds without collada support
");
               sys.print("--without-wavefront  : builds without wavefront obj support
");
               sys.print("--without-openctm  : builds without OpenCTM support
");
               sys.print("--without-input  : builds without input device support
");
               sys.print("--without-physics  : builds without jiglibjs physics support
");
               sys.print("--without-uglify  : builds without using the uglify JS compiler
");
               sys.print("--without-devtemplate  : (DEFAULT) builds a html development template
");
               sys.print("--without-documents  : (DEFAULT) builds the docs using the node-jsdoc-toolkit
");
               sys.print("
");
               sys.print("--with-particle  : (DEFAULT) builds with particle support
");
               sys.print("--with-filter2d  : (DEFAULT) builds with filters support
");
               sys.print("--with-md2  : (DEFAULT) builds with filters support
");
               sys.print("--with-md3  : (DEFAULT) builds with filters support
");
               sys.print("--with-collada  : (DEFAULT) builds with collada support
");
               sys.print("--with-wavefront  : (DEFAULT) builds with wavefront obj support
");
               sys.print("--with-openctm  : (DEFAULT) builds with OpenCTM support
");
               sys.print("--with-input  : (DEFAULT) builds with input device support
");
               sys.print("--with-physics  : builds with jiglibjs physics support
");
               sys.print("--with-uglify  : (DEFAULT) builds using the uglify JS compiler
");
               sys.print("--with-devtemplate  : builds a html development template
");
               sys.print("--with-documents  : builds the docs using the node-jsdoc-toolkit
");
               isHelp = true;
               return ;
            }
            ;
            if (FLAGS[val])  {
               FLAGS = FLAGS[val];
               TYPE = val;
            }
            if (val.substr(0, 10) == "--without-")  {
               if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE]               FLAGS[val.substr(10)] = false;
            }
            ;
            if (val.substr(0, 7) == "--with-")  {
               if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE]               FLAGS[val.substr(7)] = true;
            }
            ;
         }
      );
      if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE]      console.log;
      if (isHelp) return       if (FLAGS.uglify)  {
         try {
            var jsp = require("./external/uglifyjs/lib/parse-js");
            var pro = require("./external/uglifyjs/lib/process");
         }
         catch (e) {
            FLAGS.uglify = false;
            sys.print(">> ERROR: UglifyJS unavailable
");
         }
      }
      var FILES =  {
         core:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_animatable.js", "src/core/glge_document.js", "src/core/glge_event.js", "src/core/glge_group.js", "src/core/glge_jsonloader.js", "src/core/glge_messages.js", "src/core/glge_placeable.js", "src/core/glge_quicknote.js", "src/animation/glge_action.js", "src/animation/glge_actionchannel.js", "src/animation/glge_animationcurve.js", "src/animation/glge_animationvector.js", "src/animation/glge_animationpoints.js", "src/geometry/glge_mesh.js", "src/geometry/glge_sphere.js", "src/material/glge_material.js", "src/material/glge_materiallayer.js", "src/material/glge_multimaterial.js", "src/material/glge_texture.js", "src/material/glge_texturecamera.js", "src/material/glge_texturecameracube.js", "src/material/glge_texturecanvas.js", "src/material/glge_texturecube.js", "src/material/glge_texturevideo.js", "src/renderable/glge_lod.js", "src/renderable/glge_object.js", "src/renderable/glge_text.js", "src/renders/glge_renderer.js", "src/scene/glge_camera.js", "src/scene/glge_light.js", "src/scene/glge_scene.js"], 
         particles:["src/extra/glge_particles.js"], 
         collada:["src/extra/glge_collada.js"], 
         filter2d:["src/extra/glge_filter2d.js", "src/extra/filters/glge_filter_glow.js", "src/extra/filters/glge_filter_ao.js"], 
         md2:["src/extra/glge_md2.js"], 
         md3:["src/extra/glge_md3.js"], 
         input:["src/extra/glge_input.js"], 
         wavefront:["src/extra/glge_wavefront.js"], 
         openctm:["src/extra/glge_openctm.js"], 
         physics:["src/physics/glge_physicsext.js", "src/physics/glge_physicsabstract.js", "src/physics/glge_physicsbox.js", "src/physics/glge_physicsmesh.js", "src/physics/glge_physicsplane.js", "src/physics/glge_physicssphere.js", "src/physics/glge_physicsconstraintpoint.js", "src/physics/glge_physicscar.js"], 
         preloader:["src/preloader/glge_documentpreloader.js", "src/preloader/glge_filepreloader.js"], 
         gui:["src/gui/gui.js", "src/gui/gadget.js", "src/gui/preloader_gadget.js"]      }
;
      var DEPENDS =  {
         src/core/glge_math.js:[], 
         src/core/glge.js:["src/core/glge_math.js"], 
         src/core/glge_animatable.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/core/glge_document.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/core/glge_event.js:["src/core/glge.js", "src/core/glge_math.js"], 
         src/core/glge_group.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_quicknote.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js"], 
         src/scene/glge_camera.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/scene/glge_light.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/scene/glge_scene.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_group.js", "src/core/glge_quicknote.js"], 
         src/renders/glge_renderer.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/renderable/glge_lod.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/renderable/glge_object.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/renderable/glge_text.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/geometry/glge_mesh.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_material.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_materiallayer.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_multimaterial.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texture.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texturecamera.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texturecameracube.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texturevideo.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texturecube.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/material/glge_texturecanvas.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/animation/glge_animationpoints.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/animation/glge_animationvector.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/animation/glge_animationcurve.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/animation/glge_actionchannel.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/animation/glge_action.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/core/glge_quicknote.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js"], 
         src/core/glge_placeable.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/core/glge_messages.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/core/glge_jsonloader.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/extra/glge_particles.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/extra/glge_collada.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/core/glge_group.js", "src/core/glge_quicknote.js"], 
         src/extra/glge_filter2d.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/extra/filters/glge_filter_glow.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js", "src/extra/glge_filter2d.js"], 
         src/extra/filters/glge_filter_ao.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js", "src/extra/glge_filter2d.js"], 
         src/extra/glge_input.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_event.js", "src/core/glge_quicknote.js"], 
         src/extra/glge_wavefront.js:["src/core/glge.js", "src/core/glge_math.js", "src/core/glge_placeable.js", "src/core/glge_animatable.js", "src/core/glge_jsonloader.js", "src/core/glge_event.js", "src/core/glge_event.js", "src/renderable/glge_object.js", "src/core/glge_quicknote.js"], 
         src/physics/glge_physicsext.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js"], 
         src/physics/glge_physicsabstract.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js"], 
         src/physics/glge_physicsbox.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/physics/glge_physicsmesh.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/physics/glge_physicsplane.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/physics/glge_physicssphere.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/physics/glge_physicsconstraintpoint.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/physics/glge_physicscar.js:["src/core/glge.js", "src/core/glge_math.js", "src/scene/glge_scene.js", "src/physics/glge_physicsabstract.js"], 
         src/extra/glge_md2.js:["src/renderable/glge_object.js"], 
         src/extra/glge_md3.js:["src/renderable/glge_object.js"], 
         src/extra/glge_openctm.js:["src/renderable/glge_object.js", "src/extra/ctm.js"], 
         src/extra/ctm.js:["src/extra/lzma.js"], 
         src/preloader/glge_documentpreloader.js:["src/preloader/glge_filepreloader.js"], 
         src/preloader/glge_filepreloader.js:["src/core/glge.js", "src/core/glge_event.js"], 
         src/gui/preloader_gadget.js:["src/gui/gadget.js"], 
         src/gui/gadget.js:["src/gui/gui.js"], 
         src/gui/gui.js:["src/core/glge.js"], 
         src/geometry/glge_sphere.js:["src/geometry/glge_mesh.js"]      }
;
      sys.print("Generating file list
");
      var getFileList = function(list, all)  {
         var addDepends = function(file, list)  {
            if (DEPENDS[file])  {
               for (var i = 0; i < DEPENDS[file].length; i++)  {
                     addDepends(DEPENDS[file][i], list);
                     if (list.indexOf(DEPENDS[file][i]) < 0) list.push(DEPENDS[file][i])                  }
               ;
            }
            ;
         }
;
         if (! list) list = []         for (FLAG in FLAGS)  {
               if (FLAGS[FLAG] || all && FILES[FLAG])  {
                  for (var i = 0; i < FILES[FLAG].length; i++)  {
                        addDepends(FILES[FLAG][i], list);
                        if (list.indexOf(FILES[FLAG][i]) < 0) list.push(FILES[FLAG][i])                     }
                  ;
               }
               ;
            }
         ;
         return list;
      }
;
      var fileList = getFileList();
      if (FLAGS.devtemplate)  {
      }
      var output = [];
      for (var i = 0; i < fileList.length; i++)  {
            sys.print("Importing: " + fileList[i] + "
");
            output.push(fs.readFileSync(fileList[i]));
         }
      if (fileList.length > 0)  {
         sys.print("Writing aggregated javascript: glge-compiled.js
");
         output = output.join("");
         fs.writeFileSync("glge-compiled.js", output);
         var match = output.match(/^\s*(\/\*[\s\S]+?\*\/)/);
         var license = match[0];
         license = license.replace(/^\s*\/\*/, "/*!");
         if (FLAGS.uglify)  {
            sys.print("Parsing Javascript
");
            var ast = jsp.parse(output);
            sys.print("Minifiying..
");
            ast = pro.ast_mangle(ast);
            sys.print("Optimizing..
");
            ast = pro.ast_squeeze(ast);
            sys.print("Generating minified code
");
            var final_code = license + "
" + pro.gen_code(ast);
            sys.print("Writing minimized javascript: glge-compiled-min.js
");
            fs.writeFileSync("glge-compiled-min.js", final_code);
         }
      }
      var files = getFileList([], true);
      if (FLAGS.devtemplate)  {
         var html = ["<!doctype html>
<head>
<title>Development Template</title>
"];
         for (var i = 0; i < files.length; i++)  {
               if (FLAGS.devtemplate)  {
                  html.push("<script type="text/javascript" src="" + files[i] + ""></script>
");
               }
            }
         html.push("</head>
<body>
<canvas id="canvas"></canvas>
</body>
</html>");
         sys.print("Writing development template: devtemplate.html
");
         fs.writeFileSync("devtemplate.html", html.join(""));
      }
      if (FLAGS.documents)  {
         if (files.length)  {
            var spawn = require("child_process").spawn, cmd = spawn("node", ["external/jsdoc-toolkit/app/run.js", "-a", "-d=docs", "-t=external/jsdoc-toolkit/templates/jsdoc"].concat(files));
            sys.print("Generating Documents
");
            cmd.stdout.on("data", function(data)  {
                  sys.print(data);
               }
            );
            cmd.on("exit", function(code)  {
                  if (code == 0) sys.print("Build Complete!
")                   else sys.print("Build Complete! Exit with code: " + code + "
")               }
            );
            cmd.stderr.on("data", function(error)  {
                  if (/^execvp\(\)/.test(error.asciiSlice(0, error.length)))  {
                     console.log("Failed to start child process.");
                  }
               }
            );
         }
          else  {
            sys.print("Build Complete!
");
         }
      }
       else  {
         sys.print("Build Complete!
");
      }
   }
)();
