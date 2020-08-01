var input = new Input();
var converter = new Converter();
var previews = new Previews();

var syncScroll = function(th, other)
{
    other.scrollTop = th.scrollTop;
    other.scrollLeft = th.scrollLeft;
};

//Load file from input lield and input area.
input.getField().addEventListener('change', input.loadFromField);
input.getArea().addEventListener('dragover', input.areaDragOverHandler, false);
input.getArea().addEventListener('drop', input.loadFromArea, false);

// Sync scroll for preview and source images.
document.getElementById("preview-source").addEventListener('scroll', function() {
    syncScroll(this, document.getElementById("preview-result"));
});
document.getElementById("preview-result").addEventListener('scroll', function() {
    syncScroll(this, document.getElementById("preview-source"));
});

converter.getCreateButton().addEventListener('click', converter.convert);
converter.getFullScreenButton().addEventListener('click', converter.fullScreen);
