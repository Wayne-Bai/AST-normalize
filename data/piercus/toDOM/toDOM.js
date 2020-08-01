sand.define("toDOM/toDOM", ["core/extend"],   
  function(r) {
  
  /** 
   *  .
   *  @module toDOM/toDOM
   *  @exports a function that Build an element from a djson object, or a djson-string        
   *  
   *  @param {djson} djson Document-JSON Object 
   *  @param {Object} scope the scope where to put reference defined by the "as" key                                       
   *  @see djson
   *  @example Basic example
   *  
   *  var djson = { 
   *    tag : "div", 
   *    innerHTML : "blabla", 
   *    style : { 
   *      backgroundColor : "pink" 
   *    }, 
   *    events : { click : function() { return false; } }, 
   *    attrs : { "class" : "a-class" },
   *    children : [{ 
   *        tag : "p", 
   *        as : "foo", 
   *        ... 
   *      },
   *      null // sometimes you put null
   *    ]
   *  };
   *  
   *  var scope = this; //=> the scope where to put reference
   *  
   *  var el = toDOM(djson, scope); //=> el is a HTMLElement       
   *  // if you specify a scope as shown above, scope.foo will be a reference to the element to which you applied it (in this case the "p" element)      
   *
   *  @returns {Object} Returns the HTMLElement 
   */    
   
  /** 
   *  @namespace djson 
   *  @example
   *  { 
   *    tag : "div", 
   *    innerHTML : "blabla", 
   *    style : { 
   *      backgroundColor : "pink" 
   *    }, 
   *    events : { click : function() { return false; } }, 
   *    attrs : { "class" : "a-class" },
   *    children : [{ 
   *        tag : "p", 
   *        as : "foo", 
   *      }
   *    ]
   *  }
   *  @desc djson is a format to describe HTML with JSON 
   */
  
  
  
  var parseChildren = function(str){
    var reg = /\[|\]|,|$/g, 
        res = { children : [], tag : ""}, 
        currentPath = [], 
        currentOffset = 0,
        parseTag = function(path){ 
          var o = res;
          for (var i = 0; i < path.length; i++){
            o = o.children[path[i]];
          }
          var nO = parseString(o.tag);
          for(var i in nO) if(nO.hasOwnProperty(i)){
            o[i] = nO[i];
          }
        }, 
        setTag = function(path, toAdd){
          var o = res;
          for (var i = 0; i < path.length; i++){
            if(!o.children) {
              o.children = [{ tag : "" }];
            } else if (!o.children[path[i]]){
              o.children.push({ tag : ""});
            }
            o = o.children[path[i]];
          }
          o.tag += toAdd;            
        };
        
    str.replace(reg, function(c, offset){
      var text = str.slice(currentOffset, offset);
      setTag(currentPath, text);
      if (c === "["){
        currentPath.push(0);
      } else if (c === ","){
        parseTag(currentPath);

        currentPath[currentPath.length-1] = currentPath[currentPath.length-1] + 1;
         
      } else if (c === "]") {
        parseTag(currentPath);
        currentPath.pop();
      } else {//$ end of the string
        parseTag(currentPath); 
      }     
      currentOffset = offset+1;
    });
        
    return res;
  };
  
  var parseString = function(str){
    if(str.match(/\[/)){ 
     /**
      * @namespace djson-string 
      * @desc djson short (string) notation let you use short strings, it's more slow than djson basic notation but it's less verbose
      * only children, as, tag properties are fully available with json-string notation
      * you can also use attr.id and attr.class
      * @see [djson-hybrid] is a mix between djson-string and class djson notation
      * @example
      * toDOM('div[a, div, yo]') => &#60;div&#62;&#60;a&#62;&#60;/a&#62;&#60;div&#62;&#60;/div&#62;&#60;yo&#62;&#60;/yo&#62;&#60;/div&#62; 
      */
      return parseChildren(str);
    }
    
    // remove leading whitespaces (used for div[a, img, y] whitespace-after-coma convention)
    str = str.replace(/^ */,"");
    
    var specialChars = ["#", "\\.", " "],
        regAny = new RegExp(specialChars.join("|"),"g"),
        strNone = "[^"+specialChars.join("")+"]*",  
        className, id, innerHTML, tag,
        res = {},
                
     /**
      *  @namespace djson-string->as  
      *  @desc as is set with sandjs alias synthax
      *  @example 
      *  toDOM('a->foo'); //=> { tag : 'a', as : "foo"} 
      */
        as = str.split("->")[1],
        str = str.split("->")[0];
    
    as && (res.as = as); 

    // if no special character, 
    if(str.split(regAny).length < 1){
      res.tag = str;
      return res;
    }
    
    var t = str,m;
    /**
     *  @namespace djson-string->className 
     *  @desc className is set with css-selector-like synthax 
     *  @example 
     *  toDOM('a.a-class.an-other-class'); //=> &#60;a class="a-class an-other-class"&#62;&#60;/a&#62; 
     */
    (m = t.match(new RegExp("\\."+strNone, "g"))) && (className = m.map(function(e){return e.slice(1);}).join(" "));

    /**
     *  @namespace djson-string->id  
     *  @desc id is set with css-selector-like synthax
     *  @example 
     *  toDOM('a#an-id') //=> &#60;a id="an-id"&#62;&#60;/a&#62; 
     */
    (m = t.match(new RegExp("#"+strNone))) && (id =  m[0].slice(1));
    
    /**
     *  @namespace djson-string->innerHTML     
     *  @desc innerHTML is set with an space, notice 
     *  NB : ' text' does not work, you need to use 'div text'
     *  @example 
     *  toDOM('div yo yo yo ') //=> &#60;div&#62;yo yo yo &#60;/div&#62; 
     */   
    (m = t.match(/. .*/)) && (res.innerHTML = m[0].slice(2));
                      
    /**
     *  @namespace djson-string->tag    
     *  @desc tag is the first characters of the string before any special character (space, #, . ...)
     * @example 
     * toDOM('bar   '); //=> &#60;bar&#62;  &#60;/bar&#62;
     *                                                               
     */        
    (m = t.match(new RegExp("^"+strNone))) && (res.tag = m[0]); 
    
    if(className || id){
      res.attr = {};
      className && (res.attr.className = className);
      id && (res.attr.id = id);
    }
    
    return res;
  };
  
  
  var toDOM = function(djson, scope) {
    var obj = djson, el, attr, els, p, q, evt, style, l, k;
    
    // 1. obj typeof disjonction
    if (typeof(obj) === "undefined" || obj === null) return (obj);
    
    if(typeof(obj) === "function") return toDOM.call(this, obj.call(this), scope);
    
    if (typeof(obj) === 'string') return toDOM(parseString(obj), scope);
    

    /**
     *  @namespace djson->tag
     *  @desc  
     *  NB1 : if you want to create html like '&#60;a&#62;go go &#60;strong&#62;go&#60;strong&#62;!&#60;/a&#62;', you can use the textNode tag
     *  <br/>NB2 : use short (string) notation inside 'tag', {@link djson-hybrid}
     *  @property {string} tag set the tagName, default is 'div'
     *  @example  
     *  toDOM({ tag : 'foo' }) 
     *  //=> &#60;foo&#62;&#60;/foo&#62; 
     *
     *  toDOM({
     *      tag : "a", 
     *      children : [{ 
     *          tag : "textNode", 
     *          innerHTML : "go go " 
     *        },{ 
     *          tag : "strong", 
     *          innerHTML : "go" 
     *        },{ 
     *          tag : "textNode", 
     *          innerHTML : "!"
     *      }]
     *  }); 
     *  //=> '&#60;a&#62;go go &#60;strong&#62;go&#60;strong&#62;!&#60;/a&#62;'
     *   

     */    
     /**
      *  @namespace djson-hybrid
      *  @desc Hybrid notation is to use {@link djson-string} short (string) notation,                           
      *  @example
      *  // The followings 3 codes are equivalent
      *  toDOM({ children : [{ tag : "a.foo.bar" }] }); //hybrid-notation
      *  toDOM({ children : [{ tag : "a", attr : { className : "foo bar"} }] }); // full notation
      *  toDOM({ children : ["a.foo.bar"] }); // short-notation inside full-notation
      *
      *  //=> &#60;div&#62;&#60;a class="foo bar"&#62;&#60;/a&#62;&#60;/div&#62;
      
      */     
    if (typeof(obj.tag) === "undefined" || obj.tag === "") {
      if (obj.nodeName) { return (obj); }
      obj.tag = "div";
    } else if (obj.tag.split(/\.|#| |>/g).length > 1) { 
      var tag = obj.tag;
      delete obj.tag;
      return toDOM(r.extend(parseString(tag), obj), scope);
    }  
    
    // 3. djson notation implementation 
    if(obj.tag == "textNode"){
      el = document.createTextNode(obj.innerHTML); 
      return el;
    } 
    
    el = document.createElement(typeof(obj.tag) !== "function" ? obj.tag : obj.tag.call(scope));
    
    // <ie7 class key fix
    if (obj.attr && (obj.attr["class"] || obj.attr["className"])){
      obj.className = obj.attr["class"] || obj.attr["className"];
      delete obj.attr["class"];
      delete obj.attr["className"];
    }
     
    if(obj.className){
      el.className = obj.className;
    }
  
    /**
     * @namespace djson->attr 
     * @property {object} attr set attributes 
     * @example
     * { attr : { foo : 'bar' }} => &#60;div foo="bar"&#62;&#60;/div&#62; 
     */
     
    if (obj.attr) 
      for (attr in obj.attr) 
        obj.attr.hasOwnProperty(attr) && obj.attr[attr] && el.setAttribute(attr, obj.attr[attr]);
   
    /**
     * @namespace djson->as  
     * @property {string} as set reference key in the scope
     * @example  
     * var el = toDOM({ as : 'foo' }, this);
     * this.foo //=> HTMLElement 
     */ 
       
    (obj.as)&&(scope[obj.as]=el);
    
    /**
     * @namespace djson->innerHTML 
     * @property {string|HTMLElement|function} innerHTML set the html inside the tag 
     * @example
     * { innerHTML : 'my lord <d>Stark </d>' } => '&#60;div&#62;my lord &#60;d&#62;Stark &#60;/d&#62;&#60;/div&#62;'
     *  
     * NB : be careful of XSS 
     */
    if (typeof(obj.innerHTML) !== "undefined") {
      if (typeof(obj.innerHTML) === "function") {
        el.innerHTML = obj.innerHTML.call(scope) || "";
      }
      else el.innerHTML = obj.innerHTML;
    }
    
    /** 
     * @namespace djson->events
     * @property {object} events set the "on..." events (onclick, onover, ...)
     * @property {function} events.click set the "on..." events (onclick, onover, ...)
     * @example 
     * var f = function(){ console.log('onClick'); };
     * var el = toDOM({ events : { click : f } });
     * el.onclick === f; //=> return true
     */
     
    if (obj.events) for (var evt in obj.events) (obj.events.hasOwnProperty(evt))&&(el["on"+evt]=obj.events[evt]); 
    
    /**
     * @namespace djson->style 
     * @property {object} style key set css style inside the html
     * @example
     * { style : { backgroundColor : "red" } } => '&#60;div style="background-color:red;"&#62;&#60;/div&#62;' 
     *
     * NB : use camelCase keys in style
     */ 
     
    if (obj.style) for (style in obj.style) (obj.style.hasOwnProperty(style))&&(el.style[style]=obj.style[style]);
    
    /**
     * @namespace djson->children 
     * @property {array|function} children the children, if function it must return the children array
     * @property {djson|string|HTMLElement} children[0] 
     * @example
     * { children : [{ children : [{}] }] } => '&#60;div&#62;&#60;div&#62;&#60;div&#62;&#60;/div&#62;&#60;/div&#62;&#60;/div&#62;' 
     *  NB : if a child is null, he won't be created
     */ 
    
    if (obj.children) {
      var cs = (typeof(obj.children) === "function" ? obj.children.call(scope) : obj.children);
      for (k = 0, l = cs.length; k < l; k++) {
        els = toDOM(cs[k], scope);
        if (typeof(els) !== "undefined" && els !== null) {
          if (typeof(els.childNodes) === "undefined") // array //MCB STT-> it used to be els.tagName
            for (p = 0, q = els.length; p < q; p++) el.appendChild(els[p]);
          else {
            el.appendChild(els);
          }
        }
      }
    }

    return (el);
  };
  
  return toDOM;  
});
