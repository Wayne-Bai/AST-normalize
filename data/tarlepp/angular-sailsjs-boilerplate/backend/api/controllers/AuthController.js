'use strict';

var async = require('async');
var _ = require('lodash');

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller should look. It currently
 * includes the minimum amount of functionality for the basics of Passport.js to work.
 */
var AuthController = {
  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on request (also aliased as logOut()) that can be
   * called from any route handler which needs to terminate a login session. Invoking logout()
   * will remove the request.user property and clear the login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  logout: function logout(request, response) {
    request.logout();

    response.json(200, true);
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  provider: function provider(request, response) {
    sails.services['passport'].endpoint(request, response);
  },

  /**
   * Simple action to check current auth status of user. Note that this will always send
   * HTTP status 200 and actual data will contain either user object or boolean false in
   * cases that user is not authenticated.
   *
   * @todo    Hmmm, I think that this will return always false, because of missing of
   *          actual sessions here...
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  authenticated: function authenticated(request, response) {
    if (request.isAuthenticated()) {
      response.json(200, request.user);
    } else {
      response.json(200, false);
    }
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Passports
   * and users, both locally and from third-party providers.
   *
   * Passport exposes a login() function on request (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation completes,
   * user will be assigned to request.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  callback: function callback(request, response) {
    sails.services['passport'].callback(request, response, function callback(error, user) {
      request.login(user, function callback(error) {
        // If an error was thrown, redirect the user to the login which should
        // take care of rendering the error messages.
        if (error) {
          sails.log.verbose('User authentication failed');
          sails.log.verbose(error);

          response.json(401, error);
        } else { // Upon successful login, send back user data and JWT token
          sails.services['logger'].login(user, request);

          response.json(200, {
            user: user,
            token: sails.services['token'].issue(_.isObject(user.id) ? JSON.stringify(user.id) : user.id)
          });
        }
      });
    });
  },

  /**
   * Action to check if given password is same as current user password. Note that
   * this action is only allowed authenticated users. And by default given password
   * is checked against to current user.
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  checkPassword: function checkPassword(request, response) {
    /**
     * Job to fetch current user local passport data. This is needed
     * to validate given password.
     *
     * @param {Function}  next  Callback function
     */
    var findPassport = function findPassport(next) {
      var where = {
        user: request.token,
        protocol: 'local'
      };

      sails.models['passport']
        .findOne(where)
        .exec(function callback(error, passport) {
          if (error) {
            next(error);
          } else if (!passport) {
            next({message: 'Given authorization token is not valid'});
          } else {
            next(null, passport);
          }
        })
      ;
    };

    /**
     * Job to validate given password against user passport object.
     *
     * @param {sails.model.passport}  passport  Passport object
     * @param {Function}              next      Callback function
     */
    var validatePassword = function validatePassword(passport, next) {
      var password = request.param('password');

      passport.validatePassword(password, function callback(error, matched) {
        if (error) {
          next({message: 'Invalid password'});
        } else {
          next(null, matched);
        }
      });
    };

    /**
     * Main callback function which is called when all specified jobs are
     * processed or an error has occurred while processing.
     *
     * @param   {null|Error}    error   Possible error
     * @param   {null|boolean}  result  If passport was valid or not
     */
    var callback = function callback(error, result) {
      if (error) {
        response.json(401, error);
      } else if (result) {
        response.json(200, result);
      } else {
        response.json(400, {message: 'Given password does not match.'});
      }
    };

    // Run necessary tasks and handle results
    async.waterfall([findPassport, validatePassword], callback);
  }
};

module.exports = AuthController;
