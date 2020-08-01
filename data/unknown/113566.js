! ✖ / env;
node(function()  {
      var version = "3.1";
      var ncp = require("ncp").ncp;
      var sys = require("util");
      var fs = require("fs");
      var path = require("path");
      var TYPE = "all";
      var FLAGS =  {
         all: {
            core:true         }, 
         scripts: {
            core:true         }, 
         docs: {
            core:false, 
            documents:true         }, 
         dev: {
            devtemplate:true         }} ;
      var isHelp = false;
      process.argv.forEach(function(val, index, array)  {
            if (val == "--help")  {
               sys.print("SceneJS Build Script
");
               sys.print("Usage:
");
               sys.print("build [type] [options]
");
               sys.print("eg building scripts without documentation,
 build SCRIPTS --without-documents
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
               sys.print("--without-uglify  : builds without using the uglify JS compiler
");
               sys.print("--without-documents  : (DEFAULT) builds without creating docs using the node-jsdoc-toolkit
");
               sys.print("
");
               sys.print("--with-uglify  : (DEFAULT) builds using the uglify JS compiler
");
               sys.print("--with-documents  : builds the docs using the node-jsdoc-toolkit
");
               isHelp = true;
               return ;
            }
            if (FLAGS[val])  {
               FLAGS = FLAGS[val];
               TYPE = val;
            }
            if (val.substr(0, 10) == "--without-")  {
               if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE]               FLAGS[val.substr(10)] = false;
            }
            if (val.substr(0, 7) == "--with-")  {
               if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE]               FLAGS[val.substr(7)] = true;
            }
         }
      );
      if (FLAGS[TYPE])  {
         FLAGS = FLAGS[TYPE];
      }
      var FILES =  {
         core:["licenses/license-header.js", "src/lib/requireWrapperStart.js", "src/lib/require.js", "src/lib/requireWrapperEnd.js", "src/lib/webgl-debug-utils.js", "src/core/map.js", "src/core/scenejs.js", "src/lib/requireConfig.js", "src/core/eventManager.js", "src/core/plugins.js", "src/core/events.js", "src/core/canvas.js", "src/core/engine.js", "src/core/errors.js", "src/core/config.js", "src/core/log.js", "src/core/math.js", "src/core/status.js", "src/core/webgl/webgl.js", "src/core/webgl/arrayBuffer.js", "src/core/webgl/attribute.js", "src/core/webgl/enums.js", "src/core/webgl/renderBuffer.js", "src/core/webgl/program.js", "src/core/webgl/sampler.js", "src/core/webgl/shader.js", "src/core/webgl/texture2d.js", "src/core/webgl/uniform.js", "src/core/scene/nodeEvents.js", "src/core/scene/core.js", "src/core/scene/coreFactory.js", "src/core/scene/node.js", "src/core/scene/pubSubProxy.js", "src/core/scene/nodeFactory.js", "src/core/scene/camera.js", "src/core/scene/clips.js", "src/core/scene/enable.js", "src/core/scene/flags.js", "src/core/scene/colorTarget.js", "src/core/scene/depthTarget.js", "src/core/scene/geometry.js", "src/core/scene/stage.js", "src/core/scene/layer.js", "src/core/scene/library.js", "src/core/scene/lights.js", "src/core/scene/lookAt.js", "src/core/scene/material.js", "src/core/scene/morphGeometry.js", "src/core/scene/name.js", "src/core/scene/renderer.js", "src/core/scene/depthBuffer.js", "src/core/scene/colorBuffer.js", "src/core/scene/view.js", "src/core/scene/scene.js", "src/core/scene/shader.js", "src/core/scene/shaderParams.js", "src/core/scene/style.js", "src/core/scene/tag.js", "src/core/scene/_texture.js", "src/core/scene/texture.js", "src/core/scene/reflect.js", "src/core/scene/xform.js", "src/core/scene/matrix.js", "src/core/scene/rotate.js", "src/core/scene/translate.js", "src/core/scene/scale.js", "src/core/scene/modelXFormStack.js", "src/core/nodeTypes.js", "src/core/display/display.js", "src/core/display/programSourceFactory.js", "src/core/display/programSource.js", "src/core/display/programFactory.js", "src/core/display/program.js", "src/core/display/objectFactory.js", "src/core/display/object.js", "src/core/display/renderContext.js", "src/core/display/chunks/chunk.js", "src/core/display/chunks/chunkFactory.js", "src/core/display/chunks/cameraChunk.js", "src/core/display/chunks/clipsChunk.js", "src/core/display/chunks/drawChunk.js", "src/core/display/chunks/flagsChunk.js", "src/core/display/chunks/renderTargetChunk.js", "src/core/display/chunks/geometryChunk.js", "src/core/display/chunks/lightsChunk.js", "src/core/display/chunks/listenersChunk.js", "src/core/display/chunks/lookAtChunk.js", "src/core/display/chunks/materialChunk.js", "src/core/display/chunks/nameChunk.js", "src/core/display/chunks/programChunk.js", "src/core/display/chunks/rendererChunk.js", "src/core/display/chunks/depthBufferChunk.js", "src/core/display/chunks/colorBufferChunk.js", "src/core/display/chunks/viewChunk.js", "src/core/display/chunks/shaderChunk.js", "src/core/display/chunks/shaderParamsChunk.js", "src/core/display/chunks/styleChunk.js", "src/core/display/chunks/textureChunk.js", "src/core/display/chunks/cubemapChunk.js", "src/core/display/chunks/xformChunk.js"]      }
;
      sys.print("Generating file list
");
      var getFileList = function(list, all)  {
         if (! list)  {
            list = [];
         }
         for (var flag in FLAGS)  {
               if (FLAGS[flag] || all && FILES[flag])  {
                  for (var i = 0; i < FILES[flag].length; i++)  {
                        if (list.indexOf(FILES[flag][i]) < 0)  {
                           list.push(FILES[flag][i]);
                        }
                     }
               }
            }
         return list;
      }
;
      var fileList = getFileList();
      var output = [];
      for (var i = 0; i < fileList.length; i++)  {
            sys.print("Importing: " + fileList[i] + "
");
            output.push(fs.readFileSync(fileList[i]));
         }
      var productionBuild = true;
      var distDir = "api/" + productionBuild ? "latest" : "dev";
      var distPluginDir = distDir + "/plugins";
      var distExtrasDir = distDir + "/extras";
      fs.mkdir(distDir, function()  {
            fs.mkdir(distPluginDir, function()  {
                  fs.mkdir(distExtrasDir, function()  {
                        sys.print("Distributing plugins to: " + distPluginDir + "
");
                        ncp("src/plugins", distPluginDir, function(err)  {
                           }
                        );
                        sys.print("Distributing extras to: " + distExtrasDir + "
");
                        ncp("src/extras", distExtrasDir, function(err)  {
                           }
                        );
                        fs.writeFileSync(distExtrasDir + "/gui.js", fs.readFileSync("src/extras/gui/dat.gui.min.js") + fs.readFileSync("src/extras/gui/gui.js"));
                        if (fileList.length > 0)  {
                           sys.print("Writing core library to: " + distDir + "/scenejs.js
");
                           output.push("SceneJS.configure({ pluginPath: "http://scenejs.org/" + distDir + "/plugins" });");
                           output = output.join("");
                           fs.writeFileSync(distDir + "/scenejs.js", output);
                        }
                        var files = getFileList([], true);
                        if (FLAGS.documents)  {
                           if (files.length)  {
                              var spawn = require("child_process").spawn;
                              var cmdStr = ["external/jsdoc-toolkit/app/run.js", "-a", "-d=docs", "-t=external/jsdoc-toolkit/templates/jsdoc"].concat(files);
                              sys.print("cmdStr + " + cmdStr);
                              var cmd = spawn("node", cmdStr);
                              sys.print("Generating Documents
");
                              cmd.stdout.on("data", function(data)  {
                                    sys.print(data);
                                 }
                              );
                              cmd.on("exit", function(code)  {
                                    if (code == 0) sys.print("Build Complete!
")                                     else sys.print("Build Complete! Exit with code: " + code + "
")                                 }
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
                  );
               }
            );
         }
      );
   }
)();
