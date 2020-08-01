// Airy 1.0.1

// Copyright 2014 Miras Absar
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//--------------------------------------------------Beginning of Pointer----------------------------------------

// This Pointer's identifier.
// this.mIdentifier;

// The time (in milliseconds) when this Pointer went down.
// this.mDownTime;

// The x coordinate (in pixels) where this Pointer went down.
// this.mDownX;

// The y coordinate (in pixels) where this Pointer went down.
// this.mDownY;

// The time (in milliseconds) when this Pointer went up.
// this.mUpTime;

// The x coordinate (in pixels) where this Pointer went up.
// this.mUpX;

// The y coordinate (in pixels) where this Pointer went up.
// this.mUpY;

function Pointer(pIdentifier,
                 pDownTime,
                 pDownX, pDownY,
                 pMovementLimitPx) {

    this.mIdentifier = pIdentifier;
    this.mDownTime = pDownTime;
    this.mDownX = pDownX;
    this.mDownY = pDownY;

    this.mUpXUpperLimit = this.mDownX + pMovementLimitPx;
    this.mUpXLowerLimit = this.mDownX - pMovementLimitPx;
    this.mUpYUpperLimit = this.mDownY + pMovementLimitPx;
    this.mUpYLowerLimit = this.mDownY - pMovementLimitPx;
}

Pointer.prototype.setUpTime = function(pUpTime) {
    this.mUpTime = pUpTime;
};

Pointer.prototype.setUpX = function(pUpX) {
    this.mUpX = pUpX;
};

Pointer.prototype.setUpY = function(pUpY) {
    this.mUpY = pUpY;
};

Pointer.prototype.getIdentifier = function() {
    return this.mIdentifier;
};

Pointer.prototype.getDownX = function() {
    return this.mDownX;
};

Pointer.prototype.getDownY = function() {
    return this.mDownY;
};

Pointer.prototype.getUpX = function() {
    return this.mUpX;
};

Pointer.prototype.getUpY = function() {
    return this.mUpY;
};

Pointer.prototype.existedWithinTimeLimit = function(pTimeLimit) {
    return this.mUpTime - this.mDownTime <= pTimeLimit;
};

