/**
 * Copyright (C) 2011 by Paul Lewis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * The only way is up.
 */
var AEROTWIST       = AEROTWIST || {};
AEROTWIST.A3        = AEROTWIST.A3 || {};
AEROTWIST.A3.Sample = new function() {

  // internal vars
  var $container            = $('#container'),

      renderer              = null,
      scene                 = null,
      camera                = null,
      width                 = $container.width(),
      height                = $container.height(),
      aspect                = width / height,
      monkey                 = null,
      floor                 = null,
      environmentMap        = null,
      environmentMapLoaded  = false,
      modelLoaded           = false,

      callbacks             = null,
      mouseDown             = false,
      lastMouseX            = null,
      lastMouseY            = null,
      angle                 = 0,
      phase                 = 0,

  // set some constants
      RADIUS                = 200,
      SCALE                 = 90,
      DEPTH                 = 500,
      WIDTH                 = $container.width(),
      HEIGHT                = $container.height(),
      ASPECT                = WIDTH / HEIGHT,
      NEAR                  = 0.1,
      FAR                   = 3000,
      VIEW_ANGLE            = 45,
      AXIS_Y                = 1,
      AXIS_X                = 2,
      AXIS_Z                = 3,
      AXIS_XY               = 4,
      AXIS_XZ               = 5,
      AXIS_YZ               = 6;

  this.phaseRate = 0.1;
  this.magnitude = 12;
  this.axisOfUndulation = AXIS_Y;

  function checkForLoad() {

    if(environmentMapLoaded && modelLoaded) {

      $("#loading").addClass('hidden');

      // wait for the loading message to hide :)
      setTimeout(function() {

        $("#loading").hide();

        createGUI();
        addEventListeners();
        render();
      }, 500);
    }
  }

  function createGUI() {
    var gui = new DAT.GUI({height:95}),
    $gui  = $('#guidat');

    $gui.css({
      right: 'auto',
      left: 10
    });

    gui.add(AEROTWIST.A3.Sample, 'phaseRate').name('Speed').min(0.01).max(0.5);
    gui.add(AEROTWIST.A3.Sample, 'magnitude').name('Magnitude').min(1).max(20);
    gui.add(AEROTWIST.A3.Sample, 'axisOfUndulation').name('Axis of Undulation').options({
      'Y': 1,
      'X': 2,
      'Z': 3,
      'XY': 4,
      'XZ': 5,
      'YZ': 6
    });
  }

  /**
   * Initialize the scene
   */
  this.init = function() {

    var loader = new A3.MeshLoader("../models/monkey-low.a3", function(geometry) {

        geometry.colors = [];

        for(var v = 0; v < geometry.vertices.length; v++) {
          geometry.colors.push(new A3.V3(1,1,1));
          geometry.vertices[v].position.x *= SCALE;
          geometry.vertices[v].position.y *= SCALE;
          geometry.vertices[v].position.z *= SCALE;
        }

        geometry.updateVertexPositionArray();
        geometry.updateVertexColorArray();

        setup();
        createObjects(geometry);

        modelLoaded = true;
        checkForLoad();
    });

    loader.load();

    environmentMap = new A3.EnvironmentMap({
      px: "../environments/stormy-days/pos-x.jpg",
      nx: "../environments/stormy-days/neg-x.jpg",
      py: "../environments/stormy-days/pos-y.jpg",
      ny: "../environments/stormy-days/neg-y.jpg",
      pz: "../environments/stormy-days/pos-z.jpg",
      nz: "../environments/stormy-days/neg-z.jpg",
      callback: function() {
        environmentMapLoaded = true;
        checkForLoad();
      }
    }, 0);

  };

  /**
   * Sets up the scene, renderer and camera.
   */
  function setup() {
    renderer  = new A3.R(width, height),
    scene     = new A3.Scene(),
    camera    = new A3.Camera(VIEW_ANGLE, aspect, NEAR, FAR);

    camera.position.z = DEPTH;
    camera.position.y = 130;
    camera.target.y = 120;

    $container.append(renderer.domElement);
    $container.bind('selectstart', false);
  }

  /**
   * Seriously, read the function name. Take a guess.
   */
  function createObjects(geometry) {

    var ambientLight      = new A3.AmbientLight(new A3.V3(1,1,1), 0.04),
        directionalLight  = new A3.DirectionalLight(new A3.V3(1,1,1), 1),
        directionalLight2 = new A3.DirectionalLight(new A3.V3(1,1,1), 0.4);

    directionalLight.position   = new A3.V3(100, 100, 130);
    directionalLight2.position  = new A3.V3(-45, -30, 10);

    monkey = new A3.Mesh({
      geometry: geometry,
      shader: A3.ShaderLibrary.get({
        type:"Phong",
        specularShininess: 10,
        specularReflection: 0.1,
        environmentMap: environmentMap
      })
    });

    floor = new A3.Mesh({
      geometry: new A3.Plane(400,400,2,2),
      transparent: true,
      shader: A3.ShaderLibrary.get({
        name:"Floor",
        type:"Basic",
        texture: new A3.Texture("../textures/floor.png", 1)
      })
    });

    monkey.position.y   = 150;

    for(var w = 0; w < monkey.geometry.vertices.length; w++) {

      var thisVert = monkey.geometry.vertices[w];

      thisVert.originalPosition = new A3.V3(0,0,0);
      thisVert.originalPosition.copy(thisVert.position);

      thisVert.dirVector = new A3.V3(0,0,0);
      thisVert.dirVector.copy(thisVert.position);
      thisVert.dirVector.normalize();

    }

    floor.rotation.x  = -Math.PI * .5;
    floor.position.y  = 0;

    scene.add(monkey);
    scene.add(floor);
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(directionalLight2);
  }

  /**
   * Sets up the event listeners so we
   * can click and drag the cube around
   */
  function addEventListeners() {

    /*
     * Set up the callbacks
     */
    callbacks = {

      /**
       * When the mouse is depressed
       */
      onMouseDown: function(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      },

      /**
       * When the mouse has cheered up
       */
      onMouseUp: function(event) {
        mouseDown = false;
      },

      /**
       * When the mouse gets his boogie on
       */
      onMouseMove: function(event) {

        if(mouseDown) {
          var thisMouseX = event.clientX;
          var thisMouseY = event.clientY;

          monkey.rotation.y += (thisMouseX - lastMouseX) * 0.01;
          monkey.rotation.x += (thisMouseY - lastMouseY) * 0.01;

          lastMouseY = thisMouseY;
          lastMouseX = thisMouseX;
        }
      },

      onWindowResize: function() {

        width         = $container.width();
        height        = $container.height();
        aspect        = width / height;

        renderer.resize(width, height);
        camera.projectionMatrix.perspective(VIEW_ANGLE, aspect, NEAR, FAR);

      }
    }

    $container.mousedown(callbacks.onMouseDown);
    $container.mouseup(callbacks.onMouseUp);
    $container.mousemove(callbacks.onMouseMove);
    $(window).resize(callbacks.onWindowResize);

  }

  /**
   * Do a render
   */
  function render() {
    requestAnimFrame(render);

    var wVerts = monkey.geometry.vertices,
        wVertCount = wVerts.length,
    floorScale = 0.9 + (Math.cos(phase + 0.6) * 0.005 * AEROTWIST.A3.Sample.magnitude);

    while(wVertCount--) {

      var thisVert  = wVerts[wVertCount];

      if(AEROTWIST.A3.Sample.axisOfUndulation !== AEROTWIST.A3.Sample.lastAxisOfUndulation) {

        switch(AEROTWIST.A3.Sample.axisOfUndulation) {
          case AXIS_X:  thisVert.axisValue = thisVert.originalPosition.x * 0.05; break;
          case AXIS_Y:  thisVert.axisValue = thisVert.originalPosition.y * 0.05; break;
          case AXIS_Z:  thisVert.axisValue = thisVert.originalPosition.z * 0.05; break;
          case AXIS_XY: thisVert.axisValue = thisVert.originalPosition.x * thisVert.originalPosition.y * 0.0015; break;
          case AXIS_XZ: thisVert.axisValue = thisVert.originalPosition.x * thisVert.originalPosition.z * 0.0015; break;
          case AXIS_YZ: thisVert.axisValue = thisVert.originalPosition.y * thisVert.originalPosition.z * 0.0015; break;
        }
      }

      var vertPhase = Math.cos(phase + thisVert.axisValue);

      thisVert.position.x = thisVert.originalPosition.x + vertPhase * thisVert.dirVector.x * AEROTWIST.A3.Sample.magnitude;
      thisVert.position.y = thisVert.originalPosition.y + vertPhase * thisVert.dirVector.y * AEROTWIST.A3.Sample.magnitude;
      thisVert.position.z = thisVert.originalPosition.z + vertPhase * thisVert.dirVector.z * AEROTWIST.A3.Sample.magnitude;

    }

    AEROTWIST.A3.Sample.lastAxisOfUndulation = AEROTWIST.A3.Sample.axisOfUndulation;

    phase += AEROTWIST.A3.Sample.phaseRate;

  floor.scale = new A3.V3(floorScale, floorScale, floorScale);

    monkey.geometry.calculateNormals();
    monkey.geometry.updateVertexPositionArray();
    monkey.geometry.updateVertexNormalArray();

    renderer.render(scene, camera);

  }
};

AEROTWIST.A3.Sample.init();
