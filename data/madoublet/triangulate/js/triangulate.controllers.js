angular.module('triangulate.controllers', [])

// login controller
.controller('LoginCtrl', function($scope, $window, $state, $stateParams, $rootScope, $i18next, Setup, User, Site, Editor) {
	
	$rootScope.template = 'login';
	
	// setup
	$scope.setup = Setup;
	
	// get friendlyId
	$scope.friendlyId = $stateParams.id;
	$window.sessionStorage.loginId = $stateParams.id;
	
	// login
	$scope.login = function(user){
	
		message.showMessage('progress');
		
		// login user
		User.login(user.email, user.password, $scope.friendlyId,
			function(data){		// success
			
				// make sure the user has admin permissions
				if(data.user.CanEdit != '' || data.user.CanPublish != ''  || data.user.CanRemove != ''  || data.user.CanCreate != ''){
				
					// save token
					$window.sessionStorage.token = data.token;
					
					// set language to the users language
					$i18next.options.lng =  data.user.Language;
					moment.lang(data.user.Language);
					
					// set user in $rootScope, session
					$rootScope.user = data.user;
					$window.sessionStorage.user = JSON.stringify(data.user);
					
					// set start
					$state.go(data.start);
					
					// retrieve site
					Site.retrieve(function(data){
					
						message.showMessage('success');
					
						// set site in $rootScope, session
						$rootScope.site = data;
						$window.sessionStorage.site = JSON.stringify(data);
							
					});
					
					// pre-cache editor 
					Editor.list(function(data){
	
						// debugging
						if(Setup.debug)console.log('[triangulate.debug] Editor.list');
						if(Setup.debug)console.log(data);
						
						for (index = 0; index < data.length; ++index) {
							data[index].title = i18n.t(data[index].title);
						}
						$rootScope.editorItems = data;
						$window.sessionStorage.editorItems = JSON.stringify(data);
						
					});
					
					
				}
				else{
					console.log('[triangulate.error] user does not have admin privileges');
					message.showMessage('error');
				}
				
			},
			function(){		// failure
				message.showMessage('error');
			});
		
	};
	
})

// forgot controller
.controller('ForgotCtrl', function($scope, $window, $stateParams, $rootScope, $i18next, Setup, User, Site, Editor) {
	
	$rootScope.template = 'login';
	
	// setup
	$scope.setup = Setup;
	
	// get friendlyId
	$scope.friendlyId = $stateParams.id;
	$window.sessionStorage.loginId = $stateParams.id;
	
	// forgot
	$scope.forgot = function(user){
	
		message.showMessage('progress');
		
		// login user
		User.forgot(user.email, $scope.friendlyId,
			function(data){		// success
				message.showMessage('success');
				$scope.user.email = '';	
			},
			function(){		// failure
				message.showMessage('error');
			});
		
	};
	
})

// reset controller
.controller('ResetCtrl', function($scope, $window, $stateParams, $rootScope, $i18next, Setup, User, Site, Editor) {
	
	$rootScope.template = 'login';
	
	// setup
	$scope.setup = Setup;
	
	// get friendlyId
	$scope.friendlyId = $stateParams.id;
	$scope.token = $stateParams.token;
	$window.sessionStorage.loginId = $stateParams.id;
	
	// reset
	$scope.reset = function(user){
	
		message.showMessage('progress');
		
		// login user
		User.reset($scope.token, user.password, $scope.friendlyId,
			function(data){		// success
				message.showMessage('success');
				$scope.user.password = '';		
			},
			function(){		// failure
				message.showMessage('error');
			});
		
	};
	
})

// signup controller
.controller('SignupCtrl', function($scope, $window, $stateParams, $state, $rootScope, $i18next, Setup, Site) {
	
	$rootScope.template = 'signup';
	
	// setup
	$scope.setup = Setup;
	
	// temporary model
	$scope.temp = {
		'email': '',
		'plan': 'triangulate-starter',
		'payWith': 'stripe',
		'domain': ''
	}
	
	$scope.error = '';
	
	// set publishable key
	Stripe.setPublishableKey($scope.setup.stripePubKey);

	function stripeResponseHandler(status, response){
      
        var form = $('#subscribe-form');
        
        if (response.error) { // errors
            message.showMessage('error');
           
			$scope.$apply(function(){
				$scope.error = response.error.message;
			});
            
        } 
        else {
        
        	var token = response.id;
        	
        	// subscribe a site with Stripe
			Site.subscribeWithStripe(token, $scope.temp.plan, $scope.temp.domain,
				function(data){		// success
				
					// update the site
					Site.retrieve(function(data){
					
						message.showMessage('success');
					
						// set site in $rootScope, session
						$rootScope.site = data;
						$window.sessionStorage.site = JSON.stringify(data);
						
						// go to start URL
						$state.go('app.thankyou');
							
					});
					
					
				},
				function(){		// failure
					message.showMessage('error');
				});
           
        }
        
    }

	// pay with Stripe
	$scope.payWithStripe = function(){
		$scope.stripeError = '';
	
		var form = $('#subscribe-form');
        
        message.showMessage('progress');
        
        Stripe.createToken(form, stripeResponseHandler);
	}
	
})

// Thankyou controller
.controller('ThankyouCtrl', function($scope, $window, $stateParams, $rootScope, $i18next, Setup) {
	
	$rootScope.template = 'thankyou';
	
	// setup
	$scope.setup = Setup;
})


// acccount controller
.controller('AccountCtrl', function($scope, $window, $stateParams, $rootScope, $i18next, Setup, Site) {
	
	$rootScope.template = 'signup';
	
	// setup
	$scope.setup = Setup;
	
	// site
	$scope.site = $rootScope.site;
	
})

// admin controller
.controller('AdminCtrl', function($scope, $window, $stateParams, $rootScope, $i18next, Setup, Site) {
	
	$rootScope.template = 'admin';
	
	// setup
	$scope.setup = Setup;
	
	// site
	$scope.site = $rootScope.site;
	
	// list sites
	Site.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Site.listAll');
		console.log(data);
		
		$scope.sites = data;
	});
	
	// shows the site dialog for editing
	$scope.showEditSite = function(site){
	
		// set temporary model
		$scope.temp = site;
		
		$('#siteDialog').modal('show');
	}
	
	// edits the site
	$scope.updateSite = function(site){
	
		message.showMessage('progress');
	
		Site.editAdmin(site, function(){
			message.showMessage('success');
		});
	
		$('#siteDialog').modal('hide');
	}
	
	// shows the remove site dialog
	$scope.showRemoveSite = function(site){
	
		// set temporary model
		$scope.temp = site;
	
		$('#removeSiteDialog').modal('show');
	}
	
	// removes the site
	$scope.removeSite = function(site){
	
		message.showMessage('progress');
	
		Site.remove(site, function(){
			message.showMessage('success');
			$('#removeSiteDialog').modal('hide');
		}, function(){
			message.showMessage('error');
			$('#removeSiteDialog').modal('hide');
		});
	
		
	}
	
})

