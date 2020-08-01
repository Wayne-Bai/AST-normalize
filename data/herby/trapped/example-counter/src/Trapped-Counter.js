define("trapped-counter/Trapped-Counter", ["amber/boot", "amber_core/Kernel-Objects", "trapped/Trapped-Backend"], function($boot){
var $core=$boot.api,nil=$boot.nil,$recv=$boot.asReceiver,$globals=$boot.globals;
$core.addPackage('Trapped-Counter');
$core.packages["Trapped-Counter"].innerEval = function (expr) { return eval(expr); };
$core.packages["Trapped-Counter"].transport = {"type":"amd","amdNamespace":"trapped-counter"};

$core.addClass('App', $globals.IsolatingTrapper, [], 'Trapped-Counter');
//>>excludeStart("ide", pragmas.excludeIdeData);
$globals.App.comment="// Code from AngularJS Todo example, http://angularjs.org/#todo-js\x0afunction TodoCtrl($scope) {\x0a  $scope.todos = [\x0a    {text:'learn angular', done:true},\x0a    {text:'build an angular app', done:false}];\x0a \x0a  $scope.addTodo = function() {\x0a    $scope.todos.push({text:$scope.todoText, done:false});\x0a    $scope.todoText = '';\x0a  };\x0a \x0a  $scope.remaining = function() {\x0a    var count = 0;\x0a    angular.forEach($scope.todos, function(todo) {\x0a      count += todo.done ? 0 : 1;\x0a    });\x0a    return count;\x0a  };\x0a \x0a  $scope.archive = function() {\x0a    var oldTodos = $scope.todos;\x0a    $scope.todos = [];\x0a    angular.forEach(oldTodos, function(todo) {\x0a      if (!todo.done) $scope.todos.push(todo);\x0a    });\x0a  };\x0a}";
//>>excludeEnd("ide");
$core.addMethod(
$core.method({
selector: "initialize",
protocol: 'initialization',
fn: function (){
var self=this;
function $SimpleAxon(){return $globals.SimpleAxon||(typeof SimpleAxon=="undefined"?nil:SimpleAxon)}
function $AppModel(){return $globals.AppModel||(typeof AppModel=="undefined"?nil:AppModel)}
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
return $core.withContext(function($ctx1) {
//>>excludeEnd("ctx");
var $1;
(
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
$ctx1.supercall = true, 
//>>excludeEnd("ctx");
$globals.App.superclass.fn.prototype._initialize.apply($recv(self), []));
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
$ctx1.supercall = false;
//>>excludeEnd("ctx");;
$1=$recv($SimpleAxon())._new();
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
$ctx1.sendIdx["new"]=1;
//>>excludeEnd("ctx");
self._axon_($1);
self._model_($recv($AppModel())._new());
return self;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
}, function($ctx1) {$ctx1.fill(self,"initialize",{},$globals.App)});
//>>excludeEnd("ctx");
},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: [],
source: "initialize\x0a\x09super initialize.\x0a    self axon: SimpleAxon new.\x0a    self model: AppModel new",
referencedClasses: ["SimpleAxon", "AppModel"],
//>>excludeEnd("ide");
messageSends: ["initialize", "axon:", "new", "model:"]
}),
$globals.App);



$core.addClass('AppModel', $globals.Object, ['value'], 'Trapped-Counter');
$core.addMethod(
$core.method({
selector: "decrement",
protocol: 'action',
fn: function (){
var self=this;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
return $core.withContext(function($ctx1) {
//>>excludeEnd("ctx");
self["@value"]=$recv(self["@value"]).__minus((1));
return self;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
}, function($ctx1) {$ctx1.fill(self,"decrement",{},$globals.AppModel)});
//>>excludeEnd("ctx");
},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: [],
source: "decrement\x0a\x09value := value - 1",
referencedClasses: [],
//>>excludeEnd("ide");
messageSends: ["-"]
}),
$globals.AppModel);

$core.addMethod(
$core.method({
selector: "increment",
protocol: 'action',
fn: function (){
var self=this;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
return $core.withContext(function($ctx1) {
//>>excludeEnd("ctx");
self["@value"]=$recv(self["@value"]).__plus((1));
return self;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
}, function($ctx1) {$ctx1.fill(self,"increment",{},$globals.AppModel)});
//>>excludeEnd("ctx");
},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: [],
source: "increment\x0a\x09value := value + 1",
referencedClasses: [],
//>>excludeEnd("ide");
messageSends: ["+"]
}),
$globals.AppModel);

$core.addMethod(
$core.method({
selector: "initialize",
protocol: 'initialization',
fn: function (){
var self=this;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
return $core.withContext(function($ctx1) {
//>>excludeEnd("ctx");
(
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
$ctx1.supercall = true, 
//>>excludeEnd("ctx");
$globals.AppModel.superclass.fn.prototype._initialize.apply($recv(self), []));
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
$ctx1.supercall = false;
//>>excludeEnd("ctx");;
self["@value"]=(0);
return self;
//>>excludeStart("ctx", pragmas.excludeDebugContexts);
}, function($ctx1) {$ctx1.fill(self,"initialize",{},$globals.AppModel)});
//>>excludeEnd("ctx");
},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: [],
source: "initialize\x0a\x09super initialize.\x0a\x09value := 0",
referencedClasses: [],
//>>excludeEnd("ide");
messageSends: ["initialize"]
}),
$globals.AppModel);

$core.addMethod(
$core.method({
selector: "value",
protocol: 'accessing',
fn: function (){
var self=this;
var $1;
$1=self["@value"];
return $1;

},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: [],
source: "value\x0a\x09^value",
referencedClasses: [],
//>>excludeEnd("ide");
messageSends: []
}),
$globals.AppModel);

$core.addMethod(
$core.method({
selector: "value:",
protocol: 'accessing',
fn: function (aNumber){
var self=this;
self["@value"]=aNumber;
return self;

},
//>>excludeStart("ide", pragmas.excludeIdeData);
args: ["aNumber"],
source: "value: aNumber\x0a\x09value := aNumber",
referencedClasses: [],
//>>excludeEnd("ide");
messageSends: []
}),
$globals.AppModel);


});
