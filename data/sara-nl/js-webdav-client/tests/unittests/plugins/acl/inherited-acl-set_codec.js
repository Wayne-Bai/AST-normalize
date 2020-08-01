/*
 * Copyright ©2014 SURFsara bv, The Netherlands
 *
 * This file is part of js-webdav-client.
 *
 * js-webdav-client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * js-webdav-client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with js-webdav-client.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

/**
 * Tests whether an XML piece representing a inherited-acl-set property is converted correctly to an object
 */
test( 'inherited-acl-set Codec; conversion from XML to object', function() {
  // Prepare test values
  var parentCollection = '/directory/';
  var parent2Collection = '/directory/subdirectory/';
  
  // Prepare an XML document with a createiondate to test
  var xmlDoc = document.implementation.createDocument( 'DAV:', 'inherited-acl-set', null );
  var parentHref = xmlDoc.createElementNS( 'DAV:', 'href' );
  parentHref.appendChild( xmlDoc.createCDATASection( parentCollection ) );
  xmlDoc.documentElement.appendChild( parentHref );
  var parent2Href = xmlDoc.createElementNS( 'DAV:', 'href' );
  parent2Href.appendChild( xmlDoc.createCDATASection( parent2Collection ) );
  xmlDoc.documentElement.appendChild( parent2Href );
  
  // Test conversion with the codec set
  var producedData = nl.sara.webdav.codec.Inherited_acl_setCodec.fromXML( xmlDoc.documentElement.childNodes );
  deepEqual( producedData, [ parentCollection, parent2Collection ], 'Returned value should represent the correct parent collections' );
} );

/**
 * Tests whether a inherited-acl-set is converted correctly to XML
 */
test( 'inherited-acl-set Codec; conversion from object to XML', function() {
  // Prepare test values
  var parentCollection = '/directory/';
  var parent2Collection = '/directory/subdirectory/';
  var collections = [ parentCollection, parent2Collection ];
  
  // Let's call the method we actually want to test
  var xmlDoc = nl.sara.webdav.codec.Inherited_acl_setCodec.toXML( collections, document.implementation.createDocument( 'DAV:', 'inherited-acl-set', null ) );
  
  // Assertions whether the formed XML is correct
  var collectionsNodes = xmlDoc.documentElement.childNodes;
  deepEqual( collectionsNodes.length                    , 2                , 'There should be 2 child nodes defined (one for each collection)' );
  deepEqual( collectionsNodes[0].nodeName               , 'href'           , 'The first child node should be a href node' );
  deepEqual( collectionsNodes[0].namespaceURI           , 'DAV:'           , 'The first child node should be in the DAV: namespace' );
  deepEqual( collectionsNodes[0].childNodes[0].nodeValue, parentCollection , 'The first collection should be the first parent collection' );
  deepEqual( collectionsNodes[1].nodeName               , 'href'           , 'The second child node should be a href node' );
  deepEqual( collectionsNodes[1].namespaceURI           , 'DAV:'           , 'The second child node should be in the DAV: namespace' );
  deepEqual( collectionsNodes[1].childNodes[0].nodeValue, parent2Collection, 'The second collection should be the second parent collection' );
} );

// End of file