// create controller
.controller('CreateCtrl', function($scope, $rootScope, Setup, Theme, Language, Site) {
	
	$rootScope.template = 'login';
	
	// setup
	$scope.setup = Setup;
	$scope.step = 1;
	
	// setup carousel
	$('#select-theme').carousel({
		interval: false,
		wrap: true
	});
	
	// determine timezone
	var tz = jstz.determine();
    $scope.name = '';
    $scope.friendlyId = '';
    $scope.email = '';
    $scope.password = '';
    $scope.timeZone = tz.name();
    $scope.siteLanguage = Setup.language;
    $scope.userLanguage = Setup.language;
    $scope.themeId = Setup.themeId;
    $scope.passcode = '';
    
    $(document).on('click', '#toggle-advanced', function(){
		$('.advanced').show();
	});
	
	// set step
	$scope.setStep = function(step){
		$scope.step = step;
	}
	
	// set next
	$scope.next = function(){
		$('#select-theme').carousel('next');
		$scope.step = 2;
	}
	
	$scope.previous = function(){
		$('#select-theme').carousel('prev');
		$scope.step = 2;
	}
    
    // sets a theme
    $scope.setThemeId = function(id){
    	$scope.themeId = id;
    }
    
    // get themes
	Theme.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Theme.list');
		console.log(data);
		
		$scope.themes = data;
	});
    
    // get languages
	Language.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Language.list');
		console.log(data);
		
		$scope.languages = data;
	});
	
	// create a site
	$scope.create = function(){
		
		var id = $('#select-theme .active').attr('data-id');
		
		$scope.themeId = id;
		
		message.showMessage('progress');
		
		Site.create($scope.friendlyId, $scope.name, $scope.email, $scope.password, $scope.passcode, $scope.timeZone, 
			$scope.siteLanguage, $scope.userLanguage, $scope.themeId, 
			function(){  // success
				message.showMessage('success');
				
				$scope.siteLink = utilities.replaceAll(Setup.site, '{{friendlyId}}', $scope.friendlyId);
				
				$('#create-form').addClass('hidden');
				$('#create-confirmation').removeClass('hidden');
			},
			function(){  // failure
				message.showMessage('error');
			});
	}
	
})

