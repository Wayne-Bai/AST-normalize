! ✖ / env;
node;
process.HEADLESS = true;
if (! process.argv[3])  {
   console.log("Usage - token_set {account uuid} {token}");
   process.exit(0);
}
var accountId = process.argv[2], token = process.argv[3], bootstrap = require(__dirname + "/../src/bootstrap"), dao = bootstrap.app.dao, modelName = "account_auth";
if (token.length > 32)  {
   console.log("Token Must be 32 Bytes");
   process.exit(0);
}
dao.on("ready", function(dao)  {
      dao.find(modelName,  {
            owner_id:accountId, 
            type:"token"         }, 
         function(err, result)  {
            if (err || ! result)  {
               console.log(err);
               if (! result)  {
                  console.log("account id not found");
               }
               process.exit(0);
            }
             else  {
               result.password = token;
               dao.updateProperties(modelName, result.id,  {
                     password:token                  }, 
                  function(err, result)  {
                     if (err)  {
                        console.log(err);
                        console.log(result);
                     }
                      else  {
                        console.log("new token : " + token);
                        console.log("done");
                     }
                     process.exit(0);
                  }
               );
            }
         }
      );
   }
);
