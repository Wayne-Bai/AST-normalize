var companyRoutes = require('../../server/company/company_routes.js');
var express = require('express');

var router = express.Router();
companyRoutes(router); // extends 'router' with companyRoutes module

// fill int desired paths and verbs (use lower case for verbs)
var expectedAPI = {
  '/':      ['get', 'post'],
  '/:id':   ['get', 'put']
};

describe('Company Routes', function () {

  for (var path in expectedAPI) {
    (function (path) {
      describe('Path: ' + path, function () {
        it('should have specified path of ' + path, function () {
          var exists = false;
          for (var i = 0; i < router.stack.length; i += 1) {
            if (router.stack[i].route.path === path) {
              exists = true;
              break;
            }
          }
          expect(exists).toEqual(true);
        });

        for (var i = 0; i < expectedAPI[path].length; i += 1) {
          var verb = expectedAPI[path][i];
          var index;
          (function (verb) {
            describe(verb.toUpperCase() + ' at ' + path, function () {

              it('should handle a ' + verb.toUpperCase() + ' request at ' + path,
                function () {
                  for (var i = 0; i < router.stack.length; i += 1) {
                    if (router.stack[i].route.path === path) {
                      expect(router.stack[i].route.methods[verb]).toEqual(true);
                      index = i;
                      break;
                    }
                  }
                });

              it('should invoke handler when route reached', function () {
                var subIndex;
                for (var i = 0; i < router.stack[index].route.stack.length; i += 1) {
                  if (router.stack[index].route.stack[i].method === verb) {
                    subIndex = i;
                    break;
                  }
                }
                spyOn(router.stack[index].route.stack[subIndex], 'handle');
                router({method: verb, url: path});
                expect(router.stack[index].route.stack[subIndex].handle).toHaveBeenCalled();
              });
            });
          })(verb);
        }
      });
    })(path);
  }

});
