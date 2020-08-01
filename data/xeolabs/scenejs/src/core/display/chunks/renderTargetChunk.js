/**
 *   Create display state chunk type for draw and pick render of renderTarget
 */
SceneJS_ChunkFactory.createChunkType({

    type: "renderTarget",

    // Avoid reapplication of this chunk type after a program switch.
    programGlobal: true,

    draw: function (frameCtx) {

        var gl = this.program.gl;

        // Flush and unbind any render buffer already bound
        if (frameCtx.renderBuf) {
            gl.flush();
            frameCtx.renderBuf.unbind();
            frameCtx.renderBuf = null;
        }

        // Set depthMode false and bail if no render buffer for this chunk
        var renderBuf = this.core.renderBuf;
        if (!renderBuf) {
            frameCtx.depthMode = false;
            return;
        }

        // Bind this chunk's render buffer, set depthMode, enable blend if depthMode false, clear buffer
        renderBuf.bind();

        frameCtx.depthMode = (this.core.bufType === "depth");

        if (!frameCtx.depthMode) {

            //  Enable blending for non-depth targets
            if (frameCtx.blendEnabled) {
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
        }

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(frameCtx.ambientColor[0], frameCtx.ambientColor[1], frameCtx.ambientColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        frameCtx.renderBuf = renderBuf;
    }
});