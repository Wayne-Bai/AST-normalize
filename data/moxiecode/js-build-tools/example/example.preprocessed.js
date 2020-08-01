(function() {
	/**
	 * Here is some class.
	 *
	 * @class SomeClass
	 */
	window.SomeClass = function() {
		/**
		 * Some function.
		 *
		 * @method someFunc
		 * @param {String} arg1 First arg.
		 * @param {String} arg2 Second arg.
		 * @return {String} Some string.
		 */
		this.someFunc = function(arg1, arg2) {
			return "";
		};

		/**
		 * Some other function.
		 *
		 * @method someOtherFunc
		 * @param {String} arg1 First arg.
		 * @param {String} arg2 Second arg.
		 * @return {String} Some string.
		 */
		this.someOtherFunc = function(arg1, arg2) {
			return "";
		};
	};

	/**
	 * Here is some static class.
	 *
	 * @class SomeOtherClass
	 * @static
	 */
	window.SomeOtherClass = {
		/**
		 * Some function.
		 *
		 * @method someFunc
		 * @param {String} arg1 First arg.
		 * @param {String} arg2 Second arg.
		 * @return {String} Some string.
		 */
		someStaticFunc : function(arg1, arg2) {
			return "";
		}
	};

	var someLongVar;

	function someLongFunctionName() {
		someLongVar = 1;
	};

	someLongFunctionName();


		alert('Some logic 1.');



		alert('Some logic 3.1');




})();(function() {
	alert("This is just some other file.");
})();
