'use strict';
// *****************************************************
// File Factory
// *****************************************************

module.factory('File', ['$HUB', '$stateParams', function($HUB, $stateParams) {

    var images = ['jpg', 'jpeg', 'png', 'bmp', 'psd', 'tiff', 'ico'];

    var isImage = function(filename) {
        var ext = filename.split('.').pop().toLowerCase();
        return images.indexOf(ext) !== -1 ? true : false;
    };

    return {
        getTreeTypes: function(tree) {
            tree.tree.forEach(function(node) {
                if(node.type === 'blob' && isImage(node.path)) {
                    node.type = 'image';
                }
            });
            return tree;
        },

        getFileTypes: function(files) {
            files.forEach(function(file) {
                if(isImage(file.filename)) {
                    file.image = file.raw_url;
                }
            });
            return files;
        }
    };
}]);
