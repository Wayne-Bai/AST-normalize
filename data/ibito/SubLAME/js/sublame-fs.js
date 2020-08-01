var fs = require("fs");

var SublameFs = function (codeMirror) {
    this.codeMirror = codeMirror;
};

SublameFs.prototype.writeFile = function(fileName, text) {
    fs.writeFile(fileName, text, function(err) {
        if (err) {
            alert("error");
        }
    });
};

SublameFs.prototype.openFile = function(fileName) {
    var codeMirror = this.codeMirror;
    fs.readFile(fileName, 'utf-8', function (error, contents) {
        if (error && error.errno === 34) {
            return;
        }
        codeMirror.setValue(contents);
        codeMirror.setOption('isNewFile', false);
        codeMirror.setOption('fileName', fileName);
    });
};

SublameFs.prototype.getFilenamesInDirectory = function (directoryPath) {
    return fs.readdirSync(directoryPath);
};

exports.SublameFs = SublameFs;
