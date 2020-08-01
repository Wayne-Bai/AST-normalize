/* Copyright (c) 2009 Marak Squires - www.maraksquires.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

/***********************************************************************

  route.js enables you to create "routes" based on a unique path
  a route can be considered a unique state
  a route may have multiple functions bound to them
  a route can be triggered by calling route('/foo').run()

  *** http://en.wikipedia.org/wiki/Inversion_of_control ***
          *** "Don't call us, we'll call you" ***

  USAGE:


  route('#/account').bind(customMethod);
  route('#/account').bind(customMethod2);

  route('#/websites').bind(customMethod);
  route('#/websites').bind(function(){
  alert('custom closure');
  });

  route('#/account').run();
  route('#/websites').run();

  WHERE THE ROUTES AT?

  All routes are stored globally in window['routes']
  console.log(window['routes']);

  ROUTE PATTERN MATCHING  (aka Sinatra routing):

  add docs here

  ASPECTS OF THE ROUTE (aka Apsect Oriented Programming)

  var myBefore = function(){
    alert('before()');
  };

  var myAfter = function(){
    alert('after()');
  };

  var myExit= function(){
    alert('exit()');
  };

  route('#/Learn/:topic').before(myBefore);
  route('#/Learn/:topic').after(myAfter);
  route('#/Learn/:topic').exit(myExit);

  PROTIP: Use a Dispatcher!

  var Biggie={};
  Biggie._hashchange_last = '';
  Biggie._onhashchange=function(){
    if(Biggie._hashchange_last!=location.hash){
      Biggie._hashchange_last=location.hash;
    route(location.hash).run();
    }
  }

  setInterval(function () {Biggie._onhashchange();}, 50);


  Now, instead of calling route('#/websites').run() directly
  you could simply modify the location.hash to #/websites and
  the route would trigger its events!

*************************************************************************/

/* make null reference for debug.log if http://github.com/Marak/debug.js isn't available */
if(typeof debug == 'undefined'){var debug = {"log":function(){return false;}}}