// menu controller
.controller('MenuCtrl', function($scope, $rootScope, $state, Setup, Site, User) {

	// get user from session
	$scope.user = $rootScope.user;
	$scope.site = $rootScope.site;
	$scope.sites = Setup.sites;
	
	// publishes a site
	$scope.republish = function(){
		
		message.showMessage('progress');
		
		Site.publish(
			function(){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
		
	}
	
	// deploys the site
	$scope.deploy = function(){
		
		message.showMessage('progress');
		
		Site.deploy(
			function(){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
		
	}
	
})

// pages controller
.controller('PagesCtrl', function($scope, $rootScope, $i18next, Setup, PageType, Page, Stylesheet, Layout, User, Translation) {

	// retrieve user
	$scope.user = $rootScope.user;
	$rootScope.template = 'pages';
	$scope.canEditTypes = false;
	$scope.canRemovePage = false;
	
	// setup
	$scope.predicate = 'LastModifiedDate';
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.pageTypeId = -1;
	
	$scope.current = null;
	$scope.temp = null;
	
	// sets the predicate
	$scope.setPredicate = function(predicate){
		$scope.predicate = predicate;
	}
	
	if($scope.user.Role == 'Admin'){
		$scope.canEditTypes = true;
	}
	
	// sets the pageTypeId
	$scope.setPageType = function(pageType){
		$scope.current = pageType;
		$scope.pageTypeId = pageType.PageTypeId;
		$rootScope.currentPageType = pageType;
		
		// set canremove for pagetype
		if($scope.user.CanRemove == 'All' || $scope.user.CanRemove.indexOf($scope.pageTypeId) != -1){
			$scope.canRemovePage = true;
		}
		
	}
	
	// shows the page type dialog for editing
	$scope.showEditPageType = function(){
	
		// set temporary model
		$scope.temp = $scope.current;
	
		$('#pageTypeDialog').modal('show');
    	
    	$('#pageTypeDialog').find('.edit').show();
		$('#pageTypeDialog').find('.add').hide();
	}
	
	// edits the page type
	$scope.editPageType = function(pageType){
	
		PageType.edit(pageType);
	
		$('#pageTypeDialog').modal('hide');
	}
	
	// shows the page type dialog for adding
	$scope.showAddPageType = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#pageTypeDialog').modal('show');
    	
    	$('#pageTypeDialog').find('.add').show();
		$('#pageTypeDialog').find('.edit').hide();
	}
	
	// adds the page type
	$scope.addPageType = function(pageType){
	
		PageType.add(pageType);
	
		$('#pageTypeDialog').modal('hide');
	}
	
	// shows the remove page type dialog
	$scope.showRemovePageType = function(pageType){
	
		// set temporary model
		$scope.temp = pageType;
	
		$('#removePageTypeDialog').modal('show');
	}
	
	// removes the page type
	$scope.removePageType = function(pageType){
	
		PageType.remove(pageType);
	
		$('#removePageTypeDialog').modal('hide');
	}
	
	// shows the edit tags dialog
	$scope.showEditTags = function(page){
	
		// set temporary model
		$scope.temp = page;
	
		$('#editTagsDialog').modal('show');
	}
	
	// edit tags
	$scope.editTags = function(page){
	
		message.showMessage('progress');
	
		Page.editTags(page,
			function(){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
	
		$('#editTagsDialog').modal('hide');
	}

	// shows the add page dialog
	$scope.showAddPage = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#pageDialog').modal('show');
	}
	
	// adds a page
	$scope.addPage = function(page){
	
		message.showMessage('progress');
	
		Page.add($scope.pageTypeId, page,
			function(data){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
	
		$('#pageDialog').modal('hide');
	}
	
	// shows the remove page dialog
	$scope.showRemovePage = function(page){
	
		// set temporary model
		$scope.temp = page;
	
		$('#removePageDialog').modal('show');
	}

	// removes a page
	$scope.removePage = function(page){
	
		message.showMessage('progress');
	
		// remove translation for page
		Translation.retrieveDefault(function(){
		
			// clear translations for the page
			Translation.clear(page.PageId);
			
			// save translation
			Translation.save(function(){
				
			});
			
		});
	
		// remove page
		Page.remove(page,
			function(data){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
	
		$('#removePageDialog').modal('hide');
	}
	
	// toggles the state of a page
	$scope.togglePublished = function(page){
	
		message.showMessage('progress');
	
		Page.togglePublished(page,
			function(data){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
	
		$('#removePageDialog').modal('hide');
	}
	
	// publishes a page
	$scope.togglePublished = function(page){
	
		message.showMessage('progress');
	
		Page.togglePublished(page,
			function(data){  // success
				message.showMessage('success');
			},
			function(){  // failure
				message.showMessage('error');
			});
	
		$('#pageDialog').modal('hide');
	}
	
	// list allowed page types
	PageType.listAllowed(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] PageType.listAllowed');
		console.log(data);
		
		$scope.pageTypes = data;
		
		// set current page type to the last one
		if($rootScope.currentPageType != null){
			$scope.setPageType($rootScope.currentPageType);
		}
		else if($scope.pageTypes.length > 0){
			$scope.setPageType($scope.pageTypes[0]);
		}
		
	});
	
	// list pages
	Page.listAllowed(function(data){
		
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Page.listAllowed');
		if(Setup.debug)console.log(data);
		
		$scope.pages = data;
		$scope.loading = false;
	});
	
	// list stylesheets
	Stylesheet.list(function(data){
		
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Stylesheet.list');
		if(Setup.debug)console.log(data);
		
		$scope.stylesheets = data;
	});
	
	// list layouts
	Layout.list(function(data){
		
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Layout.list');
		if(Setup.debug)console.log(data);
		
		$scope.layouts = data;
	});
	
})

// content controller
.controller('ContentCtrl', function($scope, $rootScope, $stateParams, $sce, Setup, Site, Page, Version, PageType, Image, Icon, Theme, Layout, Stylesheet, Editor, Translation, File, Product) {
	
	$rootScope.template = 'content';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.content = '';
	$scope.sites = Setup.sites;
	$scope.node = {};
	$scope.element = {};
	$scope.block = {};
	$scope.container = {};
	$scope.column1 = {};
	$scope.column2 = {};
	$scope.column3 = {};
	$scope.column4 = {};
	$scope.numColumns = 1;
	$scope.totalSize = 0;
	$scope.fileLimit = $rootScope.site.FileLimit;
	
	// watch for changes in the block collection
    $scope.$watchCollection('block', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			if(index.toLowerCase() == 'id'){
		  			$(triangulate.editor.currBlock).prop('id', attr);
	  			}
	  		
	  			$(triangulate.editor.currBlock).attr('data-' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
    
    // watch for changes in the container collection
    $scope.$watchCollection('container', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			$(triangulate.editor.currBlock).attr('data-container' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
    
    // watch for changes to the column
    $scope.$watchCollection('column1', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			$(triangulate.editor.currBlock).find('.col:nth-child(1)').attr('data-' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
    
    // watch for changes to the column
    $scope.$watchCollection('column2', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			$(triangulate.editor.currBlock).find('.col:nth-child(2)').attr('data-' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
    
    // watch for changes to the column
    $scope.$watchCollection('column3', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			$(triangulate.editor.currBlock).find('.col:nth-child(3)').attr('data-' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
    
    // watch for changes to the column
    $scope.$watchCollection('column4', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
	  			$(triangulate.editor.currBlock).find('.col:nth-child(4)').attr('data-' + index.toLowerCase(), attr);
		  		
	  		}
	  		
  		});
    	
    });
	
	// watch for changes in the node collection
    $scope.$watchCollection('node', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
		  		// set new values
		  		if(index != 'sortableItem'){
		  		
		  			console.log('$watch, set index=' + index +' to attr=' + attr);
		  		
		  			// set cortriangulateing data attribute
		  			$(triangulate.editor.currNode).attr('data-' + index, attr);
		  			
		  			// set config-text convenience method
		  			$(triangulate.editor.currNode).find('[node-text="' + index + '"]').text(attr);
		  			
		  			// create eventName
		  			var eventName = triangulate.editor.currConfig.attr('data-action') + '.node.' + index + '.change';
		  			
		  			// trigger change
		  			$(triangulate.editor.el).trigger(eventName, {index: index, attr: attr});
		  		}
	  		}
	  		
  		});
    	
    });
    
    // watch for changes in the node collection
    $scope.$watchCollection('element', function(newValues, oldValues){
    	
    	$.each(newValues, function(index, attr){	
	  		
	  		// check for changes
	  		if(newValues[index] != oldValues[index]){
	  		
		  		// set new values
		  		if(index != 'sortableItem'){
		  		
		  			console.log('$watch, set index=' + index +' to attr=' + attr);
		  		
		  			// set cortriangulateing data attribute
		  			$(triangulate.editor.currElement).attr('data-' + index, attr);
		  			
		  			// set config-text convenience method
		  			$(triangulate.editor.currElement).find('[element-text="' + index + '"]').text(attr);
		  			
		  			if(triangulate.editor.currConfig){
		  				// create eventName
		  				var eventName = triangulate.editor.currConfig.attr('data-action') + '.element.' + index + '.change';
		  			
		  				// trigger change
		  				$(triangulate.editor.el).trigger(eventName, {index: index, attr: attr});
		  			}
		  		}
	  		}
	  		
  		});
    	
    });
    
	// get pageId
	$scope.pageId = $stateParams.id;
	
	// save & publish
	$scope.saveAndPublish = function(){
		
		var editor = $('#triangulate-editor');
		
		// get the content and image from the editor
		var content = triangulate.editor.getContent(editor, Setup.api);
		var image = triangulate.editor.getPrimaryImage(editor);
		
		message.showMessage('progress');
		
		// save content for the page
		Page.saveContent($scope.pageId, content, image, 'publish', function(){
			message.showMessage('success');
			$scope.page.HasDraft = false;
		});
		
		// save a version of the content
		Version.save($scope.pageId, content, function(){});
		
		// save settings for the page
		$scope.saveSettings();
		
		// set prefix
		var prefix = $scope.page.Url + '-';
		
		var pageId = $scope.page.PageId;
		
		// save search index (todo)
		var translations = triangulate.editor.getTranslations(content);
		
		// get default translations for the site
		Translation.retrieveDefault(function(){
		
			// clear translations for the page
			Translation.clear(pageId);
			
			// add some meta data to the translations
			Translation.add(pageId, 'pageId', $scope.page.PageId);
			Translation.add(pageId, 'name', $scope.page.Name);
			Translation.add(pageId, 'url', $scope.page.Url);
			Translation.add(pageId, 'description', $scope.page.Description);
			
			// walkthrough translations
			for(var key in translations){
			
				// add translation to data
				Translation.add(pageId, key, translations[key]);
				
			}
			
			// save translation
			Translation.save(function(){
				
			});
			
		});
	}
	
	// saves a draft
	$scope.saveDraft = function(){
	
		var editor = $('#triangulate-editor');
		
		// get the content and image from the editor
		var content = triangulate.editor.getContent(editor, Setup.api);
		var image = triangulate.editor.getPrimaryImage(editor);
		
		message.showMessage('progress');
		
		Page.saveContent($scope.pageId, content, image, 'draft', function(data){
			message.showMessage('success');
			$scope.page.HasDraft = true;
		});
		
	}
	
	// reverts a draft
	$scope.revertDraft = function(){
	
		var editor = $('#triangulate-editor');
			
		message.showMessage('progress');
		
		// revert draft
		Page.revertDraft($scope.pageId, function(data){
			message.showMessage('success');
			$scope.page.HasDraft = false;
			
			// retrieve current content
			Page.retrieveContent($scope.pageId, function(data){
				
				// update editor
				$(triangulate.editor.el).html(data);
				
				// refresh editor
    			triangulate.editor.refresh();
    			
			});
			
			
		});
		
	}
	
	// set location
	$scope.setLocation = function(){
	
		var callback = function(latitude, longitude, fmtAddress){
		
			$scope.$apply(function(){
				$scope.page.Latitude = latitude;
				$scope.page.Longitude = longitude;
			});
			
		}
		
		var address = $scope.page.Location;
		
		utilities.geocode(address, callback);
		
	}
	
	// show settings
	$scope.showPageSettings = function(){
		// hide config
	  	$('.context-menu').find('.config').removeClass('active');
	  	$('.page-settings').addClass('active');
	  	triangulate.editor.currNode = null;
	  	triangulate.editor.currElement = null;
	  	$(triangulate.editor.el).find('.current-element').removeClass('current-element');
	  	$(triangulate.editor.el).find('.current-node').removeClass('current-node');
	}
	
	// save settings
	$scope.saveSettings = function(){
	
		var beginDate = $.trim($scope.page.LocalBeginDate + ' ' + $scope.page.LocalBeginTime);
		var endDate = $.trim($scope.page.LocalEndDate + ' ' + $scope.page.LocalEndTime);
		
		Page.saveSettings($scope.pageId, 
			$scope.page.Name, $scope.page.FriendlyId, $scope.page.Description, $scope.page.Keywords, $scope.page.Callout, 
			$scope.page.Layout, $scope.page.Stylesheet, 
			beginDate, endDate, $scope.page.Location, $scope.page.Latitude, $scope.page.Longitude,
			function(data){});
		
	}
	
	// back
	$scope.back = function(){
		window.history.back();
	}
	
	$scope.site = $rootScope.site;
	
	$scope.separator = '/';
	
	if($scope.site.UrlMode == 'hash'){
		$scope.separator = '/#/';
	}
	else if($scope.site.UrlMode == 'hashbang'){
		$scope.separator = '/#!/';
	}
	
	// retrieve page
	Page.retrieveExtended($scope.pageId, $scope.site.Offset, function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Page.retrieveExtended');
		if(Setup.debug)console.log(data);
		
		$scope.page = data;
	});
		
	
	// retrieve pages
	$scope.retrievePages = function(){
	
		// list pages
		Page.list(function(data){
			
			if($scope.pages == null){
			
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] Page.list');
				if(Setup.debug)console.log(data);
				
				$scope.pages = data;
			}
			
		});
	
	}
	
	$scope.retrievePages();
	
	// retrieve pages for theme
	$scope.retrievePagesForTheme = function(){
	
		// list pages for theme
		Theme.listPages(function(data){
		
			if($scope.themePages == null){
		
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] Theme.listPages');
				if(Setup.debug)console.log(data);
				
				$scope.themePages = data;
			}
			
		});
	
	}	
	
	// retrieve versions for a page
	$scope.retrieveVersions = function(){
	
		// list pages for theme
		Version.list($scope.pageId, function(data){
		
			if($scope.versions == null){
		
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] Version.retrieveVersions');
				if(Setup.debug)console.log(data);
				
				$scope.versions = data;
			}
			
		});
	
	}	
	
	// retrieve pagetypes
	$scope.retrievePageTypes = function(){
	
		// list allowed page types
		PageType.list(function(data){
		
			if($scope.pageTypes == null){
		
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] PageType.listAll');
				console.log(data);
				
				$scope.pageTypes = data;
			}
			
		});
	
	}
	
	$scope.retrievePageTypes();
	
	// retrieve images
	$scope.retrieveImages = function(){
	
		if($scope.images == null){
	
			// list images
			Image.list(function(data){
			
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] Image.list');
				console.log(data);
				
				$scope.images = data;
			});
			
			// get file size
			File.retrieveSize(function(data){
			
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] File.retrieveSize');
				console.log(data);
				
				$scope.totalSize = parseFloat(data);
			});
		
		}
	
	}
	
	// updates files
	$scope.updateFiles = function(){
		// list files
		File.list(function(data){
		
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] File.list');
			console.log(data);
			
			$scope.files = data;
			$scope.loading = false;
		});
		
		// get file size
		File.retrieveSize(function(data){
		
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] File.retrieveSize');
			console.log(data);
			
			$scope.totalSize = parseFloat(data);
		});
	}
	
	// updates downloads
	$scope.updateDownloads = function(){
	
		// list files
		File.listDownloads(function(data){
		
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] File.listDownloads');
			console.log(data);
			
			$scope.downloads = data;
			$scope.loading = false;
		});
		
	}
	
	$scope.updateDownloads();
	
	// retrieve pre-cached editor items
	$scope.editorItems = $rootScope.editorItems;
	
	// setup flipsnap
	var fs = Flipsnap('.editor-actions div', {distance: 400, maxPoint:3});
    
    $('.fs-next').on('click', function(){
        fs.toNext(); 
        
        if(fs.hasPrev()){
            $('.fs-prev').show();
        }
        else{
            $('.fs-prev').hide();
        }
        
        if(fs.hasNext()){
            $('.fs-next').show();
        }
        else{
            $('.fs-next').hide();
        }
    });
    
    $('.fs-prev').on('click', function(){
        fs.toPrev(); 
        
        if(fs.hasPrev()){
            $('.fs-prev').show();
        }
        else{
            $('.fs-prev').hide();
        }
        
        if(fs.hasNext()){
            $('.fs-next').show();
        }
        else{
            $('.fs-next').hide();
        }
    }); 
    
    // setup editor
	var editor = triangulate.editor.setup({
	    			el: $('#triangulate-editor'),
	    			pageId: $stateParams.id,
	    			api: Setup.api,
	    			menu: $scope.editorItems
				});

	// list new images
	$scope.updateImages = function(){
		Image.list(function(data){
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] Image.list');
			console.log(data);
			
			$scope.images = data;
		});
	}
	
	// cancel
	$scope.cancelAddImage = function(){
		$('#editor-placeholder').remove();
		$('#imagesDialog').modal('hide');
	}
	
	// add image
	$scope.addImage = function(image){
	
		console.log('$scope.addImage');
		console.log(image);
	
	
		var plugin = $('#imagesDialog').attr('data-plugin');
		
		// build add
		var fn = plugin + '.addImage';
		
		// execute method
		utilities.executeFunctionByName(fn, window, image);
	}
	
	// list icon
	Icon.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Image.list');
		console.log(data);
		
		$scope.icons = data;
	});
	
	// list layouts
	Layout.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Layout.list');
		console.log(data);
		
		$scope.layouts = data;
	});
	
	// list stylesheets
	Stylesheet.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Stylesheet.list');
		console.log(data);
		
		$scope.stylesheets = data;
	});
	
	// generate preview
	$scope.generatePreview = function(){
	
		var editor = $('#triangulate-editor');
	
		// get the content and image from the editor
		var content = triangulate.editor.getContent(editor);
		
		var image = triangulate.editor.getPrimaryImage(editor);
		var previewUrl = 'sites/' + $scope.site.FriendlyId + '/#/' + $scope.page.Url + '?preview=true';
		
		Page.preview($scope.pageId, content, function(data){});
	}
	
	// add product
	$scope.addProduct = function(product){
	
		Product.add(product, $scope.pageId, function(data){});
	}
	
	// clear products
	$scope.clearProducts = function(){
	
		Product.clear($scope.pageId, function(data){});
	}				

})

