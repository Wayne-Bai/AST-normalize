'use strict'

var util = require('util')
  , geo = require('geometry')


var kCCTouchSelectorBeganBit = 1 << 0
  , kCCTouchSelectorMovedBit = 1 << 1
  , kCCTouchSelectorEndedBit = 1 << 2
  , kCCTouchSelectorCancelledBit = 1 << 3
  , kCCTouchSelectorAllBits = ( kCCTouchSelectorBeganBit | kCCTouchSelectorMovedBit | kCCTouchSelectorEndedBit | kCCTouchSelectorCancelledBit)

// Touch types
var kCCTouchBegan     = 1
  , kCCTouchMoved     = 2
  , kCCTouchEnded     = 3
  , kCCTouchCancelled = 4
  , kCCTouchMax       = 5

function TouchHandler (delegate, priority) {
    this.delegate = delegate
    this.priority = priority
}

function StandardTouchHandler (delegate, priority) {
    StandardTouchHandler.superclass.constructor.call(this, delegate, priority)
}
StandardTouchHandler.inherit(TouchHandler)

function TargetedTouchHandler (delegate, priority, swallowsTouches) {
    TargetedTouchHandler.superclass.constructor.call(this, delegate, priority)

    this.swallowsTouches = swallowsTouches
    this.claimedTouches = {}
}
TargetedTouchHandler.inherit(TouchHandler)

/**
 * @class
 * This singleton is responsible for dispatching Touch events on some devices
 *
 * @memberOf cocos
 * @singleton
 */
function TouchDispatcher () {
    this.standardHandlers = []
    this.targetedHandlers = []

    this._toRemove = false
    this._toAdd    = false
    this._toQuit   = false
    this._locked   = false

    this._handlersToAdd = []
    this._handlersToRemove = []
}

