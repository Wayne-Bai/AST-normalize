var Valve = require('swiz').Valve;
var logmagic = require('logmagic');

/**
 * Verifies the object given. I thought about having it detect things
 * but that just seemed to be too leaky.
 *
 * Serializes the object pointed to by data, into XML or JSON,
 * depending on the request headers.  Using the object_name we look
 * up a consistent mapping of the Object -> XML/JSON layout.
 *
 * @param {Object} log Log method.
 * @param {Valve} validity Valve validity object.
 * @param {http.ServerRequest} req http request.
 * @param {http.ServerResponse} res http response.
 * @param {String} type The type of the object.
 * @param {boolean} full If true, perform full validation; otherwise, perform
 *  partial validation.
 * @param {?Function} finalValidator Optional finalValidator which can perform
 * validator on the whole cleaned object.
 * @param {Function(err, cleaned)} callback A function to be called when the
 *  verification is complete.  Sets err to a non-null error message string if
 *  an error has occurred.  Sets cleaned to the cleaned version of the body, if
 *  applicable.
 */
function check(log, validity, req, res, type, full, finalValidator, callback) {
  var validator, v;

  log.info.call(log, 'deserializing and validating request body', {
    serializerType: type,
    full: full,
    finalValidator: finalValidator ? true : false
  });

  if (!req.body) {
    callback(new Error('Empty Request Body'));
    return;
  }

  if (!validity.hasOwnProperty(type)) {
    throw new Error('Unrecognized type: ' + type);
  }

  v = new Valve(validity[type]);

  if (req.ctx) {
    req.ctx.setValve(v);
  }

  if (finalValidator) {
    v.addFinalValidator(finalValidator);
  }

  v.baton = {req: req};
  validator = full ? v.check : v.checkPartial;

  validator.call(v, req.body, function(err, cleaned) {
    if (err) {
      log.debug.call(log, 'validation_check (error)', {request: req, body: req.body});
      callback(err);
      return;
    }

    log.debug.call(log, 'validation_check (success)', {request: req, cleaned: cleaned});
    callback(null, cleaned);
  });
}

function checkAndOnSuccess(log, validity, req, res, isPartial, errHandler) {
  return function(type, finalValidator, callback) {
    if (arguments.length === 2) {
      // TODO: Remove and update the code when the tests are finished.
      callback = finalValidator;
      finalValidator = null;
    }

    check(log, validity, req, res, type, isPartial, finalValidator, function(err, cleaned) {
      if (err) {
        errHandler(err);
        return;
      }

      callback(cleaned);
    });
  };
}

/**
 * Create a validator on the application request object.
 *
 * @param {Valve} validity Valve object.
 * @param {Function} errHandler A function which is called with (req, res) and
 * must return a function which gets called with (err) if the request body
 * validation fails.
 * @param {Object} options with the following keys: loggerName.
 * @return {Function} The middleware.
 */
exports.attach = function attachValidatorMiddleware(validity, errHandler, options) {
  var loggerName = options.loggerName || 'validator',
      log = logmagic.local(loggerName);

  return function addValidator(req, res, next) {
    var errHandlerFunc;

    req.check = function(type, callback) {
      check(log, validity, req, res, type, true, callback);
    };

    req.checkPartial = function(type, callback) {
      check(log, validity, req, res, type, false, callback);
    };

    errHandlerFunc = errHandler(req, res);
    req.checkAndOnSuccess = checkAndOnSuccess(log, validity, req, res, true, errHandlerFunc);
    req.checkAndOnPartialSuccess = checkAndOnSuccess(log, validity, req, res, false, errHandlerFunc);

    next();
  };
};
