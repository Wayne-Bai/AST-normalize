function state() {
    this.copyBuffer = "";
    this.copyBufferIsLine = false;
    this.availableTags = [];
    this.currentFileOption = 0;
    this.numFileOptions = 0;
    this.previousFileSearch = "";
    this.fileMatcherVisible = false;
}

function highlightFileOption(ind) {
    var element = $("#file-match-" + ind);
    element.css("background-color", "#657B83");
    element.css("color", "#002B36");
}

function revertHighlightFileOption(ind) {
    var element = $("#file-match-" + ind);
    element.css("background-color", "");
    element.css("color", "#839496");
}

state.prototype.getFileMatcherVisibility = function (){
    return this.fileMatcherVisible;
};

state.prototype.setFileMatcherVisibility = function(val) {
    this.fileMatcherVisible = val;
};

state.prototype.getCurrentFileOption = function() {
    var element = $("#file-match-" + this.currentFileOption);
    return element.text();
};

state.prototype.setPreviousFileSearch = function(search) {
    this.previousFileSearch = search;
};

state.prototype.getPreviousFileSearch = function() {
    return this.previousFileSearch;
};

state.prototype.resetFileOptions = function(optionCount) {
    this.currentFileOption = 0;
    this.fileOptionCount = optionCount;
};

state.prototype.highlightNextFileOption = function() {
    revertHighlightFileOption(this.currentFileOption);
    this.currentFileOption =
      this.currentFileOption + 1 === this.fileOptionCount ? this.currentFileOption : this.currentFileOption + 1;
    highlightFileOption(this.currentFileOption);
};

state.prototype.highlightPrevFileOption = function() {
    revertHighlightFileOption(this.currentFileOption);
    this.currentFileOption =
      this.currentFileOption - 1 < 0 ? this.currentFileOption : this.currentFileOption - 1;
    highlightFileOption(this.currentFileOption);
};

state.prototype.scrollDown = function() {
    this.currentFileOption = 0;
};

state.prototype.setAvailableTags = function(tagData) {
    this.availableTags = tagData;
};

state.prototype.getAvailableTags = function() {
    return this.availableTags;
};

state.prototype.yank = function(text, isLine) {
    this.copyBuffer = text;
    this.copyBufferIsLine = isLine;
};

state.prototype.getCopyState = function() {
    return [this.copyBuffer, this.copyBufferIsLine];
};