Pointer.prototype.tapped = function() {
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.swipedUp = function() {
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY <= this.mUpYLowerLimit;
};

Pointer.prototype.swipedDown = function() {
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY >= this.mUpYUpperLimit;
};

Pointer.prototype.swipedLeft = function() {
    return this.mUpX <= this.mUpXLowerLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.swipedRight = function() {
    return this.mUpX >= this.mUpXUpperLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.distanceFormula = function(pXI, pYI,
                                             pXII, pYII) {

    return Math.sqrt(Math.pow(pXI - pXII, 2) + Math.pow(pYI - pYII, 2));
};

Pointer.prototype.pinchedIn = function(pPointer, pMovementLimitPx) {
    return this.distanceFormula(this.mDownX, this.mDownY, pPointer.getDownX(), pPointer.getDownY()) + pMovementLimitPx <=
        this.distanceFormula(this.mUpX, this.mUpY, pPointer.getUpX(), pPointer.getUpY());
};

Pointer.prototype.pinchedOut = function(pPointer, pMovementLimitPx) {
    return this.distanceFormula(this.mDownX, this.mDownY, pPointer.getDownX(), pPointer.getDownY()) - pMovementLimitPx >=
        this.distanceFormula(this.mUpX, this.mUpY, pPointer.getUpX(), pPointer.getUpY());
};

//--------------------------------------------------End of Pointer----------------------------------------

//--------------------------------------------------Beginning of Airy----------------------------------------

// The amount of time (in milliseconds) a gesture has to be performed.
// Airy.prototype.TIME_LIMIT;

// The amount of distance (in density-independent pixels) a Pointer has to move to trigger a gesture.
// Airy.prototype.MOVEMENT_LIMIT_DP;

// Custom touch event types.
// Airy.prototype.PRIMARY_TOUCH_START;
// Airy.prototype.SECONDARY_TOUCH_START;
// Airy.prototype.SECONDARY_TOUCH_END;
// Airy.prototype.PRIMARY_TOUCH_END;

// The gesture id for an invalid gesture.
// Airy.prototype.INVALID_GESTURE;

// Gesture ids for one-finger gestures.
// Airy.prototype.TAP;
// Airy.prototype.SWIPE_UP;
// Airy.prototype.SWIPE_DOWN;
// Airy.prototype.SWIPE_LEFT;
// Airy.prototype.SWIPE_RIGHT;

// Gesture ids for two-finger gestures.
// Airy.prototype.TWO_FINGER_TAP;
// Airy.prototype.TWO_FINGER_SWIPE_UP;
// Airy.prototype.TWO_FINGER_SWIPE_DOWN;
// Airy.prototype.TWO_FINGER_SWIPE_LEFT;
// Airy.prototype.TWO_FINGER_SWIPE_RIGHT;
// Airy.prototype.TWO_FINGER_PINCH_IN;
// Airy.prototype.TWO_FINGER_PINCH_OUT;

// The amount of distance (in pixels) a Pointer has to move, to trigger a gesture.
// this.mMovementLimitPx;

// The function called on a gesture.
// this.mOnGesture;

// A list of Pointers involved in a gesture.
// this.mPointers;

function Airy(pOnGesture) {
    this.mMovementLimitPx = this.MOVEMENT_LIMIT_DP * window.devicePixelRatio;

    this.mOnGesture = pOnGesture;
}

Airy.prototype.TIME_LIMIT = 300;

Airy.prototype.MOVEMENT_LIMIT_DP = 48;

Airy.prototype.PRIMARY_TOUCH_START = 0;
Airy.prototype.SECONDARY_TOUCH_START = 1;
Airy.prototype.SECONDARY_TOUCH_END = 2;
Airy.prototype.PRIMARY_TOUCH_END = 3;

Airy.prototype.INVALID_GESTURE = -1;

Airy.prototype.TAP = 0;
Airy.prototype.SWIPE_UP = 1;
Airy.prototype.SWIPE_DOWN = 2;
Airy.prototype.SWIPE_LEFT = 3;
Airy.prototype.SWIPE_RIGHT = 4;

Airy.prototype.TWO_FINGER_TAP = 5;
Airy.prototype.TWO_FINGER_SWIPE_UP = 6;
Airy.prototype.TWO_FINGER_SWIPE_DOWN = 7;
Airy.prototype.TWO_FINGER_SWIPE_LEFT = 8;
Airy.prototype.TWO_FINGER_SWIPE_RIGHT = 9;
Airy.prototype.TWO_FINGER_PINCH_IN = 10;
Airy.prototype.TWO_FINGER_PINCH_OUT = 11;

Airy.prototype.getTouchEventType = function(pTouchEvent) {
    if (pTouchEvent.type == "touchstart" && pTouchEvent.touches.length == 1) {
        return Airy.prototype.PRIMARY_TOUCH_START;
    } else if (pTouchEvent.type == "touchstart" && pTouchEvent.touches.length >= 2) {
        return Airy.prototype.SECONDARY_TOUCH_START;
    } else if (pTouchEvent.type == "touchend" && pTouchEvent.touches.length >= 1) {
        return Airy.prototype.SECONDARY_TOUCH_END;
    } else if (pTouchEvent.type == "touchend" && pTouchEvent.touches.length === 0) {
        return Airy.prototype.PRIMARY_TOUCH_END;
    }
};

Airy.prototype.getGestureId = function() {
    var mTotalPointerCount = this.mPointers.length;

    if (mTotalPointerCount == 1) {
        var mPointer = this.mPointers[0];

        if (mPointer.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT)) {
            if (mPointer.tapped()) {
                return Airy.prototype.TAP;
            } else if (mPointer.swipedUp()) {
                return Airy.prototype.SWIPE_UP;
            } else if (mPointer.swipedDown()) {
                return Airy.prototype.SWIPE_DOWN;
            } else if (mPointer.swipedLeft()) {
                return Airy.prototype.SWIPE_LEFT;
            } else if (mPointer.swipedRight()) {
                return Airy.prototype.SWIPE_RIGHT;
            } else {
                return Airy.prototype.INVALID_GESTURE;
            }
        } else {
            return Airy.prototype.INVALID_GESTURE;
        }
    } else if (mTotalPointerCount == 2) {
        var mPointerI = this.mPointers[0];
        var mPointerII = this.mPointers[1];

        if (mPointerI.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT) &&
            mPointerII.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT)) {

            if (mPointerI.tapped() &&
                mPointerII.tapped()) {

                return Airy.prototype.TWO_FINGER_TAP;
            } else if (mPointerI.swipedUp() &&
                       mPointerII.swipedUp()) {

                return Airy.prototype.TWO_FINGER_SWIPE_UP;
            } else if (mPointerI.swipedDown() &&
                       mPointerII.swipedDown()) {

                return Airy.prototype.TWO_FINGER_SWIPE_DOWN;
            } else if (mPointerI.swipedLeft() &&
                       mPointerII.swipedLeft()) {

                return Airy.prototype.TWO_FINGER_SWIPE_LEFT;
            } else if (mPointerI.swipedRight() &&
                       mPointerII.swipedRight()) {

                return Airy.prototype.TWO_FINGER_SWIPE_RIGHT;
            } else if (mPointerI.pinchedIn(mPointerII, this.mMovementLimitPx)) {
                return Airy.prototype.TWO_FINGER_PINCH_IN;
            } else if (mPointerI.pinchedOut(mPointerII, this.mMovementLimitPx)) {
                return Airy.prototype.TWO_FINGER_PINCH_OUT;
            } else {
                return Airy.prototype.INVALID_GESTURE;
            }
        } else {
            return Airy.prototype.INVALID_GESTURE;
        }
    } else {
        return Airy.prototype.INVALID_GESTURE;
    }
};

