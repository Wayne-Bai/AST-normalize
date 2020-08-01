/*
 * This class is used to manager NS
 *
 */
blitz.extendNS=function(destination, source) {  
    var toString = Object.prototype.toString,  
        objTest = toString.call({});  
    for (var property in source) {  
        if (source[property] && objTest == toString.call(source[property])) {  
            destination[property] = destination[property] || {};  
            blitz.extendNS(destination[property], source[property]);  
        } else {  
            destination[property] = source[property];  
        }  
    }  
    return destination;  
}