TouchDispatcher.inherit(Object, /** @lends cocos.TouchDispatcher# */ {
    dispatchEvents: true
  , standardHandlers: null
  , targetedHandlers: null

  , forceAddHandler: function (handler, array) {
        var i = 0
        array.forEach(function (h) {
            if (h.priority < handler.priority) {
                i++
            }

            if (h.delegate == handler.delegate) {
                throw new Error ("Delegate already added to touch dispatcher")
            }
        }.bind(this))

        array.splice(i, 0, handler)
    }

  , addStandardDelegate: function (delegate, priority) {
        var handler = new StandardTouchHandler(delegate, priority)

        if (this._locked) {
            this._handlersToAdd.push(handler)
            this._toAdd = true
        } else {
            this.forceAddHandler(handler, this.standardHandlers)
        }
    }

  , addTargetedDelegate: function (delegate, priority, swallowsTouches) {
        var handler = new TargetedTouchHandler(delegate, priority, !!swallowsTouches)

        if (this._locked) {
            this._handlersToAdd.push(handler)
            this._toAdd = true
        } else {
            this.forceAddHandler(handler, this.targetedHandlers)
        }
    }

  , forceRemoveDelegate: function (delegate) {
        var i, handler
        for (i = 0; i < this.targetedHandlers.length; i++) {
            handler = this.targetedHandlers[i]
            if (handler.delegate === delegate) {
                this.targetedHandlers.splice(i, 1)
                handler.claimedTouches
                break
            }
        }

        for (i = 0; i < this.standardHandlers.length; i++) {
            handler = this.standardHandlers[i]
            if (handler.delegate === delegate) {
                this.standardHandlers.splice(i, 1)
                break
            }
        }
    }

  , removeDelegate: function (delegate) {
        if (!delegate) {
            return
        }

        if (this._locked) {
            this._handlersToRemove.push(delegate)
            this._toRemove = true
        } else {
            this.forceRemoveDelegate(delegate)
        }
    }

  , forceRemoveAllDelegates: function () {
        this.standardHandlers.splice(0, this.standardHandlers.length)
        this.targetedHandlers.splice(0, this.targetedHandlers.length)
    }

  , removeAllDelegates: function () {
        if (this._locked) {
            this._toQuit = true
        } else {
            this.forceRemoveAllDelegates()
        }
    }

  , findHandler: function (delegate) {
        var i, handler
        for (i = 0; i < this.targetedHandlers.length; i++) {
            handler = this.targetedHandlers[i]
            if (handler.delegate === delegate) {
                return handler
            }
        }

        for (i = 0; i < this.standardHandlers.length; i++) {
            handler = this.standardHandlers[i]
            if (handler.delegate === delegate) {
                return handler
            }
        }

        return null
    }
  , rearrangeHandlers: function (array) {
        array.sort(function (first, second) {
            return first.priority - second.priority
        })
    }

  , setDelegatePriority: function (delegate, priority) {
        if (!delegate) throw new Error("Got nil touch delegate")

        var handler = this.findHandler(delegate)
        if (!handler) throw new Error("Delegate not found")

        handler.priority = priority

        this.rearrangeHandlers(this.targetedHandlers)
        this.rearrangeHandlers(this.standardHandlers)
    }

  , ontouches: function (evt, touchType) {
        this._locked = true

        var director = require('./Director').Director.sharedDirector

        var i, j, touch, handler, idx

        // Can't modify the evt.touches object directly -- and we only need to if we're doing both types of handlers
        var needsMutableSet = this.targetedHandlers.length && this.standardHandlers.length
          , mutableTouches = needsMutableSet ? Array.prototype.splice.call(evt.changedTouches, 0) : evt.changedTouches

        for (i = 0; i < mutableTouches.length; i++) {
            touch = mutableTouches[i]
            touch.locationInCanvas = director.convertTouchToCanvas(touch)
        }

        // Process Targeted handlers first
        if (this.targetedHandlers.length > 0) {
            var claimed = false
            for (i = 0; i < mutableTouches.length; i++) {
                touch = mutableTouches[i]

                for (j = 0; j < this.targetedHandlers.length; j++) {
                    handler = this.targetedHandlers[j]

                    claimed = false
                    // Touch began
                    if (touchType == kCCTouchBegan) {
                        if (handler.delegate.touchBegan) {
                            claimed = handler.delegate.touchBegan({touch: touch, originalEvent: evt})
                        }
                        if (claimed) {
                            handler.claimedTouches[touch.identifier] = touch
                        }
                    }
                    // Touch move, end, cancel
                    else if (handler.claimedTouches[touch.identifier]) {
                        claimed = true
                        switch (touchType) {
                        case kCCTouchMoved:
                            if (handler.delegate.touchMoved) handler.delegate.touchMoved({touch: touch, originalEvent: evt})
                            break

                        case kCCTouchEnded:
                            console.log('touch end')
                            if (handler.delegate.touchEnded) handler.delegate.touchEnded({touch: touch, originalEvent: evt})
                            delete handler.claimedTouches[touch.identifier]
                            break

                        case kCCTouchCancelled:
                            if (handler.delegate.touchCancelled) handler.delegate.touchCancelled({touch: touch, originalEvent: evt})
                            delete handler.claimedTouches[touch.identifier]
                            break
                        }
                    }

                    if (claimed && handler.swallowsTouches) {
                        if (needsMutableSet) {
                            idx = mutableTouches.indexOf(touch)
                            mutableTouches.splice(idx, 1)
                            // Removed item, so knock loop back one
                            i--
                        }
                        break
                    }
                }
            }
        }

        // Standard touch handling
        if (this.standardHandlers.length > 0 && mutableTouches.length > 0) {
            for (j = 0; j < this.standardHandlers.length; j++) {
                handler = this.standardHandlers[j]
                switch (touchType) {
                case kCCTouchBegan:
                    if (handler.delegate.touchesBegan)
                        handler.delegate.touchesBegan({touches: mutableTouches, originalEvent: evt})
                    break

                case kCCTouchMoved:
                    if (handler.delegate.touchesMoved)
                        handler.delegate.touchesMoved({touches: mutableTouches, originalEvent: evt})
                    break

                case kCCTouchEnded:
                    if (handler.delegate.touchesEnded)
                        handler.delegate.touchesEnded({touches: mutableTouches, originalEvent: evt})
                    break

                case kCCTouchCancelled:
                    if (handler.delegate.touchesCancelled)
                        handler.delegate.touchesCancelled({touches: mutableTouches, originalEvent: evt})
                    break
                }
            }
        }

        this._locked = false
        if (this._toRemove)  {
            this._toRemove = false
            for (i = 0; i < this._handlersToRemove.length; i++) {
                this.forceRemoveDelegate(this._handlersToRemove[i])
            }
            // Clear the array in place
            this._handlersToRemove.splice(0, this._handlersToRemove.length)
        }

        if (this._toAdd) {
            this._toAdd = false
            for (i = 0; i < this._handlersToAdd.length; i++) {
                handler = this._handlersToAdd[i]
                if (handler instanceof TargetedTouchHandler) {
                    this.forceAddHandler(handler, this.targetedHandlers)
                } else {
                    this.forceAddHandler(handler, this.standardHandlers)
                }
            }
            // Clear the array in place
            this._handlersToAdd.splice(0, this._handlersToAdd.length)
        }

        if (this._toQuit) {
            this._toQuit = false
            this.forceRemoveAllDelegates()
        }
    }

  , touchesBegan: function (evt) {
        if (this.dispatchEvents)
            this.ontouches(evt, kCCTouchBegan)
    }

  , touchesMoved: function (evt) {
        if (this.dispatchEvents)
            this.ontouches(evt, kCCTouchMoved)
    }

  , touchesEnded: function (evt) {
        if (this.dispatchEvents)
            this.ontouches(evt, kCCTouchEnded)
    }

  , touchesCancelled: function (evt) {
        if (this.dispatchEvents)
            this.ontouches(evt, kCCTouchCancelled)
    }

})

Object.defineProperty(TouchDispatcher, 'sharedDispatcher', {
    /**
     * A shared singleton instance of cocos.TouchDispatcher
     *
     * @memberOf cocos.TouchDispatcher
     * @getter {cocos.TouchDispatcher} sharedDispatcher
     */
    get: function () {
        if (!TouchDispatcher._instance) {
            TouchDispatcher._instance = new this()
        }

        return TouchDispatcher._instance
    }

  , enumerable: true
})

exports.TouchDispatcher = TouchDispatcher
exports.TouchHandler = TouchHandler

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
