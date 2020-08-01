/**
 * Copyright (c) 2013-2014 Oculus Info Inc.
 * http://www.oculusinfo.com/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
aperture.log = (function(ns) {

    // Draper Activity Logger | Version 2.1.1

    // Workflow codes
    ns.draperWorkflow = {
        WF_OTHER       : 'WF_OTHER',
        WF_DEFINE      : 'WF_DEFINE',
        WF_GETDATA     : 'WF_GETDATA',
        WF_EXPLORE     : 'WF_EXPLORE',
        WF_CREATE      : 'WF_CREATE',
        WF_ENRICH      : 'WF_ENRICH',
        WF_TRANSFORM   : 'WF_TRANSFORM'
    };

    ns.draperType = {
        USER           : 'USERACTION',
        SYSTEM         : 'SYSACTION'
    };

	var DraperAppender = aperture.log.Appender.extend(
		{
			init: function(spec) {
				spec = spec || {};
				aperture.log.Appender.prototype.init.call(this, aperture.log.LEVEL.LOG);

				var logger = null;
				if (spec.address != null) {
					logger = new activityLogger(spec.webworker)
                        .echo(spec.echo)             // Echo logs to the console
                        .testing(spec.testing)       // Testing mode: don't send anything to spec.address
                        .registerActivityLogger(
                            spec.address,
                            'Influent',
                            '1.3.5'
                        );
				}
				this.draperLogger = logger;
			},

			logString : function(level, message) {
				if (this.draperLogger != null) {
					if (level === aperture.log.LEVEL.ERROR) {
						this.draperLogger.logSystemActivity('[' + level + '] ' + message);
					}
				}
			},

			logObjects : function(level, objectArray) {
				if (this.draperLogger != null) {
					if (level === aperture.log.LEVEL.LOG) {
						var logger = this.draperLogger;
						aperture.util.forEach(
							objectArray,
							function(object) {
                                    switch(object.type) {

                                        case ns.draperType.USER :
                                            logger.logUserActivity(
                                                object.description,
                                                object.activity,
												logger[object.workflow],
                                                object.data
                                            );
                                            break;
                                        case ns.draperType.SYSTEM :
                                            logger.logSystemActivity(
                                                object.description,
                                                object.data
                                            );
                                            break;
                                        default:
                                            break;
                                    }
							}
						);
					}
				}
			}
		}
	);

	/**
	 * @name aperture.log.addDraperAppender
	 * @function
	 * @description
	 * <p>Creates and adds a Draper appender object.
	 * The Draper Appender sends log messages to a provided end-point address
	 *
	 * @param {Object} spec specification object describing the properties of
	 * the Draper appender to build
	 *
	 * @returns {aperture.log.Appender} a new Draper appender object that has been added
	 * to the logging system
	 */
	ns.addDraperAppender = function(spec) {
		return ns.addAppender(new DraperAppender(spec));
	};

	return ns;

}(aperture.log || {}));
