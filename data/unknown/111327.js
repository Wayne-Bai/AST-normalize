! ✖ / env;
node;
const;
path = require("path"), assert = require("../lib/asserts.js"), restmail = require("../lib/restmail.js"), utils = require("../lib/utils.js"), persona_urls = require("../lib/urls.js"), CSS = require("../pages/css.js"), dialog = require("../pages/dialog.js"), testSetup = require("../lib/test-setup.js"), runner = require("../lib/runner.js");
var browser, secondary;
runner.run(module,  {
      pull in test environment:function(done)  {
         testSetup.setup( {
               browsers:1, 
               restmails:1            }, 
            function(err, fixtures)  {
               if (fixtures)  {
                  browser = fixtures.browsers[0];
                  secondary = fixtures.restmails[0];
               }
               done(err);
            }
         );
      }, 
      startup browser:function(done)  {
         testSetup.newBrowserSession(browser, done);
      }, 
      create new secondary via mfb:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["myfavoritebeer"]).wclick(CSS["myfavoritebeer.org"].signinButton).wwin(CSS["persona.org"].windowName, function(err)  {
               if (err) return done(err)               dialog.signInAsNewUser( {
                     browser:browser, 
                     email:secondary, 
                     password:secondary.split("@")[0]                  }, 
                  done);
            }
         );
      }, 
      do the restmail verification step:function(done)  {
         restmail.getVerificationLink( {
               email:secondary            }, 
            done);
      }, 
      open persona.org verification link and wait for congrats message:function(done, token, link)  {
         browser.chain( {
               onError:done            }
         ).wwin().get(link).wfind(CSS["persona.org"].accountManagerHeader, done);
      }, 
      hack localStorage to simulate 60 seconds of inactivity:function(done)  {
         var rewindOneMinute = "(function() { " + "var usersComputer = JSON.parse(localStorage.getItem("usersComputer")); " + "var userId = JSON.parse(localStorage.emailToUserID)["" + secondary + ""]; " + "var orig = updatedTime = new Date(usersComputer[userId].updated); " + "var hackedTime = updatedTime.setMinutes(updatedTime.getMinutes() - 1); " + "usersComputer[userId].updated = new Date(hackedTime).toString(); " + "var storable = JSON.stringify(usersComputer); " + "localStorage.setItem("usersComputer", storable); " + "})();";
         browser.chain( {
               onError:done            }
         ).wclick(CSS["persona.org"].header.signIn).wfind(CSS["persona.org"].accountManagerHeader).eval(rewindOneMinute, function(err)  {
               done(err);
            }
         );
      }, 
      go to 123done, click log in, click "thats my email" button:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["123done"]).wclick(CSS["123done.org"].signinButton).wwin(CSS["persona.org"].windowName).wclick(CSS["dialog"].signInButton, done);
      }, 
      click "this is my computer" and the session should last a long time:function(done)  {
         browser.wclick(CSS["dialog"].myComputerButton, done);
      }, 
      until we decide what to do, at least end the session properly:function(done)  {
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
