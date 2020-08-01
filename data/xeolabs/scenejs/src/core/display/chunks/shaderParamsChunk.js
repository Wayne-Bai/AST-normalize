/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "shaderParams",

    build : function() {
    },

    drawAndPick: function(frameCtx) {

        var paramsStack = this.core.paramsStack;

        if (paramsStack) {

            var program = frameCtx.pick ? this.program.pick : this.program.draw;
            var params;
            var name;

            for (var i = 0, len = paramsStack.length; i < len; i++) {
                params = paramsStack[i];
                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        program.setUniform(name, params[name]);  // TODO: cache locations
                    }
                }
            }
        }
    }
});