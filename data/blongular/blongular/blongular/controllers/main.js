/**
 * Blongular's Main Controller
 */

// Exports
module.exports = {

	/**
	 * Class dependencies
	 */
	extend: ['Controller'],

	/**
	 * NPM Dependencies
	 */
	dependencies: ['mongoose','crypto'],

	/**
	 * PRIVATE
	 */
	private: {},

	/**
	 * Public Variables
	 */
	public: {},

	/**
	 * Methods
	 */
	methods: {

		/**
		 * Action: Index
		 */
		actionIndex: function (req,resp,query,models) {

			this.title='Home';

			var post = models.Post();
			var maxPosts = blongular.list.maxPerPage;

			var page = Number(query.GET.page || 1) - 1;
			if (page<0)
				page = 0;

			post.$list(page * maxPosts, maxPosts, -1,!req.user._logged)
			.then(function (posts) {
				page++;
				self.render('list', { posts: posts, pageNext: posts.length>=maxPosts ? page + 1 : undefined, pageBack: page - 1 >= 1 ? page - 1 : undefined });
			}).catch(function (err) {
				self.e.exception(err);
				self.render('list', { error: err.message });
			});

		},

		/**
		 * Action: Post
		 */
		actionPost: function (req,resp,query,models) {
			var Post = models.Post();
			var User = models.User();
			var id = self.view.postId = query.GET.id;

			if (_.isUndefined(id))
				req.e.error(404);
			else
				Post.$load(id)
				.then(function () {
					var post = Post.getAttributes();

					if (_.isUndefined(post.id) || (_.isUndefined(post.publishDate) && !req.user._logged))
						req.e.error(404);
					else
					{
						User.$getUser({ _id: Post.getAttribute('user') }, { displayName: 1, username: 1, bio:1, _id:1, gravatarEmail:1 })
						.then(function (user) {
							self.title = Post.getAttribute('title');
							var name = user.name || user.username || user.email || user._id;
							user.showName = name;
							Post.setAttribute('user', user);

							var formatPost = Post.formatPost(Post.getAttributes());
							var encodedJSON = JSON.stringify(formatPost,function (key,val) {
								if (_.isString(val))
									return encodeURIComponent(val);
								else
									return val;
							});
							self.clientScript.push("var blongularPost = "+encodedJSON+";");
							self.render('read', { posts: formatPost });
						});
					}
				}).catch(function (err) {
					console.error(err);
					req.e.error(404);
				});
		},

		/**
		 * Action: Login
		 */
		actionLogin: function (req,resp,query,models) {

			var User = models.User();
			var UserPost = query.POST.fields;

			if (UserPost)
			{
				User.setAttributes(UserPost);

				User.$login(UserPost.password)
				.then(function (logged) {
					var data = User.getAttributes(true);
					if (logged)
					{
						req.user.data={};
						_.extend(req.user.data,data);
						req.user.data.id=data._id;
						req.user.data.name=data.name||data.email;
						req.user._logged=true;

						req.user.data.alert = ['success','Welcome back, <b>'+(data.displayName||data.username||data.email)+'</b>.'];
						resp.redirect(UserPost.redirect || '/',true);
					}
					else
					{
						req.user.data.alert = ['danger','Sorry, failed to log in.'];
						resp.redirect(UserPost.redirect || '/',true);
					}
				}).catch(function (err) {
					req.user.data.alert = ['danger','Sorry, failed to log in.'];
					resp.redirect(UserPost.redirect || '/',true);
				});
			}
			else
			{
				req.user.data.alert = ['danger','Sorry, failed to log in.'];
				resp.redirect(UserPost.redirect || '/',true);
			}

		},

		/**
		 * Action: New
		 */
		actionNew: function (req,resp,query,models) {

			if (!req.user._logged)
				return resp.redirect('/', true);

			var post = models.Post();
			var oid = mongoose.Types.ObjectId();

			post.setAttributes({
				_id: oid,
				title: '',
				content: '',
				source: '',
				user: req.user.data._id,
				slug: oid.toString()
			});

			post.$save()
			.then(function () {
				resp.redirect('/post/'+post.getAttribute('_id')+'#edit', true);
			})
			.catch(function (err) {
				console.log(err);
				resp.redirect('/', true)
			})
		},

		/**
		 * Action: Upload Image 
		 */
		actionUpload: function (req,resp,query,models) {
			if (!req.user._logged)
				resp.end('');
			else {

				var file = query.POST.files.file;

				if (_.isArray(file))
					file = file[0]

				if (file)
				{
					if (blongular.upload.validTypes.indexOf(file.type)!==-1
						&& file.size <= blongular.upload.maxSize)
					{
						var uploadDir = self.app.modulePath+'/'+blongular.upload.directory;
						var userDir = uploadDir + '/' + req.user.data._id;
						if (!fs.existsSync(userDir))
						{
							try { fs.mkdirSync(userDir); fs.chmodSync(userDir, '0777'); } catch (e) {
								console.log(e);
							}
						}

						var ext = file.name.split('.').pop();
						var fileName = crypto.createHash('md5').update(file.name + file.size).digest("hex");
						var uploadPath = userDir + '/' + fileName + '.' + ext;

						var source = fs.createReadStream(file.path);
						var dest = fs.createWriteStream(uploadPath);

						source.pipe(dest);
						source.on('end', function() {
							resp.end('/'+req.user.data._id+'/'+fileName+'.'+ext);
						});
						source.on('error', function(err) {
							resp.end('');
						});
					}
					else
						resp.end('');
				} else
					resp.end('');

			}
		},

		/**
		 * Action: Delete
		 */
		actionDelete: function (req,resp,query,models) {

			if (!req.user._logged)
				return resp.redirect('/', true);

			var post = models.Post();
			var _id = query.GET.id;

			if (!_.isString(_id))
				return resp.redirect('/', true);

			post.$load(_id)
			.then(function () {
				if (post.getAttribute('user')+'' == req.user.data._id+'')
					return post.$remove();
				else 
					resp.redirect('/post/'+_id, true);
			})
			.then(function () {
				resp.redirect('/', true);
			})
			.catch(function () {
				resp.redirect('/post/'+_id, true)
			})
		},

		/**
		 * Action: Change profile
		 */
		actionProfile: function (req,resp,query,models) {

			var redirect = '/';
			var userProfile = query.POST.fields.User;
			var User;

			if (!_.isUndefined(query.POST.fields.redirect))
				redirect = query.POST.fields.redirect;

			if (!req.user._logged || !userProfile)
				return resp.redirect(redirect,true);

			if (userProfile.password === '')
				delete userProfile.password;

			User = models.User();
			User.$getUser({ _id: req.user.data._id })
			.then(function (data) {
				User.setAttributes(data);
				return User.$update(userProfile)
			})
			.then(function (updated) {
				req.user.data.alert = ['success','Profile updated.'];
				User.setAttributes(updated._doc);

				if (_.isString(userProfile.password) && userProfile.password.length>0)
					req.user._logged = false;

				User.$getGravatar()
				.then(function () {
					_.extend(req.user.data,User.getAttributes());
					resp.redirect(redirect,true);
				})
			})
			.catch(function (err) {
				console.log(err);
				req.user.data.alert = ['danger','Failed to edit your profile.'];
				resp.redirect(redirect,true);
			})

		},

		/**
		 * Action: Logout
		 */
		actionLogout: function (req,resp,query,models) {
			req.user._logged=false;
			var redirect = '/';

			if (_.isString(query.GET.r))
				redirect = query.GET.r;

			resp.redirect(redirect,true);
		},

		/**
		 * Action: Error
		 */
		actionError: function () {
			if (this.request.code == 404)
			{
				this.title='Not found';
				this.render('notfound');
			}
			else
			{
				this.title='ERROR';
				this.render('error');
			}
		}

	}

};
