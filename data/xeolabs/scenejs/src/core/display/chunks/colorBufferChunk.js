/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"colorBuffer",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (frameCtx) {

        if (!frameCtx.transparent) { // Blending forced when rendering transparent bin

            var blendEnabled = this.core.blendEnabled;

            var gl = this.program.gl;

            if (frameCtx.blendEnabled != blendEnabled) {
                if (blendEnabled) {
                    gl.enable(gl.BLEND);
                } else {
                    gl.disable(gl.BLEND);
                }
                frameCtx.blendEnabled = blendEnabled;
            }

            var colorMask = this.core.colorMask;
            gl.colorMask(colorMask.r, colorMask.g, colorMask.b, colorMask.a);
        }
    }
});
