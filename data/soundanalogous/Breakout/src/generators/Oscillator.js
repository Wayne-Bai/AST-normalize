/**
 * Based on Osc.as originally written in as3.
 * Copyright (c) the Funnel development team
 * http://www.funnel.cc
 *
 * Ported to JavaScript by Jeff Hoefs
 * Copyright (c) 2011-2012 Jeff Hoefs <soundanalogous@gmail.com>
 *
 * Released under the MIT license. See LICENSE file for details.
 */

JSUTILS.namespace('BO.generators.Oscillator');

BO.generators.Oscillator = (function () {
    "use strict";

    var Oscillator;

    // dependencies
    var GeneratorBase = BO.generators.GeneratorBase,
        GeneratorEvent = BO.generators.GeneratorEvent,
        Timer = JSUTILS.Timer,
        TimerEvent = JSUTILS.TimerEvent;

    /**
     * The Oscillator object can be attached to a Pin or LED object to output
     * a waveform. This is useful for blinking an LED or fading it on and off. In
     * most cases (unless you are simply using it to blink and LED on or off), 
     * the Oscillator should be attached to a Pin or LED object associated with
     * a PWM pin on the I/O board.
     * See [Breakout/examples/generators/oscillator.html](https://github.com/soundanalogous/Breakout/blob/master/examples/generators/oscillator.html) for an example application.
     *
     * @class Oscillator
     * @constructor
     * @extends BO.generators.GeneratorBase
     * @param {Number} wave waveform
     * @param {Number} freq frequency
     * @param {Number} amplitude amplitude
     * @param {Number} offset offset
     * @param {Number} phase phase
     * @param {Number} times The repeat count from 0 to infinite.
     */
    Oscillator = function (wave, freq, amplitude, offset, phase, times) {

        // call super class
        GeneratorBase.call(this);

        this.name = "Oscillator";

        this._wave = wave || Oscillator.SIN;
        this._freq = freq || 1;
        this._amplitude = amplitude || 1;
        this._offset = offset || 0;
        this._phase = phase || 0;
        this._times = times || 0;

        if (freq === 0) {
            throw new Error("Frequency should be larger than 0");
        }

        this._time = undefined;
        this._startTime = undefined;
        this._lastVal = undefined;
        // need to do this in order to remove the event listener
        this._autoUpdateCallback = this.autoUpdate.bind(this);

        this._timer = new Timer(33);
        this._timer.start();

        this.reset();
    };

    Oscillator.prototype = JSUTILS.inherit(GeneratorBase.prototype);
    Oscillator.prototype.constructor = Oscillator;

    /**
     * The service interval in milliseconds. Default is 33ms.
     * @property serviceInterval
     * @type Number
     */
    Object.defineProperty(Oscillator.prototype, "serviceInterval", {
        get: function () {
            return this._timer.delay;
        },
        set: function (interval) {
            this._timer.delay = interval;
        }
    });

    /**
     * Starts the oscillator.
     * @method start
     */
    Oscillator.prototype.start = function () {
        this.stop();
        this._timer.addEventListener(TimerEvent.TIMER, this._autoUpdateCallback);

        var date = new Date();
        this._startTime = date.getTime();
        this.autoUpdate(null);
    };

    /**
     * Stops the oscillator.
     * @method stop
     */
    Oscillator.prototype.stop = function () {
        if (this._timer.hasEventListener(TimerEvent.TIMER)) {
            this._timer.removeEventListener(TimerEvent.TIMER, this._autoUpdateCallback);
        }
    };

    /**
     * Resets the oscillator.
     * @method reset
     */
    Oscillator.prototype.reset = function () {
        this._time = 0;
        this._lastVal = 0.999;
    };

    /**
     * By default the interval is 33 milliseconds. The Osc is updated every 33ms.
     * @method update
     * @param {Number} interval The update interval in milliseconds.
     */
    Oscillator.prototype.update = function (interval) {
        interval = interval || -1;
        if (interval < 0) {
            this._time += this._timer.delay;
        }
        else {
            this._time += interval;
        }
        this.computeValue();
    };

    /**
     * @private
     * @method autoUpdate
     */
    Oscillator.prototype.autoUpdate = function (event) {
        var date = new Date();
        this._time = date.getTime() - this._startTime;
        this.computeValue();
    };

    /**
     * @private
     * @method computeValue
     */
    Oscillator.prototype.computeValue = function () {
        var sec = this._time / 1000;

        if (this._times !== 0 && this._freq * sec >= this._times) {
            this.stop();
            sec = this._times / this._freq;
            if (this._wave !== Oscillator.LINEAR) {
                this._value = this._offset;
            } else {
                this._value = this._amplitude * this._wave(1, 0) + this._offset;
            }
        } else {
            var val = this._freq * (sec + this._phase);
            this._value = this._amplitude * this._wave(val, this._lastVal) + this._offset;
            this._lastVal = val;
        }
        this.dispatchEvent(new GeneratorEvent(GeneratorEvent.UPDATE));
    };

    // Static methods

    /**
     * sine wave
     * @method Oscillator.SIN
     * @static
     */
    Oscillator.SIN = function (val, lastVal) {
        return 0.5 * (1 + Math.sin(2 * Math.PI * (val - 0.25)));
    };

    /**
     * square wave
     * @method Oscillator.SQUARE
     * @static
     */
    Oscillator.SQUARE = function (val, lastVal) {
        return (val % 1 <= 0.5) ? 1 : 0;
    };
    
    /**
     * triangle wave
     * @method Oscillator.TRIANGLE
     * @static
     */
    Oscillator.TRIANGLE = function (val, lastVal) {
        val %= 1;
        return (val <= 0.5) ? (2 * val) : (2 - 2 * val);
    };
    
    /**
     * saw wave
     * @method Oscillator.SAW
     * @static
     */
    Oscillator.SAW = function (val, lastVal) {
        val %= 1;
        if (val <= 0.5) {
            return val + 0.5;
        }
        else {
            return val - 0.5;
        }
    };
    
    /**
     * impulse
     * @method Oscillator.IMPULSE
     * @static
     */
    Oscillator.IMPULSE = function (val, lastVal) {
        return ((val % 1) < (lastVal % 1)) ? 1 : 0;
    };
    
    /**
     * linear
     * @method Oscillator.LINEAR
     * @static
     */
    Oscillator.LINEAR = function (val, lastVal) {
        return (val < 1) ? val : 1;
    };
    
    // document events

    /**
     * The update event is dispatched at the rate specified 
     * by the serviceInterval parameter (default = 33ms).
     * @type BO.generators.GeneratorEvent.UPDATE
     * @event update
     * @param {BO.generators.Oscillator} target A reference to the Oscillator object.
     */

    return Oscillator;

}());
