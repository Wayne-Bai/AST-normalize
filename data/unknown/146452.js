! ✖ / env;
node;
var path = require("path");
var swaggerServer = require("../../../swagger-server");
var mockUserData = require("./mock-user-data");
var authenticationMiddleware = require("./authentication");
var authorizationMiddleware = require("./authorization");
var server = swaggerServer(path.join(__dirname, "users.yaml"));
for (var i = 0; i < mockUserData.length; i++)  {
      var user = mockUserData[i];
      server.mockDataStore.createResource("/users/" + user.username, user);
   }
authenticationMiddleware(server);
authorizationMiddleware(server);
server.post("/users", function(req, res, next)  {
      var newUsername = req.swagger.params.body.username.toLowerCase();
      var existingUsers = server.mockDataStore.fetchCollection("/users");
      for (var i = 0; i < existingUsers.length; i++)  {
            var user = existingUsers[i];
            if (user.username.toLowerCase() === newUsername)  {
               return res.status(409).send("That username is already taken");
            }
         }
      next();
   }
);
server.post("/users/{username}", function(req, res, next)  {
      var existingUsername = req.swagger.params.username;
      var newUser = req.swagger.params.body;
      newUser.username = existingUsername;
      next();
   }
);
server.start();
