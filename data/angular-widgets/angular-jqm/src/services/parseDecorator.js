jqmModule.config(['$provide', function ($provide) {
  $provide.decorator('$parse', ['$delegate', jqmScopeAsParseDecorator]);

  function jqmScopeAsParseDecorator($parse) {
    return function (expression) {
      if (!angular.isString(expression)) {
        // $parse is also used for calling functions (e.g. from $scope.eval),
        // which we don't want to intercept.
        return $parse(expression);
      }

      var evalFn = $parse(expression),
        assignFn = evalFn.assign;
      if (assignFn) {
        patchedEvalFn.assign = patchedAssign;
      }
      return patchedEvalFn;

      function patchedEvalFn(context, locals) {
        return callInContext(evalFn, context, locals);
      }

      function patchedAssign(context, value) {
        return callInContext(assignFn, context, value);
      }

      function callInContext(fn, context, secondArg) {
        var scopeAs = {},
          earlyExit = true;
        while (context && context.hasOwnProperty("$$scopeAs")) {
          scopeAs[context.$$scopeAs] = context;
          context = context.$parent;
          earlyExit = false;
        }
        if (earlyExit) {
          return fn(context, secondArg);
        }
        // Temporarily add a property in the parent scope
        // to reference the child scope.
        // Needed as the assign function does not allow locals, otherwise
        // we could use the locals here (which would be more efficient!).
        context.$scopeAs = scopeAs;
        try {
          /*jshint -W040:true*/
          return fn.call(this, context, secondArg);
        } finally {
          delete context.$scopeAs;
        }
      }
    };
  }
}]);