var route=function(path){
  return new route.fn.init(path);
}
route.fn = route.prototype = {
  init: function(path) {

    /* lazy init window['routes'] */
  if(typeof window['routes'] == 'undefined'){window['routes']={};}

    /* lazy init path */
    if(typeof path=='undefined'){path='';}

  /* lazy init route args hash */
  if(typeof args == 'undefined'){var args = {};}

  /* lazy init instance events */
  if(typeof this.events == 'undefined'){this.events= new Array();}

    /* lazy init bindPath, we need the original path sent as to not confuse .bind() when route pattern matching occurs */
    if(typeof bindPath=='undefined'){bindPath='';}

  /* assign args and path to route instance */
  this.args = args;
  this.path = path;
  this.bindPath = path;

    /* lazy init window['routes'].exit, this temporarily stores the exit functions of the last route */
  if(typeof window['routes'].exit == 'undefined'){window['routes'].exit=new Array();}


  if(typeof window['routes'][this.bindPath]=='undefined'){
    window['routes'][this.bindPath]={};
  }

  if(typeof window['routes'][this.bindPath].before=='undefined'){
    window['routes'][this.bindPath].before=new Array();
  }

  if(typeof window['routes'][this.bindPath].events=='undefined'){
    window['routes'][this.bindPath].events=new Array();
  }

  if(typeof window['routes'][this.bindPath].after=='undefined'){
    window['routes'][this.bindPath].after=new Array();
  }

  if(typeof window['routes'][this.bindPath].exit=='undefined'){
    window['routes'][this.bindPath].exit=new Array();
  }



  if(typeof window['routes'][this.bindPath].args=='undefined'){
    window['routes'][this.bindPath].args={};
  }

  debug.log('route(\''+this.path+'\')');

  /* remove trailing slash from path if it exists */
  if(this.path[this.path.length-1]=='/'){this.path = this.path.substring(0,this.path.length-1);}

  /* a literal route match was found */
  if(typeof window['routes'][this.path]=='object'){
    /* a direct match was found, interate through events for direct match assigning them to route instance */
    debug.log('route(s) found for \'' + this.path + '\'');

    /* window['routes'][this.path].args = args; */
    for(var i=0; i<window['routes'][this.path].events.length; i++){
      this.events.push(window['routes'][this.path].events[i]);
    }

  }

    /* check if route matches any known route patterns (using the : operator) */
    for(r in window['routes']){
      if((r.split('/').length==this.path.split('/').length) && (r.search(/:/) > 0)){
      debug.log('found possible match: [' + r + ' - ' +this.path+']');
      debug.log(r);

      /* since we found a possible match, bubble route with arguments as params */
      for(param in r.split('/')){

        var paramName = r.split('/')[param];
        paramName = paramName.replace(/:/,'');
        debug.log('paramName: ' + paramName);

        var paramValue = this.path.split('/');
        paramValue = paramValue[param];
        debug.log('paramValue: ' + paramValue);

        args[paramName] = paramValue;
      }
      /* rebind instance variables */
      this.args = args;
      this.path = r;


      /* before */
      for(var i=0; i<window['routes'][r].before.length; i++){
        debug.log('pushing events before ' + r);
        this.events.push(window['routes'][r].before[i]);
      }

      /* events */
      for(var i=0; i<window['routes'][r].events.length; i++){
        debug.log('pushing event to ' + r);
        this.events.push(window['routes'][r].events[i]);
      }

      /* after */
      for(var i=0; i<window['routes'][r].after.length; i++){
        debug.log('pushing events after ' + r);
        this.events.push(window['routes'][r].after[i]);
      }

      /* exit */
      for(var i=0; i<window['routes'][r].exit.length; i++){
        debug.log('pushing events exit ' + r);
        window['routes'].exit.push(window['routes'][r].exit[i]);
      }



      }
     }
  return this;
  },


  bind: function(fn) {

  if(this.bindPath==''){
    return 'nothing to bind';
  }

  if(typeof fn != 'function'){
    return 'fn is invalid and cannot bind to route';
  }

  window['routes'][this.bindPath].events.push(fn);
    debug.log('the following method has been bound to \'' + this.bindPath + '\' : ' + fn.toString());

  return 'fn bound to route';

  },

  before: function(fn){
  console.log('before: ' + fn.toString());

  if(this.bindPath==''){
    return 'nothing to bind';
  }

  if(typeof fn != 'function'){
    return 'fn is invalid and cannot bind to route';
  }

  window['routes'][this.bindPath].before.push(fn);
    debug.log('the following method has been bound before \'' + this.bindPath + '\' : ' + fn.toString());

  return 'fn bound to route';

  },

  after: function(fn){
  console.log('after: ' + fn.toString());

  if(this.bindPath==''){
    return 'nothing to bind';
  }

  if(typeof fn != 'function'){
    return 'fn is invalid and cannot bind to route';
  }


  window['routes'][this.bindPath].after.push(fn);
    debug.log('the following method has been bound after \'' + this.bindPath + '\' : ' + fn.toString());

  return 'fn bound to route';


  },

  exit: function(fn){

  console.log('exit: ' + fn.toString());

  if(this.bindPath==''){
    return 'nothing to bind';
  }

  if(typeof fn != 'function'){
    return 'fn is invalid and cannot bind to route';
  }

  window['routes'][this.bindPath].exit.push(fn);
    debug.log('the following method has been bound exit \'' + this.bindPath + '\' : ' + fn.toString());

  return 'fn bound to route';


  },

  run: function() {

  if(this.events.length==0){
    return 'nothing to run';
  }

    debug.log('route.run(\''+this.path+'\');');

  /* before we run the next route, we need to check if there are any events in window['routes'].exit */
  for(var i=0; i<window['routes'].exit.length; i++){
    window['routes'].exit[i](this.args);
    debug.log('executing:' + window['routes'].exit[i] + '\nwith arguments: ');
  }
  window['routes'].exit = new Array();

  for(var i=0; i<this.events.length; i++){
    this.events[i](this.args);
    debug.log('executing:' + this.events[i] + '\nwith arguments: ' + this.args.toString());
  }
  return 'route executed';
  }

};
route.fn.init.prototype = route.fn;
