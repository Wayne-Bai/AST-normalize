// Copyright 2011 the Sputnik authors.  All rights reserved.
/**
 * Let O be the result of calling ToObject passing the this value as the argument.
 *
 * @path ch15/15.2/15.2.4/15.2.4.4/S15.2.4.4_A14.js
 * @description Checking Object.prototype.valueOf invoked by the 'call' property.
 * @negative
 */

(1,Object.prototype.valueOf)();

