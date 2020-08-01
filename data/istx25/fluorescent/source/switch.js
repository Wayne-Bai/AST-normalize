//
//  switch.js
//  Fluorescent
//
//  Created by Douglas Bumby on 2014-07-18.
//  Copyright (c) 2014 Apollo Computational Research Group. All rights reserved.
//

var Gpio = require('onoff').Gpio,
    button = new Gpio(14, 'in', 'both'),
    led = new Gpio(23, 'out'),
    state = 0;

function setlight(value) {
    console.log('The button was pressed, its value was: ' + value);
    led.writeSync(value);
    button.watch(function (err, value) {
	    if (err) throw err;
	    if (state)
		state = 0;
	    else
		state = 1;
	    setlight(state);
	});
}

setlight(0);

//setTimeout(function() {
//    led.writeSync(0);
//    led.unexport();
//    button.unexport();
//}, 10000);
