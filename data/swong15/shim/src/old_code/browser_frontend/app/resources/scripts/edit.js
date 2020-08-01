function initAceEditor(elementName, index) {
    // editor name is an arbitrary div name
    var editor = ace.edit(elementName);
    editor.setShowPrintMargin(false);
    editor.setShowFoldWidgets(false);
    editor.setTheme("ace/theme/solarized_dark");
    editor.getSession().setMode("ace/mode/python");
    editor.setKeyboardHandler("ace/keyboard/vim");
    editor.editorIndex = index;
    editor.on("focus", function() {
        $("#statusbar").text(editor.fileName);
        Shim.currWindowIndex = editor.editorIndex;
    });
    return editor;
}

function editInstance(elementName, index) {
    this.fileName = "";
    this.elementName = elementName;
    this.tagHistory = [];
    this.editor = initAceEditor(elementName, index);
}

// some files end with "\n" and we should ignore it
function handleEndingNewline(text) {
  return text.slice(-1) == "\n" ? text.substring(0, text.length - 1) : text;
}

editInstance.prototype.getIndex = function(index) {
    return this.editor.editorIndex;
};

editInstance.prototype.setIndex = function(index) {
    this.editor.editorIndex = index;
};

editInstance.prototype.initText = function() {
    var fillText = function(data) {
        var fileData = JSON.parse(data)['args'];
        var file = fileData[0];
        this.fileName = fileData[1];

        this.editor.insert(handleEndingNewline(file));

        this.editor.moveCursorTo(0, 0);
        var UndoManager = require("ace/undomanager").UndoManager;
        this.editor.getSession().setUndoManager(new UndoManager());
        this.editor.fileName = this.fileName;
        $("#statusbar").text(this.fileName);
    };

    $.post("http://localhost:10003",
           {"command": "init", "args": ""},
           fillText.bind(this));
};

editInstance.prototype.recordTagState = function() {
    var cursorPos = this.editor.getCursorPosition();
    var state = {
        "fileName": this.editor.fileName,
        "row": cursorPos["row"],
        "col": cursorPos["column"]
    };
    this.tagHistory.push(state);
};

editInstance.prototype.jumpToTag = function(fileName, lineNum) {
    var fillText = function(data) {
        var fileText = JSON.parse(data)['args'];
        // line numbers seem to be zero indexed?
        this.changeFileCursorPos(fileText, fileName, lineNum - 1, 0);
    };

    this.recordTagState();
    $.post("http://localhost:10003",
           {"command": "jump_to_file", "args": fileName},
           fillText.bind(this));
};

editInstance.prototype.backtrackTagJump = function() {
    if(this.tagHistory.length > 0) {
        var prevState = this.tagHistory.pop();
        var fillText = function(data) {
            var fileText = JSON.parse(data)['args'];
            this.changeFileCursorPos(
              fileText,
              prevState["fileName"],
              prevState["row"],
              prevState["col"]
            );
        };

        $.post("http://localhost:10003",
               {"command": "jump_to_file", "args": prevState["fileName"]},
               fillText.bind(this));
    }
};

editInstance.prototype.changeFile = function(fileText, fileName) {
    this.changeFileCursorPos(fileText, fileName, 0, 0);
};

editInstance.prototype.changeFileCursorPos = function(fileText, fileName, lineNum, rowNum) {
    this.fileName = fileName;
    this.editor.setValue("");
    this.editor.fileName = fileName;
    this.editor.moveCursorTo(0, 0);

    this.editor.insert(handleEndingNewline(fileText));

    var UndoManager = require("ace/undomanager").UndoManager;
    this.editor.getSession().setUndoManager(new UndoManager());
    this.editor.moveCursorTo(lineNum, rowNum);
    $("#statusbar").text(this.editor.fileName);
};

editInstance.prototype.selectWord = function() {
    var oldLoc = this.editor.selection.getCursor();
    this.editor.selection.selectAWord();
    var word = this.editor.getCopyText();
    this.editor.clearSelection();
    this.editor.moveCursorTo(oldLoc["row"], oldLoc["column"]);
    return word.trim();
};
