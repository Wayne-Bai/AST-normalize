Ti.include('../config.js');

// Include the tiajax.js library
Ti.include("../lib/tiajax.js");

//Define $ and $.ajax
$ = {}
$.ajax = Titanium.Network.ajax

// Define the variable win to contain the current window
var win = Ti.UI.currentWindow;

// Check if the user is logged in. Drupal doesn't accept new accounts
// if the user is logged in then show an alert with a message
if(Titanium.App.Properties.getInt("userUid")) {
	alert("You're logged in, please logout first");
}
else {
	// Create the scrollview to contain the data
	var view = Titanium.UI.createScrollView({
		contentWidth:'auto',
		contentHeight:'auto',
		showVerticalScrollIndicator:true,
		showHorizontalScrollIndicator:true,
		top: 0,
	});

	// Add the view to the window
	win.add(view);

	// Create the label for the username
	var usernameLabel = Titanium.UI.createLabel({
		text:'Username',
		font:{fontSize:14, fontWeight: "bold"},
		left:10,
		top:10,
		width:300,
		height:'auto'
	});

	// Add the label to the window
	view.add(usernameLabel);

	// Create the textfield for the username
	var usernameTextfield = Titanium.UI.createTextField({
		height:35,
		top:30,
		left:10,
		width:300,
		font:{fontSize:16},
		borderWidth:2,
		borderColor:'#bbb',
		borderRadius:5,
		autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
	});

	// Add the textfield to the window
	view.add(usernameTextfield);

	// Create the label for the email
	var emailLabel = Titanium.UI.createLabel({
		text:'Email',
		font:{fontSize:14, fontWeight: "bold"},
		left:10,
		top:70,
		width:300,
		height:'auto'
	});

	// Add the label to the window
	view.add(emailLabel);

	// Create the textfield for the email
	var emailTextfield = Titanium.UI.createTextField({
		height:35,
		top:90,
		left:10,
		width:300,
		font:{fontSize:16},
		borderWidth:2,
		borderColor:'#bbb',
		borderRadius:5,
		autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
	});

	// Add the textarea to the window
	view.add(emailTextfield);

	// Create the label for the password
	var passwordLabel = Titanium.UI.createLabel({
		text:'Password',
		font:{fontSize:14, fontWeight: "bold"},
		left:10,
		top:130,
		width:300,
		height:'auto'
	});

	// Add the label to the window
	view.add(passwordLabel);

	// Create the textfield for the password
	var passwordTextfield = Titanium.UI.createTextField({
		height:35,
		top:150,
		left:10,
		width:300,
		font:{fontSize:16},
		borderWidth:2,
		borderColor:'#bbb',
		borderRadius:5,
		autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		passwordMask:true,
	});

	// Add the textarea to the window
	view.add(passwordTextfield);

	// Create the label for the full name
	var nameLabel = Titanium.UI.createLabel({
		text:'Full Name',
		font:{fontSize:14, fontWeight: "bold"},
		left:10,
		top:190,
		width:300,
		height:'auto'
	});

	// Add the label to the window
	view.add(nameLabel);

	//Create the textfield for the full name
	var nameTextfield = Titanium.UI.createTextField({
		height:35,
		top:210,
		left:10,
		width:300,
		font:{fontSize:16},
		borderWidth:2,
		borderColor:'#bbb',
		borderRadius:5,
		autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
	});

	// Add the textarea to the window
	view.add(nameTextfield);

	// Add the login button
	var createAccountButton = Titanium.UI.createButton({
		title:'Create account',
		height:40,
		width:200,
		top:320
	});

	// Add the button to the window
	view.add(createAccountButton);

	// Add an event listener to the create account button
	createAccountButton.addEventListener('click', function() {
		// Define an object, this object takes all the 
		// input from the user and is sent to Drupal
		var newUser = {
			"name": usernameTextfield.value,
			"pass": passwordTextfield.value,
			"mail": emailTextfield.value,
			"field_fullname": {
				"und": [{"value": nameTextfield.value}]
			}
		};
		
		// Define the URL to register this user
		var url = REST_PATH + "user/register.json";
		
		// Use $.ajax to POST the new user
		$.ajax({
			type: "POST",
			url: url,
			dataType: "json",
			data: JSON.stringify(newUser),
			contentType: "application/json",
			// On success we pass the response as res
			success: function(res) {
				
				// res will be an object including the uid and the uri to the new user
				// Alert the user the new account has been created
				alert("Account created");
					
				// Services only respond with a uid and a uri, but to Drupal eyes, the user is logged in
				// although we don't have a session id the user is logged in.
				// Services probably should return the session id since is set once the user created the account
				// This probably has something to do with the fact that you can create an account but it must
				// be approved sometimes.
				// The other way to do this would be to logout and then login the user now having a session
				Titanium.App.Properties.setInt("userUid", res.uid);
				Titanium.App.Properties.setInt("userName", newUser.name);
				var user = {
					uid: Titanium.App.Properties.getInt("userUid"),
				}
				
				
			}
		});
	});
}

