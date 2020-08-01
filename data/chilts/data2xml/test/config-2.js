// --------------------------------------------------------------------------------------------------------------------
//
// config-2.js - tests for node-data2xml
//
// Copyright (c) 2011 Andrew Chilton - http://chilts.org/
// Written by Andrew Chilton <andychilton@gmail.com>
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

var test = require('tape');
var data2xml = require('../data2xml');

var declaration = '<?xml version="1.0" encoding="utf-8"?>\n';

// --------------------------------------------------------------------------------------------------------------------

var tests = [
    {
        name : 'one element structure with an xmlns',
        element : 'topelement',
        data : {
            '_attr' : { xmlns : 'http://www.appsattic.com/xml/namespace' },
            second : 'value',
            'undefined' : undefined,
            'null' : null,
        },
        exp1 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined></undefined><null/></topelement>',
        exp2 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined/><null></null></topelement>'
    },
    {
        name : 'element with attributes and value undefined',
        element : 'topelement',
        data : {
            '_attr' : { xmlns : 'http://www.appsattic.com/xml/namespace' },
            second : 'value',
            'undefined' : {"_attr": {"key1": "something", "key2": "else"}, "_value": undefined},
            'null' : null,
        },
        exp1 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined key1="something" key2="else"></undefined><null/></topelement>',
        exp2 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined key1="something" key2="else"/><null></null></topelement>'
    },
    {
        name : 'element with attributes and value null',
        element : 'topelement',
        data : {
            '_attr' : { xmlns : 'http://www.appsattic.com/xml/namespace' },
            second : 'value',
            'undefined' : undefined,
            'null' : {"_attr":{"key1":"value", "key2": "value2"}, "_value": null},
        },
        exp1 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined></undefined><null key1="value" key2="value2"/></topelement>',
        exp2 : declaration + '<topelement xmlns="http://www.appsattic.com/xml/namespace"><second>value</second><undefined/><null key1="value" key2="value2"></null></topelement>'
    },
    {
        name : 'complex 4 element array with some attributes',
        element : 'topelement',
        data : { item : [
            { '_attr' : { type : 'a' }, '_value' : 'val1' },
            { '_attr' : { type : 'b' }, '_value' : 'val2' },
            'val3',
            { '_value' : 'val4' },
        ] },
        exp1 : declaration + '<topelement><item type="a">val1</item><item type="b">val2</item><item>val3</item><item>val4</item></topelement>',
        exp2 : declaration + '<topelement><item type="a">val1</item><item type="b">val2</item><item>val3</item><item>val4</item></topelement>'
    },
];

var convert1 = data2xml({ 'undefined' : 'empty', 'null' : 'closed' });
test('1) some simple xml with undefined or null values', function (t) {
    tests.forEach(function(test) {
        var xml = convert1(test.element, test.data, { attrProp : '@', valProp : '#' });
        t.equal(xml, test.exp1, test.name);
    });

    t.end();
});

var convert2 = data2xml({ 'undefined' : 'closed', 'null' : 'empty' });
test('2) some simple xml with undefined or null values', function (t) {
    tests.forEach(function(test) {
        var xml = convert2(test.element, test.data, { attrProp : '@', valProp : '#' });
        t.equal(xml, test.exp2, test.name);
    });

    t.end();
});

// --------------------------------------------------------------------------------------------------------------------
