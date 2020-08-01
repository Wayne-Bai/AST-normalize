! ✖ / env;
node;
var path = require("path");
var swaggerSuite = require("../../../swagger-suite");
var server = swaggerSuite(path.join(__dirname, "petstore.yaml"));
server.post("/pets", function(req, res, next)  {
      var newPetName = req.swagger.params.body.name;
      var existingPets = server.mockDataStore.fetchCollection("/pets");
      for (var i = 0; i < existingPets.length; i++)  {
            var pet = existingPets[i];
            if (newPetName.toLowerCase() === pet.name.toLowerCase())  {
               var err = new Error("A pet with that name already exists");
               err.status = 409;
               throw err;
            }
         }
      next();
   }
);
server.use(function(err, req, res, next)  {
      var errorModel =  {
         code:err.status || 500, 
         message:err.message || "Unknown Error"      }
;
      res.status(errorModel.code).json(errorModel);
   }
);
server.start();
