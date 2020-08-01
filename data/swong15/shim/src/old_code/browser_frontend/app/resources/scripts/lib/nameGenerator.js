function nameGenerator() {
    this.count = 0;
}

nameGenerator.prototype.generateName = function() {
    this.count++;
    return "editor" + this.count;
}

nameGenerator = new nameGenerator();
