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
 */
var AEROTWIST       = AEROTWIST || {};
AEROTWIST.A3        = AEROTWIST.A3 || {};
AEROTWIST.A3.Sample = new function() {
  
  // internal vars
  var $container    = $('#container'),
  
      renderer      = null,
      scene         = null,
      camera        = null,
      width         = $container.width(),
      height        = $container.height(),
      aspect        = width / height,
      cube          = null,
      callbacks     = null,
      mouseDown     = false,
      lastMouseX    = null,
      lastMouseY    = null,
      time          = 0,
      explode       = false,
  
  // set some constants
      CUBE_COUNT    = 80,
      DEPTH         = 2500,
      WIDTH         = $container.width(),
      HEIGHT        = $container.height(),
      ASPECT        = WIDTH / HEIGHT,
      NEAR          = 0.1,
      FAR           = 5000,
      VIEW_ANGLE    = 45;
  
  /**
   * Initialize the scene
   */
  this.init = function() {
    
    setup();
    createObjects();
    addEventListeners();
    render();
    
  };
  
  /**
   * Sets up the scene, renderer and camera.
   */
  function setup() {
    renderer  = new A3.R(width, height),
    scene     = new A3.Scene(),
    camera    = new A3.Camera(VIEW_ANGLE, aspect, NEAR, FAR);
    
    camera.position.z = DEPTH;
    
    $container.append(renderer.domElement);
    $container.bind('selectstart', false);
  }
  
  /**
   * Seriously, read the function name. Take a guess.
   */
  function createObjects() {
    
    cube = new A3.Mesh({
      geometry: new A3.Cube(180),
      shader: A3.ShaderLibrary.get({type:"Normals"})
    });
    
    for(var c = 0; c < CUBE_COUNT; c++) {
      
      var mod2 = c%2,
        start = (mod2==0 ? -200 : 200),
        childCube = new A3.Mesh({
          geometry: new A3.Cube(100 - (c * .5)),
          shader: A3.ShaderLibrary.get({type:"Normals"})
        });
      
      childCube.randFactor        = 0.5 + Math.random();
      childCube.targetPosition    = new A3.V3(0,0,0);
      childCube.targetPosition.x  = start + Math.sin(c) * (mod2==0 ? -1 : 1) * (20 + c * 20);
      childCube.targetPosition.y  = start + Math.cos(c) * (mod2==0 ? -1 : 1) * (20 + c * 20);
      childCube.targetPosition.z  = start + Math.sin(c) * Math.cos(c) * (mod2==0 ? -1 : 1) * (20 + c * 20);
      
      childCube.target = cube.position;
      
      cube.add(childCube);
    }
    
    scene.add(cube);
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
      
          cube.rotation.x += (thisMouseY - lastMouseY) * 0.01;
          cube.rotation.y += (thisMouseX - lastMouseX) * 0.01;
          
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
    
    for(var c = 0; c < cube.children.length; c++) {
      var childCube = cube.children[c];
      
      if(explode) {
        camera.position.z += (3000 - camera.position.z) * .001;
        childCube.position.x += (childCube.targetPosition.x - childCube.position.x) * .10 * childCube.randFactor;
        childCube.position.y += (childCube.targetPosition.y - childCube.position.y) * .14 * childCube.randFactor;
        childCube.position.z += (childCube.targetPosition.z - childCube.position.z) * .18 * childCube.randFactor;
      } else {
        camera.position.z += (500 - camera.position.z) * .001;
        childCube.position.x -= (childCube.position.x) * .3;
        childCube.position.y -= (childCube.position.y) * .3;
        childCube.position.z -= (childCube.position.z) * .3;
      }
    }
    
    time++;
    if(time % 160 === 0) {
      explode = !explode;
    }
    
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
