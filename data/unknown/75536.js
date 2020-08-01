! ✖ / env;
node;
var common = require("../test/common.js"), farmConf = require("../farmingConf.json");
function run(callback)  {
   common.getSeleniumBrowser(function(browser)  {
         browser.get(farmConf.serverUrl);
         browser.byLinkText("Login").click();
         browser.byCss("#Email").sendKeys(farmConf.email);
         browser.byCss("#Passwd").sendKeys(farmConf.password);
         browser.byCss("#signIn").click();
         browser.getCurrentUrl().then(function(url)  {
               if (url.indexOf("AccountRecovery") != - 1)  {
                  browser.byCss("#cancel").click();
               }
            }
         );
         browser.getCurrentUrl().then(function(url)  {
               if (url.indexOf("oauth2") != - 1)  {
                  browser.byCss("#submit_approve_access").click();
               }
            }
         );
         browser.getCurrentUrl().then(function(url)  {
               if (url.indexOf(farmConf.serverUrl) == - 1)  {
                  throw new Error("Unhandled sign-in interstitial!");
               }
            }
         );
         browser.waitTime(2000);
         browser.getCurrentUrl().then(function(url)  {
               if (url.indexOf("oauth2") != - 1)  {
                  browser.byCss("#submit_approve_access").click();
                  browser.get(farmConf.serverUrl + "/hangout-farming");
               }
            }
         );
         browser.get(farmConf.serverUrl + "/hangout-farming");
         browser.executeScript("return document.body.innerHTML;").then(function(text)  {
               var match = /urls available: (\d+)/.exec(text);
               if (! match)  {
                  throw new Error("Can't find current URL count.");
               }
               var count = parseInt(match[1]);
               for (var i = count; i < farmConf.count; i++)  {
                     browser.byLinkText("CLICK ME").click();
                     browser.waitTime(5000);
                  }
               ;
               browser.then(function()  {
                     browser.quit().then(callback);
                  }
               );
            }
         );
      }
   );
}
;
if (require.main === module)  {
   run(function()  {
         process.exit(0);
      }
   );
}
