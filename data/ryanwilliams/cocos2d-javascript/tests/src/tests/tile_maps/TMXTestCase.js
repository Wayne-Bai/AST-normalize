'use strict'

var TestCase = require('../TestCase')
  , geo      = require('geometry')

var kTagTileMap = 1

function TMXTestCase () {
    TMXTestCase.superclass.constructor.call(this)

    this.isMouseEnabled = true
}

TMXTestCase.inherit(TestCase, /** @lends TMXTestCase# */ {
    mouseDragged: function (event) {
        var node = this.getChild({tag: kTagTileMap})
        var currentPos = node.position
        node.position = geo.ccpAdd(currentPos, new geo.Point(event.deltaX, event.deltaY))
        return true
    }
})

module.exports = TMXTestCase

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