Airy.prototype.onTouch = function(pTouchEvent) {
    var mTouch = pTouchEvent.changedTouches[0];

    var mIdentifier = mTouch.identifier;
    var mTime = new Date().getTime();
    var mScreenX = mTouch.screenX;
    var mScreenY = mTouch.screenY;

    switch (this.getTouchEventType(pTouchEvent)) {
        case Airy.prototype.PRIMARY_TOUCH_START:
            this.mPointers = [];

            this.mPointers.push(new Pointer(mIdentifier,
                                            mTime,
                                            mScreenX, mScreenY,
                                            this.mMovementLimitPx));
            break;
        case Airy.prototype.SECONDARY_TOUCH_START:
            this.mPointers.push(new Pointer(mIdentifier,
                                            mTime,
                                            mScreenX, mScreenY,
                                            this.mMovementLimitPx));
            break;
        case Airy.prototype.SECONDARY_TOUCH_END:
            for (var pIndexI = this.mPointers.length - 1; pIndexI >= 0; pIndexI--) {
                if (this.mPointers[pIndexI].getIdentifier() == mIdentifier) {
                    this.mPointers[pIndexI].setUpTime(mTime);
                    this.mPointers[pIndexI].setUpX(mScreenX);
                    this.mPointers[pIndexI].setUpY(mScreenY);
                }
            }
            break;
        case Airy.prototype.PRIMARY_TOUCH_END:
            for (var pIndexII = this.mPointers.length - 1; pIndexII >= 0; pIndexII--) {
                if (this.mPointers[pIndexII].getIdentifier() == mIdentifier) {
                    this.mPointers[pIndexII].setUpTime(mTime);
                    this.mPointers[pIndexII].setUpX(mScreenX);
                    this.mPointers[pIndexII].setUpY(mScreenY);
                }
            }

            this.mOnGesture(mTouch.target, this.getGestureId());
            break;
    }
};

Airy.prototype.attachTo = function(pElement) {
    var mSelf = this;

    pElement.addEventListener("touchstart", function(pTouchEvent) {mSelf.onTouch(pTouchEvent);}, false);
    pElement.addEventListener("touchend", function(pTouchEvent) {mSelf.onTouch(pTouchEvent);}, false);
};

//--------------------------------------------------End of Airy----------------------------------------