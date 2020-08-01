! ✖ / env;
node;
const;
path = require("path"), assert = require("../lib/asserts.js"), restmail = require("../lib/restmail.js"), utils = require("../lib/utils.js"), persona_urls = require("../lib/urls.js"), CSS = require("../pages/css.js"), dialog = require("../pages/dialog.js"), runner = require("../lib/runner.js"), testSetup = require("../lib/test-setup.js"), user = require("../lib/user.js"), timeouts = require("../lib/timeouts.js");
var browser, testIdp, firstPrimaryEmail, secondPrimaryEmail, secondaryEmail, secondaryPassword, emails = [];
function getEmailIndex(email)  {
   emails = emails.sort(function(a, b)  {
         return a === b ? 0 : a > b ? 1 : - 1;
      }
   );
   var index = emails.indexOf(email);
   return index;
}
;
function saveEmail(email)  {
   emails.push(email);
   return email;
}
;
function removeEmail(email, done)  {
   browser.chain( {
         onError:done      }
   ).get(persona_urls["persona"]).wclick(CSS["persona.org"].emailListEditButton).elementsByCssSelector(CSS["persona.org"].removeEmailButton, function(err, elements)  {
         var index = getEmailIndex(email);
         var button = elements[index];
         browser.chain( {
               onError:done            }
         ).clickElement(button).delay(500).acceptAlert(function()  {
               emails.splice(index, 1);
               if (emails.length)  {
                  browser.wclick(CSS["persona.org"].emailListDoneButton, done);
               }
                else  {
                  browser.wfind(CSS["persona.org"].header.signIn, done);
               }
            }
         );
      }
   );
}
;
runner.run(module,  {
      setup all the things:function(done)  {
         testSetup.setup( {
               b:2, 
               r:1, 
               testidps:1            }, 
            function(err, fix)  {
               if (fix)  {
                  browser = fix.b[0];
                  testIdp = fix.testidps[0];
                  firstPrimaryEmail = saveEmail(testIdp.getRandomEmail());
                  secondPrimaryEmail = saveEmail(testIdp.getRandomEmail());
                  secondaryEmail = saveEmail(fix.r[0]);
                  secondaryPassword = secondaryEmail.split("@")[0];
               }
               done(err);
            }
         );
      }, 
      enable primary support:function(done)  {
         testIdp.enableSupport(done);
      }, 
      init browser session:function(done)  {
         testSetup.newBrowserSession(browser, done);
      }, 
      go to 123done and create a primary account:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["123done"]).wclick(CSS["123done.org"].signInButton).wwin(CSS["dialog"].windowName).wtype(CSS["dialog"].emailInput, firstPrimaryEmail).wclick(CSS["dialog"].newEmailNextButton).wclick(CSS["testidp.org"].loginButton).wwin().wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, firstPrimaryEmail));
            }
         );
      }, 
      add another primary to account:function(done)  {
         browser.chain( {
               onError:done            }
         ).wclick(CSS["123done.org"].logoutLink).wclick(CSS["123done.org"].signInButton).wwin(CSS["dialog"].windowName).wclick(CSS["dialog"].useNewEmail).wtype(CSS["dialog"].newEmail, secondPrimaryEmail).wclick(CSS["dialog"].addNewEmailButton).wclick(CSS["testidp.org"].loginButton).wwin().wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, secondPrimaryEmail));
            }
         );
      }, 
      add secondary to account:function(done)  {
         browser.chain( {
               onError:done            }
         ).wclick(CSS["123done.org"].logoutLink).wclick(CSS["123done.org"].signInButton).wwin(CSS["dialog"].windowName).wclick(CSS["dialog"].useNewEmail).wtype(CSS["dialog"].newEmail, secondaryEmail).wclick(CSS["dialog"].addNewEmailButton).wtype(CSS["dialog"].choosePassword, secondaryPassword).wtype(CSS["dialog"].verifyPassword, secondaryPassword).wclick(CSS["dialog"].createUserButton, done);
      }, 
      get verification link:function(done)  {
         restmail.getVerificationLink( {
               email:secondaryEmail            }, 
            done);
      }, 
      follow link, wait for redirect, secondary should be displayed:function(done, token, link)  {
         browser.chain( {
               onError:done            }
         ).wwin().get(link).wtype(CSS["persona.org"].signInForm.password, secondaryPassword).wclick(CSS["persona.org"].signInForm.finishButton, secondaryPassword).wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, secondaryEmail));
            }
         );
      }, 
      log in to 123done using secondPrimaryEmail:function(done)  {
         browser.chain( {
               onError:done            }
         ).wclick(CSS["123done.org"].logoutLink).wclick(CSS["123done.org"].signInButton).wwin(CSS["dialog"].windowName).wclick(CSS["dialog"].emailPrefix + getEmailIndex(secondPrimaryEmail)).wclick(CSS["dialog"].signInButton).wclick(CSS["testidp.org"].loginButton).wclickIfExists(CSS["dialog"].notMyComputerButton).wwin().wtext(CSS["123done.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, secondPrimaryEmail));
            }
         );
      }, 
      log in to myfavoritebeer using secondaryEmail:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["myfavoritebeer"]).wclick(CSS["myfavoritebeer.org"].signInButton).wwin(CSS["dialog"].windowName).wclick(CSS["dialog"].emailPrefix + getEmailIndex(secondaryEmail)).wclick(CSS["dialog"].signInButton).wclickIfExists(CSS["dialog"].notMyComputerButton).wwin().wtext(CSS["myfavoritebeer.org"].currentlyLoggedInEmail, function(err, text)  {
               done(err || assert.equal(text, secondaryEmail));
            }
         );
      }, 
      go to main site, remove secondPrimaryEmail:function(done)  {
         removeEmail(secondPrimaryEmail, done);
      }, 
      go to 123done, user should no longer be logged in:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["123done"]).wfind(CSS["123done.org"].signInButton, done);
      }, 
      go to main site, remove secondaryEmail:function(done)  {
         removeEmail(secondaryEmail, done);
      }, 
      go to myfavoritebeer, make sure user is still signed in - mfb still uses old API:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["myfavoritebeer"]).wfind(CSS["myfavoritebeer.org"].logoutLink, done);
      }, 
      go to main site, remove firstPrimaryEmail:function(done)  {
         removeEmail(firstPrimaryEmail, done);
      }, 
      user should now be signed out - cannot sign in with deleted addresses:function(done)  {
         browser.chain( {
               onError:done            }
         ).get(persona_urls["persona"]).wclick(CSS["persona.org"].header.signIn).wwin(CSS["dialog"].windowName).wtype(CSS["dialog"].emailInput, secondaryEmail).wclick(CSS["dialog"].newEmailNextButton).wfind(CSS["dialog"].verifyPassword).wclick(CSS["dialog"].submitCancelButton).wclear(CSS["dialog"].emailInput).wtype(CSS["dialog"].emailInput, firstPrimaryEmail).wclick(CSS["dialog"].newEmailNextButton, done);
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
