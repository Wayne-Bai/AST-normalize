module.exports = {

  friendlyName: 'Link app',


  description: 'Link the current directory to an app or machinepack in Treeline.',


  inputs: {

    identity: {
      description: 'The identity (i.e. slug) of the machinepack or app to link',
      example: 'my-cool-app'
    },

    treelineApiUrl: {
      description: 'The base URL for the Treeline API (useful if you\'re in a country that can\'t use SSL, etc.)',
      example: 'http://api.treeline.io'
    }

  },

  exits: {

    noApps: {
      description: 'No apps belong to the account associated with this computer.',
      example: {
        username: 'mikermcneil'
      }
    },

    forbidden: {
      description: 'Username/password combo invalid or not applicable for the selected app.'
    },

    success: {
      example: {
        identity: 'my-cool-app',
        displayName: 'My Cool App',
        type: 'app',
        owner: 'mikermcneil',
        id: 123
      }
    }

  },


  fn: function (inputs, exits){

    var _ = require('lodash');
    var Prompts = require('machinepack-prompts');
    var thisPack = require('../');
    var request = require("request");
    var Path = require('path');
    var Tar = require('tar.gz');

    var appToLink = {
      identity: inputs.identity
    };

    (function getAppToLink(_doneGettingApp){

      // If identity was supplied, we don't need to show a prompt, but we will eventually
      // need to fetch more information about the app.  For now, we proceed.
      if (appToLink.identity) {
        // Install template files if necessary
        if (process.env.TREELINE_APP_FROM_TEMPLATE) {
          return installTemplateAssets();
        }
        return _doneGettingApp.success();
      }

      (function getSecret_loginIfNecessary(_doneGettingSecret){
        // Look up the account secret
        thisPack.readKeychain().exec({
          error: function (err){ return _doneGettingSecret.error(err); },
          doesNotExist: function (){
            thisPack.login({
              treelineApiUrl: inputs.treelineApiUrl || process.env.TREELINE_API_URL
            })
            .exec({
              error: function (err) {
                return _doneGettingSecret.error(err);
              },
              forbidden: function (){
                return _doneGettingSecret.forbidden();
              },
              success: function (){
                thisPack.readKeychain().exec({
                  error: function (err){ return _doneGettingSecret.error(err); },
                  success: function (keychain){
                    return _doneGettingSecret.success(keychain);
                  }
                });
              }
            });
          },
          success: function (keychain) {
            return _doneGettingSecret.success(keychain);
          }
        });
      })({
        error: function (err){
          return _doneGettingApp.error(err);
        },
        forbidden: function (){
          _doneGettingApp.forbidden();
        },
        success: function (keychain) {

          if (process.env.TREELINE_APP_ID) {
            appToLink = {
              id: process.env.TREELINE_APP_ID,
              identity: process.env.TREELINE_APP_IDENTITY,
              displayName: process.env.TREELINE_APP_DISPLAY_NAME,
              fromTemplate: process.env.TREELINE_APP_FROM_TEMPLATE,
            };
            // Install template files if necessary
            if (process.env.TREELINE_APP_FROM_TEMPLATE) {
              return installTemplateAssets();
            }
            return _doneGettingApp.success();
          }

          // Fetch list of apps, then prompt user to choose one:
          thisPack.listApps({
            secret: keychain.secret,
            treelineApiUrl: inputs.treelineApiUrl || process.env.TREELINE_API_URL
          }).exec({
            error: function(err) {
              return _doneGettingApp.error(err);
            },
            forbidden: function (){
              return _doneGettingApp.forbidden();
            },
            success: function(apps) {
              if (apps.length < 1) {
                return _doneGettingApp.noApps({
                  username: keychain.username
                });
              }

              // Prompt the command-line user to make a choice from a list of options.
              Prompts.select({
                choices: _.reduce(apps, function(memo, app) {
                  memo.push({
                    name: app.displayName,
                    value: app.identity
                  });
                  return memo;
                }, []),
                message: 'Which app would you like to link with the current directory?'
              }).exec({
                // An unexpected error occurred.
                error: function(err) {
                  _doneGettingApp.error(err);
                },
                // OK.
                success: function(choice) {
                  appToLink.identity = choice;

                  var appDataFromServer = (_.find(apps, {
                    identity: appToLink.identity
                  }) || appToLink);
                  appToLink.displayName = appDataFromServer.displayName || appToLink.identity;
                  appToLink.id = appDataFromServer.id;

                  // If it's not a template app, don't worry about assets
                  if (!appDataFromServer.fromTemplate) {return _doneGettingApp.success();}

                  // If it's a template app and we have the env override, install the assets
                  if (process.env.TREELINE_INSTALL_TEMPLATE_ASSETS) {
                    return installTemplateAssets();
                  }

                  // Otherwise ask the user if they want to install the assets
                  Prompts.confirm({
                    message: 'Would you like to download assets for this app\'s template?  NOTE: This will overwrite existing assets and views folders.'
                  }).exec({
                    error: function(err) {
                      return _doneGettingApp.error(err);
                    },
                    no: function() {
                      return _doneGettingApp.success();
                    },
                    success: installTemplateAssets
                  });
                },
              });
            }
          });
        }
      });

      // Download and install template assets (currently hardcoded to admin panel)
      function installTemplateAssets() {
        request({
          url: "https://s3.amazonaws.com/treeline-templates-adminpanel/adminpanel.tgz",
          method: "GET",
          encoding: null
        })
        .pipe(require('fs').createWriteStream(Path.resolve(process.cwd(),"adminpanel.tgz")))
        .on("error", function() {
          return _doneGettingApp.error("Could not download template assets.");
        })
        .on("close", function() {
          new Tar().extract(Path.resolve(process.cwd(),"adminpanel.tgz"), process.cwd(), function(err) {
            if (err) {
              return _doneGettingApp.error("Could not extract template assets.");
            }
            try {
              require('fs').unlinkSync(Path.resolve(process.cwd(),"adminpanel.tgz"));
            } catch(e) {
              return _doneGettingApp.error("Could not remove template assets archive file.");
            }
            return _doneGettingApp.success();
          });
        });
      }

    })({
      error: function (err){
        return exits(err);
      },
      forbidden: function (){
        return exits.forbidden();
      },
      noApps: function (me){
        return exits.noApps(me);
      },
      success: function (){

        // Get more info about the app (i.e. the owner)
        // TODO
        var owner = '[APP_OWNER]'; // e.g. 'mikermcneil';

        var linkedProjectData = {
          id: appToLink.id,
          identity: appToLink.identity,
          displayName: appToLink.displayName, // TODO: look this up when identity is provided manually w/o listing apps
          type: 'app',
          owner: owner  // TODO: get this
        };

        thisPack.writeLinkfile(linkedProjectData).exec({
          error: function (err){
            return exits.error(err);
          },
          success: function (){
            return exits.success(linkedProjectData);
          }
        });

      }
    });


  }

};
