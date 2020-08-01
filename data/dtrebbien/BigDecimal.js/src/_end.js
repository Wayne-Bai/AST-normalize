return BigDecimal;
})(MathContext); // BigDecimal depends on MathContext

if (typeof define === "function" && define.amd != null) {
	// AMD-loader compatible resource declaration
	// require('bigdecimal') will return JS Object:
	// {'BigDecimal':BigDecimalPointer, 'MathContext':MathContextPointer}
	define({'BigDecimal':BigDecimal, 'MathContext':MathContext});
} else if (typeof this === "object"){
	// global-polluting outcome.
	this.BigDecimal = BigDecimal;
	this.MathContext = MathContext;
}

}).call(this); // in browser 'this' will be 'window' or simulated window object in AMD-loading scenarios.
