/**
 * @class Contains a squad of WebGL shaders <strong>[A3.ShaderLibrary]</strong>.
 *
 * @author Paul Lewis
 */
A3.Core.Render.Shaders.ShaderLibrary = function() {

  /**
   * Gets a shader from the library
   *
   * @param {Object} data The configuration for the shader. Valid options for data.type are:
   * <ul>
   *    <li><strong>&quot;Pink&quot;</strong>: glorious hot pink</li>
   *    <li><strong>&quot;Basic&quot;</strong>: unaffected by lighting</li>
   *    <li><strong>&quot;Particle&quot;</strong>: renders as points</li>
   *    <li><strong>&quot;Normals&quot;</strong>: renders RGB reflecting the mesh normals</li>
   *    <li><strong>&quot;Phong&quot;</strong>: renders diffuse and all shiny</li>
   *    <li><strong>&quot;Lambert&quot;</strong>: renders diffuse</li>
   * </ul>
   *
   * There are additional properties you can use for some of the shaders:
   *
   * <ul>
   *    <li><strong>Basic</strong>, <strong>Phong</strong> or <strong>Lambert</strong>:
   *        <ul>
   *          <li><strong>&quot;texture&quot;</strong>: an A3 Texture</li>
   *          <li><strong>&quot;environmentMap&quot;</strong>: an A3 Environment Map</li>
   *          <li><strong>&quot;ambientReflection&quot;</strong>: a number between 0 and 1, indicating the amount of ambient light the material receives</li>
   *          <li><strong>&quot;diffuseReflection&quot;</strong>: as above but for diffuse component</li>
   *        </ul>
   *    </li>
   *    <li><strong>Phong</strong> only:
   *        <ul>
   *          <li><strong>&quot;specularReflection&quot;</strong>: a number between 0 and 1, indicates how reflective the material is</li>
   *          <li><strong>&quot;specularShininess&quot;</strong>: a number that goes as high as you like. Higher will give you tighter reflections</li>
   *          <li><strong>&quot;specularColor&quot;</strong>: an A3 Vector3 giving the reflection colour. X = R, Y = G, Z = B.
   *        </ul>
   *    </li>
   *    <li><strong>Particle</strong> only:
   *        <ul>
   *          <li><strong>&quot;particleSize&quot;</strong>: a number that indicates the point size of the particle</li>
   *          <li><strong>&quot;particleScale&quot;</strong>: a value that indicates the point's attenuation with respect to the camera, i.e. how much it scales</li>
   *        </ul>
   *    </li>
   * </ul>
   *
   */
  this.get = function(data) {

    var vertexShader         = null,
      fragmentShader         = null,
      lightingCallCount      = A3.Constants.MAX_LIGHTS,
      lightingCalls          = null,
      library                = A3.Core.Render.Shaders.ShaderLibrary;

    data                     = A3.Utility.checkValue(data, {});
    data.name                = A3.Utility.checkValue(data.name, "");
    data.type                = A3.Utility.checkValue(data.type, "");
    data.ambientReflection   = A3.Utility.checkValue(data.ambientReflection, 1);
    data.diffuseReflection   = A3.Utility.checkValue(data.diffuseReflection, 1);
    data.specularReflection  = A3.Utility.checkValue(data.specularReflection, 1);
    data.specularShininess   = A3.Utility.checkValue(data.specularShininess, 20);
    data.particleSize        = A3.Utility.checkValue(data.particleSize, 5);
    data.particleScale       = A3.Utility.checkValue(data.particleScale, 0.01);
    data.specularColor       = A3.Utility.checkValue(data.specularColor, new A3.Core.Math.Vector3(1,1,1));

    if(data.type === "Lambert") {
      data.specularReflection = "0.0";
    }

    switch(data.type) {

      /*
       * Puts the vertex in the correct place and
       * then sets its color to a hot pink
       */
      case "Pink":
        vertexShader      = library.Shaders.Pink.vertexShader;
        fragmentShader    = library.Shaders.Pink.fragmentShader;
        break;

      /*
       * Puts the vertex in the correct place and
       * then sets its color to the vertex colour (with
       * texture if appropriate)
       */
      case "Basic":
        vertexShader      = library.Shaders.Basic.vertexShader;
        fragmentShader    = library.Shaders.Basic.fragmentShader;

        break;

      /*
       * Puts the vertex in the correct place and
       * then sets its color to a hot pink
       */
      case "Particle":
        // set the chunk for inserting into the shader
        library.Chunks.ParticleSize   = convertNumber(data.particleSize);
        library.Chunks.ParticleScale  = convertNumber(data.particleScale);

        vertexShader      = replaceChunks(library.Shaders.Particle.vertexShader);
        fragmentShader    = replaceChunks(library.Shaders.Particle.fragmentShader);

        break;

      /*
       * Puts the vertex in the correct place and
       * then sets its color based on its normal value:
       *
       *   x, -1 to 1 = 0.0 - 1.0, red
       *   y, -1 to 1 = 0.0 - 1.0, green
       *   z,  0 to 1 = 0.0 - 1.0, blue
       */
      case "Normals":
        vertexShader      = library.Shaders.Normals.vertexShader;
        fragmentShader    = library.Shaders.Normals.fragmentShader;

        break;

      /*
       * I think we can consider, broadly, Phong and Lambert the same
       * way. Phong just has specular on top. In both cases we're effectively
       * using Gouraud shading since we set the color at the vertex level.
       */
      case "Phong":
      case "Lambert":

        // start with nothing
        lightingCalls = "";

        // go through the lights
        for(lightingCallCount = 0; lightingCallCount < A3.Constants.MAX_LIGHTS; lightingCallCount++) {

          /*
           * Here we add on the effects of the lights
           */
          lightingCalls += "addLight(" +
                     "lightDiffuseColor," +
                     "lightSpecularColor," +
                     "uLightSources[" + lightingCallCount + "]," +
                     "aWorldVertexPosition," +
                     "aVertEyeNormal," +
                     "uEyeDirection," +
                      convertNumber(data.diffuseReflection) + "," +
                      convertNumber(data.specularReflection) + "," +
                      convertNumber(data.specularShininess) + "," +
                      convertVector(data.specularColor) +");\n";

        }

        // set the chunk for inserting into the shader
        library.Chunks.LightingCalls = lightingCalls;

        // now pull the shaders out and replace the chunks
        vertexShader     = replaceChunks(library.Shaders.PhongLambert.vertexShader);
        fragmentShader   = replaceChunks(library.Shaders.PhongLambert.fragmentShader);

        break;
    }

    return new A3.Core.Render.Shaders.Shader({
      name: data.name,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      texture: data.texture,
      environmentMap: data.environmentMap,
      attributes: data.attributes,
      uniforms: data.uniforms
    });
  };

  /**
   * Replaces the chunks of GLSL with others, so
   * things like the lighting code or variables
   * we want to bake in
   *
   * @param {String} shader The shader to look at
   * @private
   */
  function replaceChunks(shader) {

    var chunkPattern   = /CHUNK\[([^\]]*)\]/,
      library          = A3.Core.Render.Shaders.ShaderLibrary;

    while(chunkPattern.test(shader)){
      chunk  = shader.match(chunkPattern);
      shader = shader.replace(chunk[0], library.Chunks[chunk[1]]);
    }

    return shader;
  }

  /**
   * Converts a number for GLSL, so basically parses a float out
   * and ensures it has a trailing .0 if needed
   *
   * @param {Number} number The number to convert
   * @private
   */
  function convertNumber(number) {
    if(typeof number === "number") {
      number = number.toString();
      if(parseInt(number, 10) === parseFloat(number, 10)) {
        number = number + ".0";
      }
    } else {
      number = "0.0";
    }
    return number;
  }

  /**
   * Converts a vector for use in GLSL. Lovely.
   *
   * @param {A3.Core.Math.Vector3} vector The vector to convert
   * @private
   */
  function convertVector(vector) {

    return "vec3(" + convertNumber(vector.x) + "," +
                     convertNumber(vector.y) + "," +
                     convertNumber(vector.z) + ")";
  }
};

// shortcut
A3.ShaderLibrary = new A3.Core.Render.Shaders.ShaderLibrary();
