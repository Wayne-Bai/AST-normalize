/*!
Copyright (C) 2012 Adobe Systems, Incorporated. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
 

/*
Real developers learn from source. Welcome!

Light JavaScript CSS Parser
Author: Razvan Caliman (rcaliman@adobe.com, twitter: @razvancaliman)    

This is a lightweight, naive and blind CSS Parser. It's meant to be used as a 
building-block for experiments with unsupported CSS rules and properties. 

This experimental parser is not intended to fully comply with any CSS Standard.
Use it responsibly and have fun! ;)
*/

!function(scope){  
    
    // pre-flight setup
    !function(){
        if (typeof String.prototype.trim !== "function"){
            
            // shameless augmentation of String with a trim function 
            String.prototype.trim = function(string){
                return string.replace(/^\s+/,"").replace(/\s+$/,"")
            }
        }
    }()
    
    function CSSRule(){ 
        this.selectorText = null
        this.style = {}
        this.type = "rule"
    }
    
    CSSRule.prototype = {    
        
         setSelector: function(string){ 
            this.selectorText = string
            
            // detect @-rules in the following format: @rule-name identifier{ }
            var ruleType = string.match(/^@([^\s]+)\s*([^{]+)?/)  

            if (ruleType && ruleType[1]){
                switch (ruleType[1]){
                    case "template":
                        this.type = "template"
                        this.cssRules = []
                    break

                    case "slot":
                        this.type = "slot"
                    break
                    
                    default:
                        this.type = "unknown"
                }
                
                // set the identifier of the rule
                this.identifier = ruleType[2] || "auto"
            }
        }, 

        setStyle: function(properties){ 
            
            if (!properties){
                throw new TypeError("CSSRule.setStyles(). Invalid input. Expected 'object', got " + properties)
            }

            this.style = properties || {}

            return this.style
        }, 

        setParentRule: function(rule){

            if (!rule){
                throw new TypeError("CSSRule.setParentRule(). Invalid input. Expected 'object', got " + properties)
            }

            this.parentRule = rule

            return this.parentRule
        }
    }

    /*
        Naive and blind CSS syntax parser.

        The constructor returns a CSSParser object with the following members:
            .parse(string) - method to parse a CSS String into an array of CSSRule objects  
            .clear() - method to remove any previously parsed data
            .cssRules - array with CSSRule objects extracted from the parser input string
    */
    function CSSParser(){ 
            
        /*   
            Extracts the selector-like part of a string.  
            
            Matches anything after the last semicolon ";". If no semicolon is found, the input string is returned. 
            This is an optimistic matching. No selector validation is perfomed.
            
            @param {String} string The string where to match a selector 
            
            @return {String} The selelector-like string
        */
        function getSelector(string){
            var sets = string.trim().split(";")    

            if (sets.length){
                return sets.pop().trim()
            }  

            return null;
        }
        
        /*
            Parse a string and return an object with CSS-looking property sets.   
            
            Matches all key/value pairs separated by ":", 
            themselves separated between eachother by semicolons ";" 
            
            This is an optimistic matching. No key/valye validation is perfomed other than 'undefined'.
            
            @param {String} string The CSS string where to match property pairs
            @return {Obect} The object with key/value pairs that look like CSS properties
        */
        function parseCSSProperties(string){
             var properties = {},
                 sets = string.trim().split(";")

             if (!sets || !sets.length){
                 return properties
             }                    

             sets.forEach(function(set){ 

                 // invalid key/valye pair
                 if (set.indexOf(":") == -1){ 
                     return
                 }         

                 var parts = set.split(":")

                 if (parts[0] !== undefined && parts[1] !== undefined) {
                     properties[parts[0].trim()] = parts[1].trim()
                 }
             }) 

             return properties    
         }            
         
         /*
            Parse a string and create CSSRule objects from constructs looking like CSS rules with valid grammar.  
            CSSRule objects are added to the 'cssRules' Array of the CSSParser object.
            
            This is an optimistic matching. Minor syntax validation is used.    
             
            Supports nested rules.             
            
            Example: 
            @template{
                
                @slot{
                
                }
            }     
            
         */
         function parseBlocks(string, set, parent){
             var start = string.indexOf("{"),
                properties, 
                rule = new CSSRule,
                token = string.substring(0, start),
                selector = getSelector(token),
                remainder = string.substr(start + 1, string.length),
                end = remainder.indexOf("}"),
                nextStart = remainder.indexOf("{")
              
             if (start > 0){
                     
                 rule.setSelector(selector)

                 if (parent){  
                     rule.setParentRule(parent)
                    
                    /*
                        If it's a nested structure (a parent exists) properties might be mixed in with nested rules.
                        Make sure the parent gets both its styles and nested rules   
                        
                        Example:
                        @template{
                        
                            background: green;
                            
                            @slot{
                                
                            } 
                        }
                    */  
                    properties = parseCSSProperties(token)

                    parent.setStyle(properties)
                 }

                  // nested blocks! the next "{" occurs before the next "}"
                 if (nextStart > -1 && nextStart < end){  
                     
                     // find where the block ends
                     end = getBalancingBracketIndex(remainder, 1)
                     
                     // extract the nested block cssText
                     var block = remainder.substring(0, end)
                     
                     properties = parseCSSProperties(token)    

                     rule.setStyle(properties)
                     rule.cssRules = rule.cssRules || []  
                     
                     // parse the rules of this block, and assign them to this block's rule object
                     parseBlocks(block, rule.cssRules, rule)
                     
                     // get unparsed remainder of the CSS string, without the block
                     remainder = remainder.substring(end + 1, remainder.length)
                 }
                 else{ 
                     properties = parseCSSProperties(remainder.substring(0, end)) 
                        
                     rule.setStyle(properties)
                     
                     // get the unparsed remainder of the CSS string
                     remainder = remainder.substring(end + 1, string.length)
                 }
                 
                 // continue parsing the remainder of the CSS string
                 parseBlocks(remainder, set)  
                                 
                 // prepend this CSSRule to the cssRules array
                 set.unshift(rule); 
             }
             
             function getBalancingBracketIndex(string, depth){
                var index = 0; 
                
                while(depth){      
                    switch (string.charAt(index)){
                        case "{": 
                         depth++
                        break

                        case "}":
                         depth--
                        break
                    }        

                    index++
                } 

                return (index - 1)
             }
             
         }
        
        function cascadeRules(rules){
            if (!rules){
                throw new Error("CSSParser.cascadeRules(). No css rules available for cascade")
            }         
            
            if (!rules.length){
                return rules
            }
            
            var cascaded = [], temp = {}, selectors = []
            
            rules.forEach(function(rule){ 
                
                if (rule.cssRules){
                    rule.cssRules = cascadeRules(rule.cssRules)
                }
                
                // isDuplicate
                if (!temp[rule.selectorText]){  

                    // store this selector in the order that was matched
                    // we'll use this to sort rules after the cascade
                    selectors.push(rule.selectorText)                        
                    
                    // create the reference for cascading into
                    temp[rule.selectorText] = rule
                } 
                else{
                    // cascade rules into the matching selector
                    temp[rule.selectorText] = extend({}, temp[rule.selectorText], rule)
                }
            }) 
           
            
            // expose cascaded rules in the order the parser got them
            selectors.forEach(function(selectorText){
                cascaded.push(temp[selectorText])
            }, this)                                        

            // cleanup
            temp = null
            selectors = null
            
            return cascaded
        }
        
        function extend(target){  
            var sources = Array.prototype.slice.call(arguments, 1) 
            sources.forEach(function(source){
                for (var key in source){
                    
                    // prevent an infinite loop trying to merge parent rules
                    // TODO: grow a brain and do this more elegantly
                    if (key === "parentRule"){
                        return
                    }  
                    
                    // is the property pointing to an object that's not falsy?
                    if (typeof target[key] === 'object' && target[key]){
                         
                         // dealing with an array?        
                         if (typeof target[key].slice === "function"){  
                             
                             target[key] = cascadeRules(target[key].concat(source[key])) 
                         }  
                         
                         // dealing with an object
                         else{        
                             target[key] = extend({}, target[key], source[key])
                         }
                    }
                    else{
                        target[key] = source[key]
                    }
                }
            })
            
            return target
        }                   
        
        return{     
            cssRules: [],
            
            parse: function(string){ 
                 // inline css text and remove comments
                string = string.replace(/[\n\t]+/g, "").replace(/\/\*[\s\S]*?\*\//g,'').trim()
                parseBlocks.call(this, string, this.cssRules)
            },   
            
            clear: function(){
                this.cssRules = [];
            },
            
            cascade: function(rules){   
                if (!rules || !rules.length){
                    // TODO: externalize this rule
                    this.cssRules = cascadeRules.call(this, this.cssRules)
                    return
                }
                
                return cascadeRules.call(this, rules)
            }, 
            
            doExtend: extend
        }
    }
    
    scope = scope || window
    scope["CSSParser"] = CSSParser 
       
}(window)
