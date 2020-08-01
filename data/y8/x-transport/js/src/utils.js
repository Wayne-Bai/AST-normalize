/**
  @author  Fyodorov "bga" Alexander <bga.email@gmail.com>, 2010
 
  @see LICENSE http://github.com/y8/x-transport/blob/master/LICENSE
 
  @fileOverview
*/

Function.prototype._apply=function(that,args)
{
  return (args==null) ? this.call(that) : this.apply(that,args);
};

Function.prototype._fBind=function(that,args)
{
  var _func=this;
  var _ret=function()
  {
    return _func._apply(that || this, args || arguments);
  };
  
  _ret.prototype=_func.prototype;
  
  return _ret;
};

Function.prototype._staticDeriveFrom=function(_constuctor)
{
  var i=null;
  var dpr=this.prototype;
  var spr=_constuctor.prototype;
  
  for(i in spr)
  {
    if(spr.hasOwnProperty(i))
      dpr[i]=spr[i];
  };
  
  return this;
};

if(typeof([].indexOf)!="function")
{
  Array.prototype.indexOf=function(value,begin)
  {
    if(begin==null)
      begin=0;

    var end=this.length;
    
    if(end<=begin)
      return -1;
    
    --begin;
    
    while(++begin!==end && this[begin]!==value)
      ;
    
    return begin!==end ? begin : -1;
  };
}

DOMException.SECURITY_ERR=18;

window.DOMError=function(msg,code)
{
  Error.call(this);
  
  this.code = code;
  this.name = "DOMException";
  this.constructor=DOMException;
  this.message=msg;
};

window.InvalidStateError=function(msg)
{
  DOMError.call(msg,DOMException.INVALID_STATE_ERR);
};
window.SecuriryError=function(msg)
{
  DOMError.call(msg,DOMException.SECURITY_ERR);
};
window.InvalidAccessError=function(msg)
{
  DOMError.call(msg,DOMException.INVALID_ACCESS_ERR);
};
window.ValidationError=function(msg)
{
  DOMError.call(msg,DOMException.VALIDATION_ERR);
};
window.NotFoundError=function(msg)
{
  DOMError.call(msg,DOMException.NOT_FOUND_ERR);
};
window.NotSupportedError=function(msg)
{
  DOMError.call(msg,DOMException.NOT_SUPPORTED_ERR);
};

window.BufferOverflowError=function(msg)
{
  Error.call(this);
  
  this.name = "BufferOverflowError";
  this.message=msg;
};
