define(function(require, exports, module){
    var standard = require('./standard');
    var taiko = require('./taiko');
    var ctb = require('./ctb');
    var mania = require('./mania');

    return {
        createStage: function(osu){
            switch (osu.meta.Mode){
                case 3:
                    return new mania(osu);
                case 0:
                default:
                    return new standard(osu);
            }
        }
    }
});