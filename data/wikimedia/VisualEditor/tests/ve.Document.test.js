/*!
 * VisualEditor Document tests.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.Document' );

/* Stubs */

ve.DocumentStub = function VeDocumentStub( documentNode ) {
	// Parent constructor
	ve.Document.call( this, documentNode );
};

OO.inheritClass( ve.DocumentStub, ve.Document );

/* Tests */

QUnit.test( 'getDocumentNode', 1, function ( assert ) {
	var node = new ve.NodeStub(),
		doc = new ve.DocumentStub( node );
	assert.strictEqual( doc.getDocumentNode( node ), node );
} );