// menus controller
.controller('MenusCtrl', function($scope, $rootScope, Setup, MenuType, MenuItem, Page) {

	$rootScope.template = 'menus';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.friendlyId = 'primary';
	
	// set friendlyId
	$scope.setFriendlyId = function(friendlyId){
		$scope.friendlyId = friendlyId;
		$scope.current = null;
	}
	
	// set menutype
	$scope.setMenuType = function(menuType){
		$scope.friendlyId = menuType.FriendlyId;
		$scope.current = menuType;
	}
	
	// creates a friendlyId
	$scope.createFriendlyId = function(temp){
		var keyed = temp.Name.toLowerCase().replace(/[^a-zA-Z 0-9]+/g,'').replace(/\s/g, '-');
		temp.FriendlyId = keyed.substring(0,25);
	}
	
	// list menutypes
	MenuType.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] MenuType.list');
		console.log(data);
		
		$scope.menuTypes = data;
	});
	
	// list menuitems
	MenuItem.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] MenuItem.list');
		console.log(data);
		
		$scope.menuItems = data;
		$scope.loading = false;
		
		// setup reorder
		$('div.list').sortable({handle:'span.hook', placeholder: 'placeholder', opacity:'0.6', stop:function(){
            
            // get order
            var items = $('#menuItemsList .listItem');
        
	        var priorities = {};
	        
	        // set order in the model
	        for(var x=0; x<items.length; x++){
	            var id = $(items[x]).data('id');
				MenuItem.setPriority(id, x);
	            priorities[id] = x;
	        }
	        
	        // update order
	        message.showMessage('progress');
	        
	        MenuItem.savePriorities(priorities, function(){
		    	message.showMessage('success'); 	   
	        });
            
        }});
	});
	
	// list pages
	Page.list(function(data){
		
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Page.list');
		if(Setup.debug)console.log(data);
		
		$scope.pages = data;
	});
	
	// shows the menutype dialog for adding
	$scope.showAddMenuType = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#menuTypeDialog').modal('show');
    	
    	$('#menuTypeDialog').find('.add').show();
		$('#menuTypeDialog').find('.edit').hide();
	}
	
	// adds the menu type
	$scope.addMenuType = function(menuType){
	
		MenuType.add(menuType);
	
		$('#menuTypeDialog').modal('hide');
	}
	
	// shows the remove menu type dialog
	$scope.showRemoveMenuType = function(menuType){
	
		// set temporary model
		$scope.temp = menuType;
	
		$('#removeMenuTypeDialog').modal('show');
	}
	
	// removes the menu type
	$scope.removeMenuType = function(menuType){
	
		message.showMessage('progress');
	
		MenuType.remove(menuType, function(){
			$scope.friendlyId = 'primary';
			message.showMessage('success');
		});
	
		$('#removeMenuTypeDialog').modal('hide');
	}
	
	// shows the menu item dialog
	$scope.showAddMenuItem = function(){
	
		// set temporary model
		$scope.temp = {
			Name: '',
			Url: '',
			CssClass: ''
		};
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.add').show();
		$('#addEditDialog').find('.edit').hide();
	}
	
	// add the menu item
	$scope.addMenuItem = function(menuItem){
	
		menuItem.Priority = $('#menuItemsList').find('.listItem').length;
		menuItem.Type = $scope.friendlyId;
	
		MenuItem.add(menuItem);
	
		$('#addEditDialog').modal('hide');
	}
	
	// shows the menu item dialog
	$scope.showEditMenuItem = function(menuItem){
	
		// set temporary model
		$scope.temp = menuItem;
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.add').hide();
		$('#addEditDialog').find('.edit').show();
	}
	
	// edits the menu item
	$scope.editMenuItem = function(menuItem){
	
		message.showMessage('progress');
	
		MenuItem.edit(menuItem, function(){
			message.showMessage('success');
		});
	
		$('#addEditDialog').modal('hide');
	}
	
	// shows the remove item dialog
	$scope.showRemoveMenuItem = function(menuItem){
	
		// set temporary model
		$scope.temp = menuItem;
	
		$('#removeMenuItemDialog').modal('show');
	}

	// removes a menuItem
	$scope.removeMenuItem = function(menuItem){
	
		message.showMessage('progress');
	
		MenuItem.remove(menuItem, function(){
			message.showMessage('success');
		});
	
		$('#removeMenuItemDialog').modal('hide');
	}
	
	// toggle isNested
	$scope.toggleNested = function(menuItem){
		
		message.showMessage('progress');
	
		MenuItem.toggleNested(menuItem, function(){
			message.showMessage('success');
		});
		
	}
	
	// set url from page URL dropdown
	$scope.setUrl = function(page){
	
		$scope.temp.Name = page.Name
		$scope.temp.Url = page.Url;
		$scope.temp.PageId = page.PageId;
		
		return false;
	}
	
	// publishes the menus
	$scope.publish = function(){
	
		message.showMessage('progress');
	
		MenuItem.publish(function(){
			message.showMessage('success');
		});
	}
	
})

