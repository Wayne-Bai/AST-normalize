! ✖ / env;
node;
const;
assert = require("assert"), restmail = require("../lib/restmail.js"), persona_urls = require("../lib/urls.js"), CSS = require("../pages/css.js"), dialog = require("../pages/dialog.js"), testSetup = require("../lib/test-setup.js");
exports.verifyEmail = function(email, password, index, browser, done)  {
   restmail.getVerificationLink( {
         email:email, 
         index:index      }, 
      function(err, token, link)  {
         testSetup.newBrowserSession(browser, function(err)  {
               if (err) return done(err)               browser.chain( {
                     onError:done                  }
               ).get(link).wtype(CSS["persona.org"].signInForm.password, password).wclick(CSS["persona.org"].signInForm.finishButton).wfind(CSS["persona.org"].accountManagerHeader).quit(function()  {
                     done();
                  }
               );
            }
         );
      }
   );
}
;
exports.getVerifiedUser = function(done)  {
   testSetup.setup( {
         b:1      }, 
      function(err, fixtures)  {
         var browser = fixtures.b[0];
         var email = restmail.randomEmail(10);
         var password = email.split("@")[0];
         testSetup.newBrowserSession(browser, function(err)  {
               if (err) return done(err)               browser.chain( {
                     onError:done                  }
               ).get(persona_urls["123done"]).wclick(CSS["123done.org"].signinButton).wwin(CSS["persona.org"].windowName, function()  {
                     dialog.signInAsNewUser( {
                           browser:browser, 
                           email:email, 
                           password:password                        }, 
                        function()  {
                           browser.quit();
                           exports.verifyEmail(email, email.split("@")[0], 0, browser, function()  {
                                 done(null,  {
                                       browser:browser, 
                                       email:email, 
                                       password:password                                    }
                                 );
                              }
                           );
                        }
                     );
                  }
               );
            }
         );
      }
   );
}
;
