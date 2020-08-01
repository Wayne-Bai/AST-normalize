/**
 * @class Loads in a resource file over AJAX <strong>[A3.Loader]</strong>.
 * Handy for the loading of mesh data files
 *
 * @author Paul Lewis
 *
 * @param {String} url The URL to load
 * @param {Function} callback The callback to which the geometry should be passed
 */
A3.Core.Remote.ShaderLoader = function(url, name, type, callback) {

  var request     = new XMLHttpRequest(),
    lib           = A3.Core.Render.Shaders.ShaderLibrary,
    libShaders    = lib.Shaders,
    libChunk      = lib.Chunks;

  if(!libShaders) {
    lib.Shaders   = {};
    libShaders    = lib.Shaders;
  }

  if(!libChunk) {
    lib.Chunks    = {};
    libChunk      = lib.Chunks;
  }

  request.onreadystatechange = function() {
    if(request.readyState === 4) {
      var shaderData = request.responseText;

      switch(type) {
        case "chunk":
          libChunk[name] = shaderData;
          break;

        case "vertex":
        case "fragment":
          if(!libShaders[name]) {
            libShaders[name] = {
              vertexShader: null,
              fragmentShader: null
            };
          }

          libShaders[name][type+"Shader"] = shaderData;
          break;
      }

      callback();
    }
  };

  /**
   * Dispatches the request for the data
   */
  this.load = function() {
    request.open("GET", url, true);
    request.send(null);
  };
};

// shortcut
A3.ShaderLoader = A3.Core.Remote.ShaderLoader;