// layouts controller
.controller('LayoutsCtrl', function($scope, $rootScope, Setup, Layout) {

	$rootScope.template = 'layouts';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.content = '';
	
	// set code mirror options
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
		mode: 'text/html',
    };
	
	// set name
	$scope.setName = function(name){
		$scope.name = name;
		
		// retrieve content for layout
		Layout.retrieve(name, function(data){
			$scope.content = data;
		});
	}
	
	// list files
	Layout.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Layout.list');
		console.log(data);
		
		$scope.files = data;
		
		// retrieve content for first layout
		if(data.length > 0){
			
			$scope.setName(data[0]);
		}
	});
	
	// shows the add file dialog
	$scope.showAddFile = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#addDialog').modal('show');
	}
	
	// adds a file
	$scope.addFile = function(file){
	
		message.showMessage('progress');
	
		Layout.add(file, function(){
			message.showMessage('success');
		});
	
		$('#addDialog').modal('hide');
	}
	
	// shows the remove file dialog
	$scope.showRemoveFile = function(file){
	
		// set temporary model
		$scope.temp = file;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the file
	$scope.removeFile = function(file){
	
		message.showMessage('progress');
	
		Layout.remove(file, function(){
			$scope.file = '';  // #todo
			
			message.showMessage('success');
		});
	
		$('#removeDialog').modal('hide');
	}
	
	// publishes a layout
	$scope.publish = function(){
		
		message.showMessage('progress');
		
		Layout.publish($scope.name, $scope.content, function(){
			message.showMessage('success');
		});
		
	}
	
})

// scripts controller
.controller('ScriptsCtrl', function($scope, $rootScope, Setup, Script) {

	$rootScope.template = 'scripts';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.content = '';
	
	// set code mirror options
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
		mode: 'text/javascript',
    };
	
	// set name
	$scope.setName = function(name){
		$scope.name = name;
		
		// retrieve content for layout
		Script.retrieve(name, function(data){
			$scope.content = data;
		});
	}
	
	// list files
	Script.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Script.list');
		console.log(data);
		
		$scope.files = data;
		
		// retrieve content for first layout
		if(data.length > 0){
			
			$scope.setName(data[0]);
		}
	});
	
	// shows the add file dialog
	$scope.showAddFile = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#addDialog').modal('show');
	}
	
	// adds a file
	$scope.addFile = function(file){
	
		message.showMessage('progress');
	
		Script.add(file, function(){
			message.showMessage('success');
		});
	
		$('#addDialog').modal('hide');
	}
	
	// shows the remove file dialog
	$scope.showRemoveFile = function(file){
	
		// set temporary model
		$scope.temp = file;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the file
	$scope.removeFile = function(file){
	
		message.showMessage('progress');
	
		Script.remove(file, function(){
			$scope.file = '';  // #todo
			
			message.showMessage('success');
		});
	
		$('#removeDialog').modal('hide');
	}
	
	// publishes a script
	$scope.publish = function(){
		
		message.showMessage('progress');
		
		Script.publish($scope.name, $scope.content, function(){
			message.showMessage('success');
		});
		
	}
	
})


// styles controller
.controller('StylesCtrl', function($scope, $rootScope, Setup, Stylesheet) {

	$rootScope.template = 'styles';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.content = '';
	
	$scope.showError = false;
	
	// set code mirror options
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
		mode: 'text/css',
    };
	
	// set name
	$scope.setName = function(name){
		$scope.name = name;
		
		// retrieve content for layout
		Stylesheet.retrieve(name, function(data){
			$scope.content = data;
		});
	}
	
	// list files
	Stylesheet.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Stylesheet.list');
		console.log(data);
		
		$scope.files = data;
		
		// retrieve content for first layout
		if(data.length > 0){
			$scope.setName(data[0]);
		}
	});
	
	// shows the add file dialog
	$scope.showAddFile = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#addDialog').modal('show');
	}
	
	// adds a file
	$scope.addFile = function(file){
	
		message.showMessage('progress');
	
		Stylesheet.add(file, function(){
			message.showMessage('success');
		});
	
		$('#addDialog').modal('hide');
	}
	
	// shows the remove file dialog
	$scope.showRemoveFile = function(file){
	
		// set temporary model
		$scope.temp = file;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the file
	$scope.removeFile = function(file){
	
		message.showMessage('progress');
	
		Stylesheet.remove(file, function(){
			$scope.file = '';  // #todo
			
			message.showMessage('success');
		});
	
		$('#removeDialog').modal('hide');
	}
	
	// publishes a layout
	$scope.publish = function(){
		
		message.showMessage('progress');
		
		Stylesheet.publish($scope.name, $scope.content, function(){
			message.showMessage('success');
			$scope.showError = false;
		}, function(){
			$scope.showError = true;
		});
		
	}
	
})

