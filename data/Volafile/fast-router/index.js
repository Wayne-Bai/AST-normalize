"use strict";

/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Volafile.io 2014-07-15
**/

var urlp = require('url').parse;

function Elem(index){
    //Index of this elem in the tree. The root node has 0
    this.index = index;

    //Paths where this element is a text node
    this.text = {}; 

    //Next parent node (via 'text' path) that has withKey set. If this is
    //a child via .withKey, it skips the next parent and uses the parent after
    //that. Used for quickly walking the tree during search.
    this._parentKey =  null;

    //Path where this element is a key
    this.withKey = null; 
    
    //Path where this is a wildcard node
    this.wildcard = null; 

    //If this is an endpoint it has a value and a description of its keys
    this.value = null;
    this.keys = [];
    this.endpoint = false;
}

function Router(){
    this.root = new Elem(0);
}

//This inserts a route into the tree and updates the pre-computed
//node._parentKey of everything it comes across
Router.prototype.addRoute = function(route, value){
    var tokens = tokenizeRoute(route);
    var node = this.root;
    var keys = [];
    var parentKeyStack = [];
    for(var i=0; i<tokens.length; i++){
        var token = tokens[i];
        var type = token.type;
        if(type === 'text'){
            node.text[token.text] = node.text[token.text] || new Elem(i + 1);
            node = node.text[token.text];
        } else if(type === 'key'){
            node.withKey = node.withKey || new Elem(i + 1);
            node = node.withKey;
            parentKeyStack.pop();
            keys.push({name: token.name, index: i});
        } else if(type === 'wildcard'){
            node.wildcard = node.wildcard || new Elem(i + 1);
            node = node.wildcard;
        }
        node._parentKey = parentKeyStack[parentKeyStack.length-1];
        updateKeyInChildren(node);
        if(node.withKey){
            parentKeyStack.push(node.withKey);
        }
    }
    node.value = value;
    node.keys = keys;
    node.endpoint = true;
};

//This matches an URL against the tree and returns the match
Router.prototype.parse = function(_url){
    var url = urlp(_url, true);
    var parts = url.pathname.split('/');

    if(parts[0] === '') parts = parts.slice(1);

    var lastWildcard = null; //wildcard that matches 'best'
    
    var node = this.root; //current node in the tree
    
    var pNum = parts.length;

    while(node && node.index < pNum){
        //Save the last best wildcard match
        if(node.wildcard && (!lastWildcard || lastWildcard.index < node.wildcard.index)){
            lastWildcard = node.wildcard; 
        }

        //This part actually walks the node tree
        node = node.text[parts[node.index]] || node.withKey || node._parentKey;
    }

    if(node && !node.endpoint){
        //We didn't reach any endpoint
        node = null;
    }

    var wildcardExtra; //text captured by the wildcard
    var keys;
    var value;

    if(!node && lastWildcard){
        node = lastWildcard;        
        wildcardExtra = parts.slice(node.index - 1).join('/');
    }

    if(node){
        value = node.value;
        keys = extractKeys(node.keys, parts);
    }

    return {
        url: url,
        value: value,
        parts: parts,
        keys: keys,
        extra: wildcardExtra 
    };
};

module.exports.Router = Router;

//Split and tokenize the route 'url' to make it easier to work with it when
//inserting
function tokenizeRoute(route){
    var parts = route.split('/');
    var tokens = [];

    if(parts[0] === '') parts = parts.slice(1);

    for(var i=0; i < parts.length; i++){
        var part = parts[i];

        if(part === '*'){
            tokens.push({
                type: 'wildcard',
            });
            break;
        }

        if(part.charAt(0) === ':'){
            tokens.push({
                type: 'key',
                name: part.slice(1)
            });
            continue;
        }

        tokens.push({
            type: 'text',
            text: part
        });
    }
    return tokens;
}

//update the _parentKey property of all child nodes
function updateKeyInChildren(node){
    for(var text in node.text){
        var cnode = node.text[text];
        cnode._parentKey = node.withKey || node._parentKey;
        updateKeyInChildren(cnode);
    }
    if(node.withKey){
        node.withKey._parentKey = node._parentKey;
        updateKeyInChildren(node.withKey);
    }
}

//Extract all keys from the given parts of a splitted URL
function extractKeys(keys, parts){
    var kLength = keys.length;
    var result = {};
    for(var i=0; i<kLength; i++){
        var keyDef = keys[i];
        result[keyDef.name] = parts[keyDef.index];
    }
    return result;
}
