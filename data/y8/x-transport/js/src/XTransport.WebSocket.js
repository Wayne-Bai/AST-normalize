/**
  @author  Fyodorov "bga" Alexander <bga.email@gmail.com>, 2010
 
  @see LICENSE http://github.com/y8/x-transport/blob/master/LICENSE
 
  @fileOverview
*/

if(window.XTransport==null)
  window.XTransport={};

if("WebSocket" in window)
{
  /**
    @name XTransport.WebSocket
    @class 
  */  
  window.XTransport.WebSocket=function()
  {
    XTransport.Base.call(this);
    
    this.origUrl_=null;
    this.url_=null;
    this.port_=null;
    
    this.ws_=null;
    
    this.waitFlushCount_=0;
    this.waitFlushThreadId_=null;
    
    // static bindings
    this.__wsOpened=this.__wsOpened._fBind(this);
    this.__wsDataReceived=this.__wsDataReceived._fBind(this);
    this.__wsClosed=this.__wsClosed._fBind(this);
    this.__waitFlushThread=this.__waitFlushThread._fBind(this);
  };
  
  XTransport.WebSocket._staticDeriveFrom(XTransport.Base)
  
  XTransport.WebSocket.prototype.__wsOpened=function(e)
  {
    this.readyState=1;
    this._fireEvent("connected",this)
  };
  XTransport.WebSocket.prototype.__wsDataReceived=function(e)
  {
    this._fireEvent("dataReceived",this,[e.data])
  };
  XTransport.WebSocket.prototype.__wsClosed=function()
  {
    if(this.readyState!=2)
      this._close(false);
  };
  
  XTransport.WebSocket.prototype._send=function(data)
  {
    if(this.readyState==1)
    {
      this.ws_.send(data+"");
      
      return this;
    }

    this._fireEvent("error",this,[new InvalidStateError("XTransport not open")])
    
    return this;
  };

  XTransport.WebSocket.prototype._getUrl=function()
  {
    return this.origUrl_;
  };
  XTransport.WebSocket.prototype._setUrl=function(url)
  {
    var wsUrl;
    
    if(url!=null &&
      (wsUrl=url.replace(/^xtr(s?):\/\/([^\/:]+)(:\d+)?\//,"ws$1://$2/")).substr(0,2)=="ws"
    )  
    {
      this.origUrl_=url;
      this.url_=wsUrl;
      this.port_=RegExp.$3;
      
      if(this.port_>"")
        this.port_-=0;
      else
        this.port_=null;
    }
    else
    {
      this.url_=this.port_=this.origUrl_=null;
      this._fireEvent("error",this,[new URIError(url)]);
    }
      
    return this;  
  };

  XTransport.WebSocket.prototype._open=function(url)
  {
    if(url!=null)
    {
      this._setUrl(url);
      
      return this;
    }
    else if(this.origUrl_==null)
    {
      this._fireEvent("error",this,[new URIError(null)]);
      
      return this;
    }
    
    if(this.readyState!=2)
    {
      this._fireEvent("error",this,[new InvalidStateError("XTransport not closed")]);
      
      return this;
    }
    
    try
    {
      this.ws_=new WebSocket(this.url_,this.port_);
      this.readyState=0;
      
      this.ws_.onopen=this.__wsOpened;
      this.ws_.onmessage=this.__wsDataReceived;
      this.ws_.onclose=this.__wsClosed;
    }
    catch(err)
    {
      this.ws_=null;

      this._fireEvent("error",this,[err]);
    };
    
    return this;
  };

  XTransport.WebSocket.prototype._close=function(isSilentClose)
  {
    if(this.readyState==2)
      return this;
      
    this.readyState=2;
    this.ws_.onopen=this.ws_.onmessage=this.ws_.onclose=null;
    this.ws_.close();
    this.ws_=null;
    
    if(isSilentClose===false)
      this._fireEvent("closed",this);
      
    return this;
  };
  
  XTransport.WebSocket.prototype._isBufferEmpty=function()
  {
    return !(this.ws_ && this.ws_.bufferedAmount>0);
  };
  
  XTransport.WebSocket.prototype.__waitFlushThread=function()
  {
    if(!this._isBufferEmpty())
      return;
    
    clearInterval(this.waitFlushThreadId_);
    this.waitFlushThreadId_=null;
    this.waitFlushCount_=0;
    this._fireEvent("flushed",this);
  };
  XTransport.WebSocket.prototype._waitFlush=function()
  {
    if(this._isBufferEmpty() && this.waitFlushCount_==0)
    {
      this._fireEvent("flushed",this);
      
      return this;
    }  
    
    if(++this.waitFlushThreadId_!=1)
      return this;
      
    this.waitFlushThreadId_=setInterval(this.__waitFlushThread,30);
  };
  XTransport.WebSocket.prototype._stopWaitFlush=function()
  {
    if(this.waitFlushCount_<=0)
    {  
      this._fireEvent("error",this,[new InvalidAccessError("_stopWaitFlush more call than _waitFlush")]);
      
      return this;
    }

    if(--this.waitFlushCount_==0)
    {
      clearInterval(this.waitFlushThreadId_);
      this.waitFlushThreadId_=null;
    }
    
    return this;
  };
  
  XTransport.availClassMap["XTransport.WebSocket"]=XTransport.WebSocket;
}