// settings controller
.controller('SettingsCtrl', function($scope, $window, $rootScope, Setup, Site, Currency) {
	
	$rootScope.template = 'settings';
	
	// setup
	$scope.setup = Setup;
	
	// set the from value to the previous to value
    $(document).on('focus', '.to', function(){ 
        
        var from = $(this).parent().parent().find('.from');
		$(this).removeClass('error');
        
        if(from){
        
        	var to = $(this).parent().parent().prev().find('.to');
      
        	if(to){
				$(from).text($(to).val());
			}
			else{
				$(from).text(0);
			}
        }
	    
    });
    
    $(document).on('blur', '.to', function(){
    
    	var to = Number($(this).val().replace(/[^0-9\.]+/g, ''));
    	
		$(this).val(to);
		
		var prev = $(this).parent().parent().prev().find('.to');
		
		if(prev){
			prev = Number($(prev).val().replace(/[^0-9\.]+/g, ''));
			
			console.log(prev);
			
			if(to < prev){
				$(this).addClass('error');
				$(this).val('');
			}
		}
    
    });
	
	// retrieve site
	Site.retrieve(function(data){
	
		// debugging
		if(Setup.debug)console.log('[respond.debug] Site.retrieve');
		if(Setup.debug)console.log(data);
		
		$scope.site = data;
		$scope.site.SMTPPassword = 'temppassword';
		
		var calc = $scope.site.ShippingCalculation;
		var tiers = $scope.site.ShippingTiers;
		
		// set calculation
		if(calc == 'amount' || calc == 'weight'){
	                
            var tiers = JSON.parse(tiers);
            var tos = $('.shipping-'+calc).find('.to');
	        var froms = $('.shipping-'+calc).find('.from');
	        var rates = $('.shipping-'+calc).find('.rate');
            
            // set tiers
            for(x=0; x<tiers.length; x++){
                var tier = tiers[x];
                $(froms[x]).text(tier.from); 
                $(tos[x]).val(tier.to);
                $(rates[x]).val(tier.rate); 
  
            }
            
        }
		
	});
	
	// save settings
	$scope.save = function(){
		
		// set tiers
		var calc = $scope.site.ShippingCalculation;
		var shippingTiers = '';
		
        if(calc == 'amount' || calc == 'weight'){
	        
	        var tos = $('.shipping-'+calc).find('.to');
	        var froms = $('.shipping-'+calc).find('.from');
	        var rates = $('.shipping-'+calc).find('.rate');
	        
	        var tiers = []; // create array
	        
	        for(x=0; x<tos.length; x++){
		        
		        var from = Number($(froms[x]).text().replace(/[^0-9\.]+/g,""));
		        var to = Number($(tos[x]).val().replace(/[^0-9\.]+/g,""));
		        var rate = Number($(rates[x]).val().replace(/[^0-9\.]+/g,""));
		        
		        if(jQuery.trim($(tos[x]).val()) != '' && to != 0){
			        var tier = {
				        'from': from,
				        'to': to,
				        'rate': rate
			        }
			        
			        tiers.push(tier);
		        }
		        
	        }
	        
	        // set JSON for tiers
	        shippingTiers = JSON.stringify(tiers);
	        
	        if(Setup.debug)console.log('[respond.debug] Set Shipping Tiers');
	        console.log(shippingTiers);
	        
	        // update model
	        $scope.site.ShippingTiers = shippingTiers;
        }
        
        
        message.showMessage('progress');
        
        Site.save($scope.site, function(){
	        message.showMessage('success');
        },
        function(){
	     	message.showMessage('error');   
        });
		
		
	};
	
	// retrieve currencies
	Currency.list(function(data){
		$scope.currencies = data;
	});
	
})

// theme controller
.controller('ThemeCtrl', function($scope, $rootScope, Setup, Theme, Site) {
	
	$rootScope.template = 'theme';
	
	// setup
	$scope.setup = Setup;
	
    $scope.themeId = Site.Theme;
    
    // setup carousel
	$('#update-theme').carousel({
		interval: false,
		wrap: true
	});
	
	// set next
	$scope.next = function(){
		$('#update-theme').carousel('next');
	}
	
	$scope.previous = function(){
		$('#update-theme').carousel('prev');
	}
   
    // sets a theme
    $scope.setThemeId = function(id){
    	$scope.themeId = id;
    }
    
    // get themes
	Theme.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Theme.list');
		console.log(data);
		
		$scope.themes = data;
	});
	
	// retrieve site
	Site.retrieve(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Site.retrieve');
		if(Setup.debug)console.log(data);
		
		$scope.site = data;
		
		$scope.themeId = data.Theme;
	});
	
	// shows the dialog to apply a new theme
	$scope.showApply = function(theme){
	
		// set temporary model
		$scope.temp = theme;
	
		$('#applyDialog').modal('show');
    	
	}
	
	// applies a new theme
	$scope.applyTheme = function(theme){
	
		 message.showMessage('progress');
	
		// apply the theme
		Theme.apply(theme.name, 
			function(){
				 message.showMessage('success');
			});
	
		// hide the modal
		$('#applyDialog').modal('hide');
	}
	
	// shows the dialog to reset the current theme
	$scope.showReset = function(theme){
	
		// set temporary model
		$scope.temp = theme;
	
		$('#resetDialog').modal('show');
    	
	}
	
	// resets current theme
	$scope.resetTheme = function(theme){
	
		message.showMessage('progress');
	
		// reset the theme
		Theme.reset(theme.name, 
			function(){
				 message.showMessage('success');
			});
	
		$('#resetDialog').modal('hide');
	}
	
})

// branding controller
.controller('BrandingCtrl', function($scope, $window, $rootScope, Setup, Site, Image, File) {
	
	$rootScope.template = 'branding';
	
	// setup
	$scope.setup = Setup;
	$scope.type = null;
	$scope.site = null;
	$scope.logoUrl = null;
	$scope.payPalLogoUrl = null;
	$scope.iconUrl = null;
	$scope.totalSize = 0;
	$scope.fileLimit = $rootScope.site.FileLimit;
	
	$scope.site = $rootScope.site;
		
	// update image urls
	if($scope.site.LogoUrl != null){
    	$scope.logoUrl = $scope.site.ImagesURL + 'files/' + $scope.site.LogoUrl;
    }
    
    if($scope.site.PayPalLogoUrl != null){
		$scope.payPalLogoUrl = $scope.site.ImagesURL + 'files/' + $scope.site.PayPalLogoUrl;
	}
	
	if($scope.site.IconUrl != null){
		$scope.iconUrl = $scope.site.ImagesURL + 'files/' + $scope.site.IconUrl;
	}
	
	// shows the images dialog
	$scope.showAddImage = function(type){
		$scope.type = type;
	
		$('#imagesDialog').modal('show');
	}
	
	// list new images
	$scope.updateImages = function(){
		Image.list(function(data){
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] Image.list');
			console.log(data);
			
			$scope.images = data;
		});
	}
	
	// get file size
	File.retrieveSize(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] File.retrieveSize');
		console.log(data);
		
		$scope.totalSize = parseFloat(data);
	});
	
	// update the images for the dialog
	$scope.updateImages();
	
	// updates the icon bg
	$scope.updateIconBg = function(){
		
		message.showMessage('progress');
	
		Site.updateIconBg($scope.site.IconBg, function(){
			message.showMessage('success');
		});
	}
	
	// add image
	$scope.addImage = function(image){
	
		message.showMessage('progress');
	
		Site.addImage($scope.type, image, function(){
			message.showMessage('success');
			
			// update image
			if($scope.type == 'logo'){
				$scope.logoUrl = $scope.site.ImagesURL + 'files/' + image.filename;
			}
			else if($scope.type == 'paypal'){
				$scope.payPalLogoUrl = $scope.site.ImagesURL + 'files/' + image.filename;
			}
			else if($scope.type == 'icon'){
				$scope.iconUrl = $scope.site.ImagesURL + 'files/' + image.filename;
			}
			
			// update site in session
			Site.retrieve(function(data){
				// set site to $rootScope
				$rootScope.site = data;
				$window.sessionStorage.site = JSON.stringify(data);					
			});
			
		});
	
		$('#imagesDialog').modal('hide');
	}

})

