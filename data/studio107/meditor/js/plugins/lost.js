(function (meditor, meditorBlock) {
    "use strict";

    var LostBlock = meditorBlock.extend({
        getI18nName: function() {
            return this.t('Lost block');
        }
    });

    meditor.pluginAdd('lost', LostBlock);
})(meditor, meditorBlock);