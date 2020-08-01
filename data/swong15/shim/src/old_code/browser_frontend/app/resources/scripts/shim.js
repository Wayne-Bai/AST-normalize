function shim() {
    this.editors = [new editInstance("editor", 0)];
    this.infoPane = new infoInstance();
    this.fileSidebar = new sidebarInstance();
    this.globalState = new state();
    this.currWindowIndex = 0;
    this.openEditors = 1;
    setTimeout(this.editors[0].initText(), 300);
    setTimeout(this.fileSidebar.initMenu(), 5000);
}

shim.prototype.hideInfoPane = function() {
    this.infoPane.hide();
};

shim.prototype.getCurrentEditor = function() {
    return this.editors[this.currWindowIndex];
};

shim.prototype.focusCurrentEditor = function() {
    this.getCurrentEditor().editor.focus();
};

shim.prototype.jumpToFile = function(fileName) {
    this.getCurrentEditor().jumpToTag(fileName, 0);
};

shim.prototype.jumpToTag = function() {
    var editor = this.getCurrentEditor();
    runCommand("jumpToTag", editor.selectWord());
};

shim.prototype.processJumpToTag = function(tagData) {
    var editor = this.getCurrentEditor();
    if(tagData.length) {
      editor.jumpToTag(tagData[0]["file_name"], tagData[0]["line_num"]);
      this.globalState.setAvailableTags(tagData);
    }
};

shim.prototype.backtrackTagJump = function() {
    var editor = this.getCurrentEditor();
    editor.backtrackTagJump();
};

shim.prototype.goToTagOption = function() {
    var info = this.infoPane.getCurrentTagOption();
    this.getCurrentEditor().jumpToTag(info["file_name"], info["line_num"]);
};

shim.prototype.shiftFocusDown = function() {
    if(this.infoPane.visible) {
        this.infoPane.infoPane.focus();
    }
};

shim.prototype.shiftFocusUp = function() {
    if(this.currWindowIndex > -1) {
        this.getCurrentEditor().editor.focus();
    }
};

shim.prototype.shiftFocusLeft = function() {
    this.currWindowIndex = Math.max(this.currWindowIndex - 1, -1);
    if(this.currWindowIndex === -1) {
        $("#statusbar").text("file browser");
        $("#file-menu").show();
        this.fileSidebar.visible = true;
        this.resizeEditors();
    } else {
        this.editors[this.currWindowIndex].editor.setReadOnly(true);
        this.editors[this.currWindowIndex].editor.focus();
        $("#statusbar").text(this.editors[this.currWindowIndex].editor.fileName);
        this.editors[this.currWindowIndex].editor.setReadOnly(false);
    }
};

shim.prototype.shiftFocusRight = function() {
    this.currWindowIndex =
        Math.min(this.currWindowIndex + 1, this.editors.length - 1);
    this.editors[this.currWindowIndex].editor.focus();
    $("#statusbar").text(this.editors[this.currWindowIndex].editor.fileName);
};

shim.prototype.resizeEditors = function() {
    var numEditors = this.editors.length;
    var leftBound = this.fileSidebar.visible ? 20 : 0;

    var paneOffset = this.fileSidebar.visible ? "20%" : "0%";
    $("#info-pane").css("left", paneOffset);
    $("#file-match-container").css("left", paneOffset);

    var perEditorWidth = (100 - leftBound) / numEditors;
    // freaking javascript string type conversions....
    for(var i = 0; i < numEditors; i++) {
        this.editors[i].index = i;
        var name = "#" + this.editors[i].elementName;
        var leftDist = leftBound + (i * perEditorWidth);
        var rightDist = (numEditors - i - 1) * perEditorWidth;
        $(name).css("left", leftDist + "%");
        $(name).css("right", rightDist + "%");
    }
};

shim.prototype.createEditor = function() {
    var elementName = nameGenerator.generateName();
    $("#container").append("<div id=" + elementName + "></div>");
    $("#" + elementName).css("position", "fixed");
    $("#" + elementName).css("top", "0");
    $("#" + elementName).css("bottom", "30px");
    for(var i = 0; i < this.editors.length; i++) {
        var instance = this.editors[i];
        // increase index values by 1 to accomodate "new" window
        instance.setIndex(instance.getIndex() + 1);
    }
    Shim.editors.unshift(new editInstance(elementName, 0));
    Shim.resizeEditors();
};

shim.prototype.openFile = function(fileText, fileName) {
    if(this.openEditors < 3) {
        this.createEditor();
        this.openEditors++;
    }
    this.editors[0].changeFile(fileText, fileName);
};

Shim = new shim();