// files controller
.controller('FilesCtrl', function($scope, $rootScope, Setup, File) {
	
	$rootScope.template = 'files';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.temp = null;
	$scope.totalSize = 0;
	$scope.fileLimit = $rootScope.site.FileLimit;
	$scope.folder = 'files';
	
	// set current folder
	$scope.setFolder = function(folder){
		$scope.folder = folder;
		
		
		// update files
		$scope.updateFiles();
		
	}
	
	$scope.updateFiles = function(){
	
		console.log('[triangulate.test] updateFiles(), folder = ' + $scope.folder);
	
		if($scope.folder == 'files'){
		
			// list files
			File.list(function(data){
			
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] File.list');
				console.log(data);
				
				$scope.files = data;
				$scope.loading = false;
			});
		}
		else{
		
			// update downloads
			File.listDownloads(function(data){
			
				// debugging
				if(Setup.debug)console.log('[triangulate.debug] Download.list');
				console.log(data);
				
				$scope.files = data;
				$scope.loading = false;
			});
			
		}

		// get file size
		File.retrieveSize(function(data){
		
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] File.retrieveSize');
			console.log(data);
			
			$scope.totalSize = parseFloat(data);
		});
	}
	
	$scope.updateFiles();
	
	// sets file to be edit
	$scope.edit = function(file, $event){
		$scope.temp = file;
		
		var el = $event.target;
		
		$('.listItem').removeClass('editing');
		$(el).parents('.listItem').addClass('editing');
		
	}
	
	// cancels editing an item
	$scope.cancelEdit = function(file){
		$scope.temp = null;
		$('.listItem').removeClass('editing');
	}

	// shows the remove dialog
	$scope.showRemove = function(file){
		$scope.temp = file;
		
		$('#removeDialog').modal('show');
	}
	
	// removes a file
	$scope.remove = function(){
		
		message.showMessage('progress');
		
		File.remove($scope.temp, $scope.folder, function(){
			message.showMessage('success');
			
			$scope.updateFiles();
		});
		
		$('#removeDialog').modal('hide');
	}

})

// users controller
.controller('UsersCtrl', function($scope, $rootScope, Setup, User, Role, Language, Image) {
	
	$rootScope.template = 'users';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.temp = null;
	$scope.userLimit = $rootScope.site.UserLimit;
	$scope.canAdd = false;
	
	// list users
	User.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] User.list');
		console.log(data);
		
		$scope.users = data;
		$scope.loading = false;
		
		if($scope.users.length < $scope.userLimit){
			$scope.canAdd = true;
		}
	});
	
	// get languages
	Language.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Language.list');
		console.log(data);
		
		$scope.languages = data;
	});
	
	// get roles
	Role.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Role.list');
		console.log(data);
		
		// push admin, contributor and member
		data.push({
			RoleId: 'Admin',
			Name: 'Admin', 
			CanView: '', 
			CanEdit: '', 
			CanPublish: '', 
			CanRemove: '', 
			CanCreate: ''});
			
		data.push({
			RoleId: 'Contributor',
			Name: 'Contributor', 
			CanView: '', 
			CanEdit: '', 
			CanPublish: '', 
			CanRemove: '', 
			CanCreate: ''});
			
		data.push({
			RoleId: 'Member',
			Name: 'Member', 
			CanView: '', 
			CanEdit: '', 
			CanPublish: '', 
			CanRemove: '', 
			CanCreate: ''});
		
		$scope.roles = data;
	});
	
	// shows the user dialog for editing
	$scope.showEditUser = function(user){
	
		// set temporary model
		$scope.temp = user;
		
		$scope.temp.Password = 'temppassword';
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.edit').show();
		$('#addEditDialog').find('.add').hide();
	}
	
	// edits the user
	$scope.editUser = function(user){
	
		message.showMessage('progress');
	
		User.edit(user, function(){
			message.showMessage('success');
		});
	
		$('#addEditDialog').modal('hide');
	}
	
	// shows the dialog to add a user
	$scope.showAddUser = function(){
	
		// set temporary model
		$scope.temp = {
			firstName: '', 
			lastName: '', 
			role: 'Admin', 
			language: 'en', 
			isActive: '1', 
			email: '', 
			password: ''};
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.add').show();
		$('#addEditDialog').find('.edit').hide();
	}
	
	// adds the user
	$scope.addUser = function(user){
	
		message.showMessage('progress');
	
		User.add(user, function(){
			message.showMessage('success');
		});
	
		$('#addEditDialog').modal('hide');
	}
	
	// shows the remove user dialog
	$scope.showRemoveUser = function(user){
	
		// set temporary model
		$scope.temp = user;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the user
	$scope.removeUser = function(user){
	
		message.showMessage('progress');
	
		User.remove(user, function(){
			message.showMessage('success');
		});
	
		$('#removeDialog').modal('hide');
	}
	
	// shows the images dialog
	$scope.showAddImage = function(user){
		$scope.temp = user;
		
		$('#imagesDialog').modal('show');
	}
	
	// list new images
	$scope.updateImages = function(){
		Image.list(function(data){
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] Image.list');
			console.log(data);
			
			$scope.images = data;
		});
	}
	
	// update the images for the dialog
	$scope.updateImages();
	
	// add image
	$scope.addImage = function(image){
	
		message.showMessage('progress');
	
		User.addImage($scope.temp.UserId, image, function(){
			message.showMessage('success');
		});
	
		$('#imagesDialog').modal('hide');
	}


})

