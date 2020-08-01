﻿(function () {
    "use strict";


    WinJS.UI.Pages.define("/demos/webgl/webgl.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            function shaderProgram(gl, vs, fs) {
                var prog = gl.createProgram();
                var addshader = function (type, source) {
                    var s = gl.createShader((type == 'vertex') ?
                        gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
                    gl.shaderSource(s, source);
                    gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                        throw "Could not compile " + type +
                            " shader:\n\n" + gl.getShaderInfoLog(s);
                    }
                    gl.attachShader(prog, s);
                };
                addshader('vertex', vs);
                addshader('fragment', fs);
                gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                    throw "Could not link the shader program!";
                }
                return prog;
            }

            function attributeSetFloats(gl, prog, attr_name, rsize, arr) {
                gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
                    gl.STATIC_DRAW);
                var attr = gl.getAttribLocation(prog, attr_name);
                gl.enableVertexAttribArray(attr);
                gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
            }

            function draw() {
                try {
                    var canvasWebGL = document.getElementById("webgl");

                    var gl = canvasWebGL.getContext("webgl") || canvasWebGL.getContext("experimental-webgl");
                    if (!gl) { throw "x"; }
                } catch (err) {
                    throw "Your web browser does not support WebGL!";
                }
                gl.clearColor(0.8, 0.8, 0.8, 1);
                gl.clear(gl.COLOR_BUFFER_BIT);

                var prog = shaderProgram(gl,
                    "attribute vec3 pos;" +
                    "void main() {" +
                    "	gl_Position = vec4(pos, 2.0);" +
                    "}",
                    "void main() {" +
                    "	gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);" +
                    "}"
                );
                gl.useProgram(prog);

                attributeSetFloats(gl, prog, "pos", 3, [
                    -1, 0, 0,
                    0, 1, 0,
                    0, -1, 0,
                    1, 0, 0
                ]);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }

            function init() {
                try {
                    draw();
                } catch (e) {
                    alert("Error: " + e);
                }
            }
            setTimeout(init, 100);

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();
