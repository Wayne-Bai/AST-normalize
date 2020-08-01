// Copyright (c) 2011 Firebase.co and Contributors - http://www.firebase.co
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



var Expression = require("../Expressions").Expression

function HintExpression() {

}
HintExpression.prototype = new Expression()
HintExpression.prototype.execute = function() {
	var self = this
	var rootParent = this.getRootParent()
	if(!rootParent) {
		// Crap! They are trying to call @hint from a custom implementation... shouldn't they be using getRootParent().getHintValue() function function?
		throw "@hint can not be directly used by custom implementations. Only fire.js compiler is allowed to use it. You should be using the getRootParent().getHintValue() function instead."
	}
	//get the hint
	this.end(rootParent.getHintValue())
}

module.exports = {
	name:"hint",
	implementation:HintExpression
}