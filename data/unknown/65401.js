! ✖ / env;
node;
const;
path = require("path"), assert = require("../lib/asserts.js"), utils = require("../lib/utils.js"), persona_urls = require("../lib/urls.js"), CSS = require("../pages/css.js"), dialog = require("../pages/dialog.js"), runner = require("../lib/runner.js"), testSetup = require("../lib/test-setup.js");
var browser, secondBrowser, testUser;
runner.run(module,  {
      setup tests:function(done)  {
         testSetup.setup( {
               browsers:2, 
               personatestusers:1            }, 
            function(err, fixtures)  {
               if (fixtures)  {
                  browser = fixtures.browsers[0];
                  secondBrowser = fixtures.browsers[1];
                  testUser = fixtures.personatestusers[0];
               }
               done(err);
            }
         );
      }, 
      create a new selenium session:function(done)  {
         testSetup.newBrowserSession(browser, done);
      }, 
      go to 123done and click sign in:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["123done"]).wclick(CSS["123done.org"].signinButton, done);
      }, 
      switch to the dialog when it opens:function(done)  {
         browser.wwin(CSS["persona.org"].windowName, done);
      }, 
      sign in using our personatestuser:function(done)  {
         dialog.signInExistingUser( {
               browser:browser, 
               email:testUser.email, 
               password:testUser.pass            }, 
            done);
      }, 
      verify we're logged in as the expected user:function(done)  {
         browser.chain( {
               onError:done            }
         ).wwin().wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, testUser.email));
            }
         );
      }, 
      setup second browser:function(done)  {
         testSetup.newBrowserSession(secondBrowser, done);
      }, 
      in the second browser, open the dialog to sign in:function(done)  {
         secondBrowser.chain( {
               onError:done            }
         ).get(persona_urls["persona"]).wclick(CSS["persona.org"].header.signIn).wwin(CSS["dialog"].windowName, done);
      }, 
      in the second browser, log in to persona.org:function(done)  {
         dialog.signInExistingUser( {
               browser:secondBrowser, 
               email:testUser.email, 
               password:testUser.pass            }, 
            done);
      }, 
      click the change password button:function(done)  {
         secondBrowser.chain( {
               onError:done            }
         ).wwin().wclick(CSS["persona.org"].changePasswordButton, done);
      }, 
      enter old and new passwords and click done:function(done)  {
         secondBrowser.chain( {
               onError:done            }
         ).wtype(CSS["persona.org"].oldPassword, testUser.pass).wtype(CSS["persona.org"].newPassword, "new" + testUser.pass).wclick(CSS["persona.org"].passwordChangeDoneButton).wfind(CSS["persona.org"].changePasswordButton).quit(done);
      }, 
      back to the first browser: should be signed out of 123done on reload:function(done)  {
         browser.chain( {
               onError:done            }
         ).refresh().wfind(CSS["123done.org"].signinButton).wclick(CSS["123done.org"].signinButton, done);
      }, 
      switch back to the dialog:function(done)  {
         browser.wwin(CSS["persona.org"].windowName, done);
      }, 
      sign in using the changed password:function(done)  {
         dialog.signInExistingUser( {
               browser:browser, 
               email:testUser.email, 
               password:"new" + testUser.pass            }, 
            done);
      }, 
      finally, verify signed in to 123done:function(done)  {
         browser.chain( {
               onError:done            }
         ).wwin().wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, testUser.email));
            }
         );
      }, 
      shut down:function(done)  {
         browser.quit(done);
      }} );
 {
   suiteName:
path.basename(__filename), cleanup;
   function ✖(done)  {
      testSetup.teardown(done);
   }
;
}
;
;
