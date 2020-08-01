
var fs			= require( 'fs' ),
	path		= require( 'path'),
	App			= Core.app,
	Headers		= Core.headers,
	indexFile 	= "ui/index.ejs",
	viewRoot	= Core.config.globals.viewRoot;

if( fs.existsSync( viewRoot ) )
	var ejs	= require( 'ejs' );

// Class View
//--------------
function View( location, name ){
	this.html = {
		body 	: []
	};

	this.route 			= location.replace( viewRoot, "" );
	this.location		= location;
	this.name 			= name;
	this.layout 		= Core.config.globals.layout;
	this.indexFile 		= indexFile;
	this.mainFile 		= 'main.js';


	this.headers 	= new Headers( location );
	this.html 		= Core.utils.extend( this.html, this.headers );

	this.buildBody();
	this.buildRoute();

}

// Static member
View.indexFile = indexFile;

// Methods
View.prototype.toString = function( type ) {
	return this.html[ type ].join('\n');
};

View.prototype.append = function( type, more ) {
	this.html[ type ].push( more );
};

View.prototype.buildBody = function( options ){
	var renderFile 	= ejs.compile( fs.readFileSync( path.join( viewRoot, this.route, this.indexFile ), 'utf8' ) ),
		main 		= require( path.join( viewRoot, this.route, this.mainFile ) );

	if( main )
		options = Core.utils.extend( options || {}, main );

	this.append( "body", renderFile( options ) );
};

View.prototype.buildRoute = function(){
	var view = this;

	App.get( view.route, Core.auth.ensureAuthenticated, function( req, res ){
		view.routeCallback( req, res );
	});
};

View.prototype.routeCallback = function( req, res ){

	res.render( this.layout , {
		scripts : this.toString( "js" ),
		styles 	: this.toString( "css" ),
		body 	: this.toString( "body" )
	});
};

module.exports = View;