/**#nocode+*/
(function(){"use strict";
function defineModule(){
/**#nocode-*/
    /** @namespace
     *
     * clone.js - the true prototype-based lazy programming framework.  
     *   
     * <h3>
     * Naming convention
     * </h3><pre>
     * $property - $  prefix used to prevent accidental name collision.    
     * object$   - $ postfix means prototype (Object.prototype === object$).              
     * Object    - Class.                                                 
     * _variable - Variable that used in closure(s).    
     * </pre>
     * 
     * @version v1.3.2-alpha
     * @author  Alex Shvets
     * @see     www.clonejs.org
     * 
     * @borrows private._cloneByProto       as byProto
     * @borrows private._cloneByCreate      as byObjectCreate
     * @borrows private._cloneByConstructor as byConstructor
     *
     * @function
     * @description
     * 
     * Creates new object, inherited from other object (prototype).  
     * Works like {@link Object.create}, but the second argument is simple object, not [propertyDescriptor](_global_.html#propertyDescriptor).
     * It should be an object literal only. But, if you really need it, the rule may be changed to:  
     * *External usage of second argument after cloning should use only it own properties.*  
     * clone() function may change its argument, this is the side effect of `__proto__` usage.  
     * This rule is need to make no difference with other clone methods: by constructor and Object.create.  
     *    
     * It's not named as class (noun: `new Clone`), becouse
     * it mainly should be used as function (verb): `clone (something)`.
     * 
     * @param  proto - Object to clone. Prototype. If function passed, it prototype property will be used instead.
     * @param  state - The own properties of created object, should be not a variable, object literal only
     *                 (because it can be modified), for example: `{key:"value"}`.  
     *                 By default — empty object (`{}`).
     * @returns {Object}
     */
    function clone(/** !Object|Class */proto, /** !ObjLiteral={} */state){
//        if( this && this instanceof clone){// new operator used 
//            state = arguments[0];
//            proto = clone.prototype;
//            if(!state){
//                return this;
//            }
//        }
        if(typeof proto === 'function' ) proto = proto.prototype;
        if(typeof state === 'undefined') state = {};
        //</arguments>
        if(typeof  proto.$clone === 'function' && proto.$clone !== clone.$.$clone ){
            return proto.$clone(state);
        }else return _clone(proto, state);
    }
    /**#@+ @memberOf private */
    
    /** The fastest method (except second and next calls `byConstructor()`). */
    function _cloneByProto(/** Object */proto, /** !ObjLiteral */state){
        state.__proto__ = proto;
        return state;
    }

    /** Use this method only if `byProto()` unavailable. */
    function _cloneByCreate(/** Object */proto, /** ObjLiteral= */state){
        var newObj = Object.create(proto);
        for(var key in state) newObj[key] = state[key];
        return newObj;
    }

    /** 
     * This method is slowest on first call, but it creates custom $clone method,
     * that may be fastest than all. So, use it if you need hundreds of instances. */
    function _cloneByConstructor(/** !Object */proto, /** ObjLiteral= */state){
        
        //TODO: this is duplicated functionality of clone(), need to make ability
        //      to call this function many times.
        if(typeof  proto.$clone === 'function' && proto.$clone !== clone.$.$clone ){
            return proto.$clone(state);
        }
        
        if(! _hasOwn.call(proto, 'constructor') ){
            proto.constructor = _Clone;
        }

        function _Clone(state){
            for(var key in state) this[key] = state[key];
        }
        _Clone.prototype = proto;

        /** @override */
        proto.$clone = function(state){
            return new _Clone(state);
        }

        return new _Clone(state);
    }

    /**
     * Thransforms {@link behaviorDescriptor} to the behavior object.  
     * If behavior object passed, it will be returned without changes.
     * @return {clone.behavior$}
     */
    function _Behavior(/** !behaviorDescriptor|clone.behavior$ */behavior){

        //if( clone.behavior$.isPrototypeOf(behavior) ){
        if( behavior instanceof _Behavior ){
            return behavior;
        }

        /// $inherits

        if( _hasOwn.call(behavior, '$inherits') ){
            var $inherits = behavior.$inherits;
            if(! _hasOwn.call($inherits, '$inherits') || _getProto($inherits) != $inherits.$inherits ){
                $inherits = _Behavior($inherits);
            }
        }else{
            $inherits = _protoOfNewClones;
        }
        
        /// $defaults

        var $inits = behavior.$inits;
        
        var $defaults = behavior.$defaults || $inits && {};
        if( $defaults && _getProto($defaults) !== $inherits ){
            $defaults = _clone($inherits, $defaults);
            _define(behavior, '$defaults', {value: $defaults});
            //_freeze(defaults);
            var proto = $defaults;
        }else   proto = $inherits;
        
        /// $inits

        if( $inits ){
            for(var key in $inits){
                clone.defineInitPropertyOf( $defaults, key, $inits[key],
                    {configurable:true},// iteration should not modify object, so, init getter is un-enumerable
                    {configurable:true, writable:true, enumerable:true}
                );
            }
            //delete behavior.$inits;
        }
        
        ///

        //if($defaults) _freeze($defaults);

        if( _getProto(behavior) !== proto ){
            behavior = _clone(proto, behavior);
        }

        if( $inherits !== behavior.$inherits ){
            _define(behavior, '$inherits', {value:$inherits});
        }
        
        if( _hasOwn.call(behavior, 'constructor') && behavior.constructor.prototype !== behavior){
            behavior.constructor.prototype = behavior;
        }

        //_freeze(behavior);
        return  behavior;
    }
    
    /**#@- private */

    var protoSupported = '__proto__' in {};
    
    if( protoSupported ){
        clone.Dict = function Dict_byProto(/** !ObjLiteral= */data){
            if( data === undefined){
                data = {};
            }//</arguments>
            data.__proto__ = null;
            return data;
        }
    }else{
        /**
         * Constructor of objects, that has only own properties (its prototype is null).  
         * Also can be created by `Object.create(null)`.  
         * What is it for? See examples:
         * @example
         * /// Example 1 /////////////////////////////////////////////////////////
         *
         *     // Phone book
         *     var phones = {
         *       'John': '+7987654',
         *       'Peter': '+7654321'
         *     }
         *     function getPhone(name){
         *       if(name in phones) return phones[name];
         *       else return undefined;
         *     }
         *     console.log(getPhone('John'));          // => '+7987654'
         *     console.log(getPhone('hasOwnProperty'));// => function hasOwnProperty() { [native code] }
         *
         * /// Example 2 /////////////////////////////////////////////////////////
         *
         *     var phones = {
         *       'John':'+7987654',
         *       'Peter':'+7654321'
         *     }
         *     function getPhone(name){
         *       if(phones.hasOwnProperty(name)) return phones[name];
         *       else return undefined;
         *     }
         *     console.log(getPhone('John'));          // => '+7987654'
         *     phones['hasOwnProperty'] = '+7666666';  // Add new user
         *     console.log(getPhone('John'));          // oops!
         *
         * /// Example 3 /////////////////////////////////////////////////////////
         *
         *     var phones = {
         *       'John':'+7987654',
         *       'Peter':'+7654321'
         *     }
         *     function getPhone(name){
         *       if(Object.prototype.hasOwnProperty.call(phones,name)) return phones[name];
         *       else return undefined;
         *     }
         *     console.log(getPhone('John'));          // => '+7987654'
         *     phones['hasOwnProperty'] = '+7666666';  // Add new user
         *     console.log(getPhone('John'));          // => '+7987654'
         *
         * /// Example 4 (use clone.Dict)  ///////////////////////////////////////
         *
         *     var phones = clone.Dict({
         *       'John':'+7987654',
         *       'Peter':'+7654321'
         *     });
         *     function getPhone(name){
         *       return phones[name];
         *     }
         *     console.log(getPhone('John'));          // => '+7987654'
         *     phones['hasOwnProperty'] = '+7666666';  // Add new user
         *     console.log(getPhone('John'));          // => '+7987654'
         *
         * @constructor
         * @typedef object
         * @returns {clone.Dict} */
        clone.Dict = function Dict_byCreate(/** !ObjLiteral= */data){
            var dict = (Object.create || _objectCreate_es3)(null);
            for(var key in data) dict[key] = data[key];
            return dict;
        }
    }
    clone.Dict.prototype = null;// does not affect anything, just for ideology
    
    // // // // // // // // // // // // // // // // // // // // // // // // // //
    // static methods:

    /**
     * Creates new object, based on `[clone.prototype]{@link clone.$}` or given {@link behaviorDescriptor}.
     * @returns {Object}
     */
    clone.new = function(/** !ObjLiteral={} */state, /** !behaviorDescriptor=clone.$ */behavior){
        if(arguments.length === 0){
            // `new` operator is faster than `clone` fn
            return new _protoOfNewClones.constructor;
        }else{
            behavior = behavior ? _Behavior(behavior) : _protoOfNewClones;
            return clone(behavior, state);
        }
    };
    
    /**
     * Creates new [behavior object]{@link clone.behavior$}.
     * @returns {clone.behavior$}
     */
    clone.extend = function(/** Class|!Object=clone.$ */proto, /** !behaviorDescriptor|behavior$ */behavior){
        if(typeof proto === 'function'){
            proto = proto.prototype;
        }
        if( behavior === undefined ){
            behavior = proto;
            //proto = _protoOfNewClones;
        }//</arguments>
        else{
            behavior.$inherits = proto;
        }
        return _Behavior(behavior);
    };

    clone.defineInitPropertyOf = function(
        /** object */obj,
        /** string */propertyName,
        /** function():* */getter,
        /** propertyDescriptor */descriptor,
        /** propertyDescriptor */initedDescriptor
    ){
//        if( initedDescriptor === undefined){
//            initedDescriptor = descriptor ? {
//                writable:     descriptor.writable,
//                enumerable:   descriptor.enumerable,
//                configurable: descriptor.configurable
//            } : {
//                writable:     true,
//                enumerable:   true,
//                configurable: true
//            };
//        }else initedDescriptor = _clone(initedDescriptor, {});
//        if( descriptor === undefined){
//            descriptor = {enumerable:false, configurable:true};
//        }else{
//            descriptor = _clone(descriptor, {});
//        }//</arguments>
        descriptor = _clone(descriptor, {
            get: function clone_initGetter(){
                return this[propertyName] = /* <- call setter */getter.call(this, propertyName, initedDescriptor);
            },
            set: function clone_initSetter(value){
                initedDescriptor.value = value;
                _define(this, propertyName, initedDescriptor);
            }
        });
        _define(obj, propertyName, descriptor);
    };
    
    /** Switch clone method. Call without parameters to return current method. */
    //TODO: add onDone callback.
    clone.by = function(/** (function|'auto'|'proto'|'create'|'constructor')= */method){
        var methods = clone.Dict({
            proto:       _cloneByProto,
            create:      _cloneByCreate,
            constructor: _cloneByConstructor
        });
        if('function' === typeof method){
            
            _clone = method;
            
        }else if(method){
            
            if( method === 'auto' ){
                setTimeout(_setCloneMethodByBench, 0);
            }else if(method in methods){
                _clone = methods[method];
            }else{
                throw new TypeError("Unknown clone method — "+ method);
            }
        }else{
            
            for(var methodName in methods){
                if( _clone === methods[methodName] ){
                    return methodName;
                }
            }
        }
    }
    
//    /** Faster than {@link clone.$apply}. */
//    clone.$call = function(/** Object */obj, /** string */method,/** (...)= */arg1, arg2, arg3, arg4, arg5, arg6, arg7){
//        return this.prototype[method].call(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
//    }
//
//    /** Slower than {@link clone.$call}. */
//    clone.$apply = function(/** Object */obj, /** string */method, /** Array= */args){
//        return this.prototype[method].apply(obj, args);
//    }
    
    // // // // // // // // // // // // // // // // // // // // // // // // // //
    // behavior of all created by clone.new objects:

    /** @name clone.$
     *  @class
     * Root prototype/behavior for clone instances (created by `{@link clone.new}`).  
     * Alias to `clone.prototype`.
     */
     var clone$Descriptor = /** @lands {clone.$#} */{
        /**#@+ @memberOf clone.$# */
        
        $inherits: Object.prototype,
        
        /**
         * In this framework constructors are optional. You can create types without constructor.  
         * Use constructor like initialize method:
         * 
         *     // create class:
         *     var class$ = {
         *         constructor: function(a, b){
         *             this.a = a;
         *             this.b = b;
         *         }
         *     };
         *     
         *     // create instance:
         *     var _instance = clone(class$);
         *     
         *     // create callback, that will initialize _instance later:
         *     function callback(){ _instance.constructor(1, 2) }
         *     
         *   
         * So, you can create empty instance, and initealize it later.  
         *   
         * The `new` operator is about 2-3 times faster than {@link clone} function. If you need 
         * thausens of instances, define the constructor and use it with new operator instead of {@link clone}.
         * 
         * @returns {clone.$}
         * @type Class
         * @field
         */
        constructor: function Clone(){},

        /** 
         * This is the object-oriented notation of clone function:  
         * For example: `myObject.$clone()` is identical to `clone(myObject)`.  
         * This method can be overrided. The difference with {@link constructor} is that $clone is only
         * function (it prototype property isn't pointed to this), not a {@link Class}, and it should
         * have only one argument – {@link ObjLiteral} state.
         * @returns {clone.$} */
        $clone: function(/** ObjLiteral={} */state){
            return _clone(this, state || {});
        },
        
        /** 
         * If called without arguments – returns state {@link clone.Hash}.
         * @nosideeffects
         * @returns {clone.Hash|*} */
        $get: function(/** string|Array= */key){
            var propertyNames = typeof key === 'object' && key instanceof Array && key;
            if(key === undefined || propertyNames){
                var state = clone.Dict();
                
                if(!propertyNames){
                    propertyNames = Object.getOwnPropertyNames(this);
                }
                for(var i=0, ln=propertyNames.length; i<ln; i++){
                    var name = propertyNames[i], value = this[name];
                    state[name] = (typeof value === 'function') ? value.valueOf() : value;
                }
                
//                for(key in this) if(_hasOwn.call(this, key)){
//                    state[key] =
//                        (typeof this[key] === 'function') ? this[key].valueOf() : this[key];
//                }
                return state;
            }else{
                return  (typeof this[key] === 'function') ? this[key].valueOf() : this[key];
            }
        },
        
        /** */
        $set: function(/** Object **/state_or_key, /** *= */value){
            if(value === undefined){
                for(var  key in state_or_key) if(_hasOwn.call(this, key)){
                    this[key] = state_or_key[key];
                }
            }else{
                this[state_or_key] = value;
            }
        },
        
        /** */
        $each: function(/** function(*,string) */iterator, /** Object=this */context){
            if( context === undefined){
                context = this;
            }//</arguments>
            for(var key in this) if(_hasOwn.call(this, key)){
                iterator.call(context, this[key], key);
            }
        },
        
        
        /** */
        $map: function(/** function(*,string):* */iterator, /** Object=this */context, /** Object=this */proto){
            if( context === undefined){
                context = this;
            }//</arguments>
            var mappedObj = clone(proto || this);
            for(var key in this) if( _hasOwn.call(this, key) ){
                mappedObj[key] = iterator.call(context, this[key], key);
            }
            return mappedObj;
        }
        
        /**#@- clone.$# */
    };
    
    /** 
     * @name    clone.behavior$
     * @extends clone.$
     * @class
     * The behavior object prototype. _Behavior objects is like a classes, but it's not a functions — **it's objects**,
     * also **behaviors are immutable** (can't be modified after creation).
     *
     * @property {object.<string,*>} $defaults  
     *           List of fields default values.
     * @property {clone.behavior$} $inherits  
     *           The parent behavior. Superclass.
     * @property {object.<string,function:*>} $inits  
     *           List of lazy initialization fields.
     *           
     * @borrows  private._Behavior as #constructor
     */
    /**#nocode+*/
    var behavior$Descriptor =/**#nocode-*/ {
        constructor: _Behavior,

        /**
         * Creates new type, inherited from this object.
         * Types should not be modified after creation, so, it's freezed.
         * @memberOf clone.behavior$#
         * @returns  {clone.behavior$} */
        $extend: function(/** objLiteral= */defaults, /** !behaviorDescriptor */behavior){
            if( behavior === undefined ){
                behavior = defaults;
                //</arguments>
            }else{
                behavior.$defaults = defaults;
            }
            return clone.extend(this, behavior);
        }
//        function $new(/** *= */state, /** ...* */ arg1, arg2, arg3){
//            if( this.$behavior.hasOwnProperty('constructor') ){
//                return new this.constructor(state, arg1, arg2, arg3);
//            }else{
//                return _clone(this, state);
//            }
//        }
    };

    // // // // // // // // // // // // // // // // // // // // // // // // // //
    // private functions:

    /**#@+ @memberOf private */
    
    function _defineProperty_es3(/** !Object */obj, /** string */propertyName, /** !propertyDescriptor */descriptor){
        var proto = obj.__proto__ || obj;
        if(descriptor.get || descriptor.set){
            //var upperPropertyName  = propertyName[0].toUpperCase() + propertyName.substring(1);
            if (descriptor.get){
                var getter /*= proto["get" + upperPropertyName]*/ = descriptor.get;
            }if(descriptor.set){
                var setter /*= proto["set" + upperPropertyName]*/ = descriptor.set;
            }
            var accessor = function accessor(value){
                //TODO: what is $owner?
                var scope = (this === accessor) ? accessor.$owner || null : this;
                if( value ){
                    setter.call(scope, value);
                }else{
                    return getter.call(scope);
                }
            }
            accessor.valueOf  = accessor;
            obj[propertyName] = accessor;
            
        }else{
            if( descriptor.enumerable ){
                obj[propertyName] = descriptor.value;
            }else{
                proto[propertyName] = descriptor.value;
            }
        }
    }

    function _getPrototypeOf_es3(obj){
        // see _defineProperty_es3
        return _hasOwn.call(obj, '__proto__') ? obj.__proto__ : obj.constructor.prototype;
        //return obj.__proto__ === obj ? clone.prototype : obj.__proto__;
    }

    function _objectCreate_es3(/** Object? */obj, /** {propertyDescriptor}= */descriptors){
        var newObj = clone(obj || Object.prototype);
        for(var key in descriptors){
            _define(newObj, key, descriptors[key]);
        }
        return newObj;
    }

    function _setCloneMethodByBench(/** number=33 */msec){
        var methods = [ _cloneByConstructor ];
        if(clone.byObjectCreate) methods.push(_cloneByCreate);
        if(clone.byProto)        methods.push(_cloneByProto);
        //methods.push(function objInstantiationByNewForIn(obj, state){return new obj.constructor(state)})

        var bestMethodIdx = 0, bestResult = 0;
        for(var i=0, sz=methods.length; i<sz; i++){
            var result = _benchmarkCloning(methods[i], msec||33);
            if( result > bestResult ){
                bestResult = result;
                bestMethodIdx = i;
            }
        }
        
        return _clone = methods[bestMethodIdx];
//        if(console) console.log("Choosing "+ _clone.name);
    }

    function _benchmarkCloning(cloneMethod, msec){

        var class$ = {a:"string 1", b:{object: 2}, c:3, constructor: function(state){
            for(var key in state) this[key] = this[key];
        }};
        class$.constructor.prototype = class$;

        for(var count=0, time=0, startTime = Date.now();
            time < msec;
            ++count %128 || (time = Date.now() - startTime)// check time every %N iterations
        ){
            var obj = cloneMethod(class$, {a:"string", b1:function(){}, c1:3});
        }
        if(console) console.log("Benchmarking "+ cloneMethod.name +": ", count, "/", time, "=", (count / time).toFixed() );
        return count / time;
    }
    /**#@- private */
        
    /**
     * @name _global_
     * @namespace
     *  Description of some native subtypes.
     *  Listed objects does not present in global (window) object, it's only descriptions.
     */
        /**
         * Object, that has at least one of the following property:
         * `value`, `get`, `set`, `writable`, `configurable`, `enumerable`.
         * @see <a href="http://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty">Object.defineProperty⠙</a>
         * @name propertyDescriptor
         * @define {({value:*}|{get:{function():*}}|{set:{function(*):void}}|{writable:boolean}|{configurable:boolean}|{enumerable:boolean})} */
        //{Object.< 'writable'|'configurable'|'enumerable', boolean= > | Object.<'get'|'set',function> | Object.<'value',?> }
        //{Object.< 'writable'|'configurable'|'enumerable', boolean= > | Object.<'get'|'set'|'configurable'|'enumerable', function|boolean= >}
        
        /**
         * Object literal, that may have properties:
         * [$inherits](clone.behavior$.html#$inherits), [$defaults](clone.behavior$.html#$defaults), [$inits](clone.behavior$.html#$inits).
         * All other properties should be functions (or constants).
         * @name behaviorDescriptor
         * @define {ObjLiteral} */
        
        /**
         * Function-constructor: function, that can be called by "new" operator and/or have modified prototype property.
         * For example: `Object`, `Array`, `RegExp`.
         * @name Class
         * @define {function(...):(object|undefined)} */
        
        /**
         * Simple key-value object, which proto is Object.prototype and all it properties is enumerable.
         * @name ObjLiteral
         * @define {object} */
    
    // // // // // // // // // // // // // // // // // // // // // // // // // //
    // setup (depends on JavaScript version):

    /** @name -options-
     * @namespace
     * @description
     * You can set options by defining global `clone` variable before clone.js load:
     * @example
     * (window || global).clone = {
     *     injectCloneBehaviorInto: Object.prototype,
     *     setCloneMethodByBench: false,
     *     makeES5compat: false,
     *     makeGlobal: true
     * };
     * @property {object} injectCloneBehaviorInto  You can make all objects behaves like a clone:
     *                                             `({thisWillBeHash: true}).$get()`
     * @property {boolean}  setCloneMethodByBench  Run quick (about 100ms) benchmark of clone methods
     *                                             (by `__proto__`, `Object.create`, `constructor`).
     * @property {boolean}          makeES5compat  Make some ECMA Script 5 shims, see {@link Object}.
     * @property {boolean=true}        makeGlobal  Make `clone` function global (for nodejs). True by
     *                                             default (if global clone options object defined). 
     */
    var setupOptions = typeof _globalClone === 'object' && _globalClone;
    //todo: fix bug on minify version
    var jScriptVersion = /*@cc_on @_jscript_version || @*/0;

    // underscored variables used in closure functions

    if(protoSupported)     clone.byProto        = _cloneByProto;
    if('create' in Object) clone.byObjectCreate = _cloneByCreate;
    /* always available: */clone.byConstructor  = _cloneByConstructor;

    var _clone    = clone.byProto || clone.byObjectCreate || clone.byConstructor;

    var _hasOwn   = Object.prototype.hasOwnProperty;
    var _getProto = 'getPrototypeOf' in Object ? Object.getPrototypeOf : _getPrototypeOf_es3;
    var _freeze   =         'freeze' in Object ? Object.freeze         : function doNothing(){};
    var _define   = 'defineProperty' in Object &&
        (jScriptVersion===0 ||jScriptVersion>8)? Object.defineProperty : _defineProperty_es3;

    // ECMAScript 5 compatibility shims:
    if(setupOptions && setupOptions.makeES5compat){
        if(typeof Object.defineProperty === 'undefined') /** @function */Object.defineProperty = _defineProperty_es3;
        if(typeof Object.getPrototypeOf === 'undefined') /** @function */Object.getPrototypeOf = _getPrototypeOf_es3;
        if(typeof Object.create         === 'undefined') /** @function */Object.create         = _objectCreate_es3;
    }
    
    /** This is the link to built-in [Object.create][] function.  
     *  Use this function if you need ES3 (IE 8-) compatable code.
     *  [Object.create]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Description
     *  @function
     *  @param {Object} proto
     *  @param {{propertyDescriptor}} descriptors */
    clone.create = Object.create || _objectCreate_es3;
    
    /** This is the link to built-in [Object.defineProperty][] function.
     *  Use this function if you need ES3 (IE 8-) compatable code.
     *  [Object.defineProperty]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description
     *  @function
     *  @param {!Object} obj
     *  @param {string} propertyName
     *  @param {propertyDescriptor} descriptor */
    clone.defineProperty = _define;

    /** This is the link to built-in [Object.getPrototypeOf][] function.
     * Use this function if you need ES3 (IE 8-) compatable code.
     *  [Object.getPrototypeOf]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf#Description
     *  @function
     *  @param {!Object} obj */
    clone.getPrototypeOf = _getProto;
            
    // // // // // // // // // // // // // // // // // // // // // // // // // // // //

    var _protoOfNewClones;
    if(setupOptions && setupOptions.injectCloneBehaviorInto){
        _protoOfNewClones = setupOptions.injectCloneBehaviorInto;
        clone.prototype = _protoOfNewClones;
        // var clone = {injectCloneBehaviorInto: Object.prototype};
    }else{
        _protoOfNewClones = clone.prototype;
    }
    clone.$ = clone.prototype;

    if( _define !== _defineProperty_es3) for(var name in clone$Descriptor){
        _define( _protoOfNewClones, name, {value: clone$Descriptor[name], writable:true, configurable:true} );
    }else{
        _protoOfNewClones = clone.$ = clone$Descriptor;
    }
    
    _protoOfNewClones.constructor.prototype = _protoOfNewClones;
    
    // if `clone.prototype` has enumerable property(ies), do not use it in `clone.new`
    for(var key in _protoOfNewClones){
        _protoOfNewClones = Object.prototype; break;
    }

    //clone.defineConstructorOf(_protoOfNewClones);

    clone.behavior$ = clone.extend(behavior$Descriptor);
    
    if(setupOptions && setupOptions.setCloneMethodByBench && _clone !== _cloneByConstructor){
        setTimeout(_setCloneMethodByBench, 0);
    }
    
    if( setupOptions
        && setupOptions.makeGlobal !== false
      //&& setupOptions.injectCloneBehaviorInto === Object.prototype 
    ){
        _globalClone = clone;
    }
    
    return clone;
}
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
// module
var _global = typeof(window)==='object' ? window : global;
var _globalClone = _global.clone;

// CommonJS modules (node.js)
if(typeof module === 'object' && 'exports' in module){
    module.exports = defineModule();

// AMD (require.js)
}else if(typeof define === 'function'){
    define(defineModule);
    
// Browser
}else{
    var clone = _global.clone = defineModule();
    /**
     * For browsers only. Replaces `window.clone` by previous value.
     * @returns {clone} function */
    clone.noConflict = function(){
        _global.clone = _globalClone;
        return clone;
    }
}
    
})();