// roles controller
.controller('RolesCtrl', function($scope, $rootScope, Setup, Role, PageType) {
	
	$rootScope.template = 'roles';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.temp = null;
	$scope.isDefault = true;
	
	// handle checkbox clicking
	$('body').on('click', '.chk-view-all', function(){
		$('.chk-view').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-edit-all', function(){
		$('.chk-edit').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-publish-all', function(){
		$('.chk-publish').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-remove-all', function(){
		$('.chk-remove').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-create-all', function(){
		$('.chk-create').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-view', function(){
		$('.chk-view-all').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-edit', function(){
		$('.chk-edit-all').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-publish', function(){
		$('.chk-publish-all').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-remove', function(){
		$('.chk-remove-all').removeAttr('checked');
	});
	
	$('body').on('click', '.chk-create', function(){
		$('.chk-create-all').removeAttr('checked');
	});

	// list roles
	Role.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Role.list');
		console.log(data);
		
		$scope.roles = data;
		$scope.loading = false;
	});
	
	// list all page types
	PageType.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] PageType.list');
		console.log(data);
		
		$scope.pageTypes = data;
	});
	
	// sets up the checkboxes in the dialog
	$scope.setupCheckboxes = function(view, edit, publish, remove, create){
	
		$('#addEditDialog').find('input[type=checkbox]').removeAttr('checked');
	
		// check view boxes
		if(view == 'All'){
			$('#addEditDialog').find('.chk-view-all').attr('checked', 'checked');
		}
		else{
			var list = view.split(',');
			
			for(x=0; x<list.length; x++){
				$('#addEditDialog').find('.chk-view-'+list[x]).attr('checked', 'checked');
			}
		}
		
		// check edit boxes
		if(edit == 'All'){
			$('#addEditDialog').find('.chk-edit-all').attr('checked', 'checked');
		}
		else{
			var list = edit.split(',');
			
			for(x=0; x<list.length; x++){
				$('#addEditDialog').find('.chk-edit-'+list[x]).attr('checked', 'checked');
			}
		}
		
		// check publish boxes
		if(publish == 'All'){
			$('.chk-publish-all').attr('checked', 'checked');
		}
		else{
			var list = publish.split(',');
			
			for(x=0; x<list.length; x++){
				$('#addEditDialog').find('.chk-publish-'+list[x]).attr('checked', 'checked');
			}
		}
		
		// check remove boxes
		if(remove == 'All'){
			$('#addEditDialog').find('.chk-remove-all').attr('checked', 'checked');
		}
		else{
			var list = remove.split(',');
			
			for(x=0; x<list.length; x++){
				$('#addEditDialog').find('.chk-remove-'+list[x]).attr('checked', 'checked');
			}
		}
		
		// check create boxes
		if(create == 'All'){
			$('#addEditDialog').find('.chk-create-all').attr('checked', 'checked');
		}
		else{
			var list = create.split(',');
			
			for(x=0; x<list.length; x++){
				$('#addEditDialog').find('.chk-create-'+list[x]).attr('checked', 'checked');
			}
		}
	}
	
	// shows the default values
	$scope.showDefault = function(role){
		
		// set default
		$scope.isDefault = true;
		
		// setup the checkboxes
		if(role == 'Admin'){
			$scope.setupCheckboxes('All', 'All', 'All', 'All', 'All');
		}
		else if(role == 'Contributor'){
			$scope.setupCheckboxes('All', 'All', '', '', '');
		}
		else if(role == 'Member'){
			$scope.setupCheckboxes('All', '', '', '', '');
		}
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.edit').show();
		$('#addEditDialog').find('.add').hide();
		
	}
	
	// shows the role dialog for editing
	$scope.showEditRole = function(role){
	
		// set default
		$scope.isDefault = false;
	
		// set temporary model
		$scope.temp = role;
	
		// setup the checkboxes
		$scope.setupCheckboxes(role.CanView, role.CanEdit, role.CanPublish, role.CanRemove, role.CanCreate)
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.edit').show();
		$('#addEditDialog').find('.add').hide();
	}
	
	// gets value
	$scope.getPermissions = function(type){
		
		var canDo = '';
		
		// get permissions 
		if($('.chk-'+type+'-all').prop('checked')){
			canView = 'All';
		}
		else{
			var checks = $('.chk-' + type);
			
			for(x=0; x<checks.length; x++){
				if($(checks[x]).prop('checked')){
					canDo += $(checks[x]).val() + ',';
				}
			}		
		}
		
		// replace trailing comma and trim
		canDo = canDo.replace(/(^,)|(,$)/g, "");
		canDo = $.trim(canDo);
		
		return canDo;
	}
	
	// edits the role
	$scope.editRole = function(role){
	
		// set permissions
		role.CanView = $scope.getPermissions('view');
		role.CanEdit = $scope.getPermissions('edit');
		role.CanPublish = $scope.getPermissions('publish');
		role.CanRemove = $scope.getPermissions('remove');
		role.CanCreate = $scope.getPermissions('create');
	
		message.showMessage('progress');
	
		Role.edit(role, function(){
			message.showMessage('success');
		});
	
		$('#addEditDialog').modal('hide');
	}
	
	// shows the dialog to add a role
	$scope.showAddRole = function(){
	
		// set default
		$scope.isDefault = false;
	
		// set temporary model
		$scope.temp = {
			Name: '', 
			CanView: '', 
			CanEdit: '', 
			CanPublish: '', 
			CanRemove: '', 
			CanCreate: ''};
		
		$('#addEditDialog').find('input[type=checkbox]').removeAttr('checked');
	
		$('#addEditDialog').modal('show');
    	
    	$('#addEditDialog').find('.add').show();
		$('#addEditDialog').find('.edit').hide();
	}
	
	// adds the role
	$scope.addRole = function(role){
	
		// set permissions
		role.CanView = $scope.getPermissions('view');
		role.CanEdit = $scope.getPermissions('edit');
		role.CanPublish = $scope.getPermissions('publish');
		role.CanRemove = $scope.getPermissions('remove');
		role.CanCreate = $scope.getPermissions('create');
	
		message.showMessage('progress');
	
		Role.add(role, function(){
			message.showMessage('success');
		});
		
		$('#addEditDialog').modal('hide');
	}
	
	// shows the remove role dialog
	$scope.showRemoveRole = function(role){
	
		// set temporary model
		$scope.temp = role;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the role
	$scope.removeRole = function(role){
	
		Role.remove(role);
	
		$('#removeDialog').modal('hide');
	}

})

// translations controller
.controller('TranslationsCtrl', function($scope, $rootScope, Setup, Translation) {

	$rootScope.template = 'translations';
	
	// setup
	$scope.setup = Setup;
	$scope.loading = true;
	$scope.content = '';
	$scope.showError = false;
	
	// set code mirror options
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
		mode: 'application/json',
    };
	
	// set locale
	$scope.setLocale = function(locale){
		$scope.locale = locale;
		
		// retrieve content for layout
		Translation.retrieve(locale, function(data){
			$scope.content = JSON.stringify(data, null, '\t');
		});
	}
	
	// list locales
	$scope.listLocales = function(){
		// list available locales
		Translation.listLocales(function(data){
		
			// debugging
			if(Setup.debug)console.log('[triangulate.debug] Translation.list');
			console.log(data);
			
			$scope.locales = data;
			
			// retrieve content for first layout
			if(data.length > 0){
				$scope.setLocale(data[0]);
			}
		});
	}
	
	// list locales by default
	$scope.listLocales();
	
	// shows the add file dialog
	$scope.showAddLocale = function(){
	
		// set temporary model
		$scope.temp = null;
	
		$('#addDialog').modal('show');
	}
	
	// adds a locale
	$scope.addLocale = function(locale){
	
		message.showMessage('progress');
	
		Translation.addLocale(locale, function(){
			message.showMessage('success');
		});
	
		$('#addDialog').modal('hide');
	}
	
	// shows the remove locale dialog
	$scope.showRemoveLocale = function(locale){
	
		// set temporary model
		$scope.temp = locale;
	
		$('#removeDialog').modal('show');
	}
	
	// removes the locale
	$scope.removeLocale = function(locale){
	
		message.showMessage('progress');
	
		Translation.removeLocale(locale, function(){
			$scope.listLocales();
			
			message.showMessage('success');
		});
	
		$('#removeDialog').modal('hide');
	}
	
	// publishes a layout
	$scope.publish = function(){
		
		message.showMessage('progress');
		
		var isvalid = false;
		
		// validate json
		try {
	        JSON.parse($scope.content);
	        
	        isvalid = true;
	    } catch (e) {
	        isvalid = false;
	    }
		
		// publish if valide
		if(isvalid){
			Translation.publish($scope.locale, $scope.content, function(){
				message.showMessage('success');
				$scope.showError = false;
			});
		}
		else{
			message.showMessage('error');
			$scope.showError = true;
		}
		
	}
	
})

// profile controller
.controller('ProfileCtrl', function($scope, $rootScope, Setup, User, Language) {

	$rootScope.template = 'profile';
	
	// setup
	$scope.user = $rootScope.user;
	$scope.user.Password = 'temppassword';
	
	// get languages
	Language.list(function(data){
	
		// debugging
		if(Setup.debug)console.log('[triangulate.debug] Language.list');
		console.log(data);
		
		$scope.languages = data;
	});

	
	// save profile
	$scope.save = function(){
		message.showMessage('progress');
	
		User.editProfile($scope.user, function(){
			message.showMessage('success');
		});
	}

	
})
;