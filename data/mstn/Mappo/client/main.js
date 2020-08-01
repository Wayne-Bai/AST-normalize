// on document ready	
Meteor.startup(function() {

     // create the structure of Mappo app
	var app = Cat.intc( 
		          { name:'map-viewer' },
		          Cat.dot(
			         { name:'map-providers' },
			         Cat.trace(
			             Cat.dot(
				           Cat.dot(
					         { name:'draw' },
					         { name:'search' }
					       ),
					       Cat.dot(
					       	 { name:'mongo-collection',
					           collection:'features',
					           icons: function( node ){
								  if ( node.tourism === 'alpine_hut'){
									return 'hut.png';
								  } else if ( node.amenity === 'shelter'){
									return 'cabin-2.png';
								  } else if ( node.natural === 'peak' ){
									return 'mountains.png';
								  } else if ( node.mountain_pass === 'yes'){
									return 'mountain-pass.png';
							      } else if ( node.amenity === 'drinking_water'){
									return 'drinkingwater.png';
								  } else if ( node.tourism === 'viewpoint'){
									return 'beautifulview.png';
								  } else {
									return 'unknown.png';
								  }
							    }
					         },
					         { name:'info-control' }
					        )
					     ),
					     ['create', 'show', 'hide']
				     )
			      )
			   );
     // start the app and render it in body element
     Cat.start( app ).render($('body'));

});
