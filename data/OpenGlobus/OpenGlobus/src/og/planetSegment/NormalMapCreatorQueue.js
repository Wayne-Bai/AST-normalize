goog.provide('og.planetSegment.NormalMapCreatorQueue');

goog.require('og.inheritance');
goog.require('og.utils.NormalMapCreator');
goog.require('og.QueueArray');

og.planetSegment.NormalMapCreatorQueue = function (width, height) {
    og.inheritance.base(this, width, height);

    this.active = true;

    this._counter = 0;
    this._pendingsQueue = new og.QueueArray();
};

og.inheritance.extend(og.planetSegment.NormalMapCreatorQueue, og.utils.NormalMapCreator);

og.planetSegment.NormalMapCreatorQueue.prototype.shift = function (segment) {

    if (this.active) {
        segment._inTheQueue = true;
        if (this._counter >= 1) {
            this._pendingsQueue.unshift(segment);
        } else {
            this._exec(segment);
        }
    }
};

og.planetSegment.NormalMapCreatorQueue.prototype.queue = function (segment) {

    if (this.active || segment.zoomIndex <= segment.planet.terrainProvider.minZoom) {
        segment._inTheQueue = true;
        if (this._counter >= 1) {
            this._pendingsQueue.push(segment);
        } else {
            this._exec(segment);
        }
    }
};

og.planetSegment.NormalMapCreatorQueue.prototype._exec = function (segment) {
    this._counter++;
    var that = this;
    setTimeout(function () {
        segment.createNormalMapTexture();
        segment._inTheQueue = false;
        that._dequeueRequest();
    }, 0);
};

og.planetSegment.NormalMapCreatorQueue.prototype._dequeueRequest = function () {
    this._counter--;
    if (this._pendingsQueue.length && this._counter < 1) {
        var req;
        if (req = this._whilePendings())
            this._exec(req);
    }
};

og.planetSegment.NormalMapCreatorQueue.prototype._whilePendings = function () {
    while (this._pendingsQueue.length) {
        var seg = this._pendingsQueue.pop();
        if (seg.terrainReady && seg.node.getState() != og.quadTree.NOTRENDERING && seg._inTheQueue) {
            return seg;
        }
        seg._inTheQueue = false;
    }
    return null;
};
