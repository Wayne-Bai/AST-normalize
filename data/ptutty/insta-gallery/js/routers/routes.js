
// JavaScript Document/* routers */
App.Routers.Routes = Backbone.Router.extend({
		routes: {
			'': 'home',
			':id' : 'auth',
			'/mediadetail/:id': 'mediadetail',
			'/user/:id': 'userdetail',
			'/myphotos/' : 'myphotos',
			'/popular/' : 'popular',
			'/feed/' : 'feed',
			'/tagsearch/:id': 'tagsearch',
			'/usersearch/:id': 'usersearch',
			'/locationsearch/:id': 'locationsearch'	,
			'/myliked/': 'liked'			
		},
		
		home: function() {
			if (App.insta.render()) { // returns true if user is logged in.
				App.router.navigate("/feed/", {trigger: true});
			} else {
				App.Main.display("media/popular");
				App.router.navigate("/popular/", {trigger: false});	
			}
			
		},
		
		auth: function(id) {
			console.log("auth route" + id);
			var access_token = App.Helpers.getaccessToken(id);
			App.Helpers.createCookie('access_token',access_token,14);
			App.insta.cookiecheck();
			if (App.insta.render()){
				App.Main.display("users/self/feed");
				App.router.navigate("/feed/", {trigger: false});	
			}
		},
		
		mediadetail: function(id) {
			App.insta.render();
			App.Main.display("media" , id);
		},
		
		userdetail: function(id) {
			if (App.insta.render()){
				App.Main.display("users",null,id);
			}
			
		},
		
		myphotos: function(){
			if (App.insta.render()){
				App.Main.display("users/self/media/recent/");
			}
		},
		
		popular: function(){
			if (App.insta.render()){
				App.Main.display("media/popular");
			}
		},
		
		feed: function() {
			if (App.insta.render()) {  // returns true if user is logged in.
				App.Main.display("users/self/feed");
			}
		},
		
		tagsearch: function(id) {
			if (App.insta.render()) {  // returns true if user is logged in.
				App.Main.display("tags", null, null, id);
			}
		},
		
		usersearch: function(id){
				if (App.insta.render()) {  // returns true if user is logged in.
					App.Main.display("users/search" , null, null, id);
				}
		},
		
		liked: function(){
			if (App.insta.render()){;
				App.Main.display("users/self/media/liked");
			}
			
		}
	})

App.router = new App.Routers.Routes();