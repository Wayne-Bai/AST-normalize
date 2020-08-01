/**
 * ace editor with custom settings to display information i.e tag listings
 **/

function initInfoPane() {
    // info pane will always be named "info-pane"
    var editor = ace.edit("info-pane");
    editor.setShowPrintMargin(false);
    editor.setShowFoldWidgets(false);
    editor.setTheme("ace/theme/solarized_dark");
    editor.setReadOnly(true);
    editor.renderer.setShowGutter(false);
    return editor;
}

function infoInstance() {
    this.infoPane = initInfoPane();
    this.visible = false;
}

infoInstance.prototype.showTags = function() {
    var rawTags = Shim.globalState.getAvailableTags();
    var entries = [];
    for(var i = 0; i < rawTags.length; i++ ) {
        var rawEntry = rawTags[i];
        var str = [
          rawEntry["file_name"],
          "line number: " + rawEntry["line_num"],
          "type: " + rawEntry["type"]
        ].join("    ");
        entries.push(str);
    }
    this.setText(entries.join("\n"));
    this.show();
    this.infoPane.focus();
};

infoInstance.prototype.setText = function(text) {
    this.infoPane.setValue("");
    this.infoPane.moveCursorTo(0, 0);
    this.infoPane.insert(text);
    this.infoPane.moveCursorTo(0, 0);
};

infoInstance.prototype.getRow = function() {
    return this.infoPane.getCursorPosition()["row"];
};

infoInstance.prototype.getCurrentTagOption = function() {
    // 0 indexed
    return Shim.globalState.getAvailableTags()[this.getRow()];
};

infoInstance.prototype.show = function() {
    this.visible = true;
    $("#info-pane").show();
};

infoInstance.prototype.hide = function() {
    this.visible = false;
    $("#info-pane").hide();
};
