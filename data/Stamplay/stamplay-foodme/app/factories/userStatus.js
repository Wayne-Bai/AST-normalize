/*
This Factory is in charge of tracking user status via the **User** `getStatus` 
API call and expose it to controllers who require it. 
It acts as a simple caching layer between user status and controllers
Whenever one or more controller on the same page are in need to know 
the user status the API call would be effectively done only one time
*/
app.factory('userStatus', ['$http', function ($http) {
	var user = {};
	return {
		loginUser: function (user) {
			var call = $http({
				method: 'POST',
				data: user,
				url: '/auth/v0/local/login'
			});
			return call;
		},
		registerUser: function (user) {
			return $http({
				method: 'POST',
				data: user,
				url: '/api/user/v0/users'
			})
		},
		//simple call to get userStatus
		getUserCall: function () {
			var call = $http({
				method: 'GET',
				url: '/api/user/v0/getStatus'
			})
			return call;
		},
		// Getter and Setter method
		getUser: function () {
			return user
		},
		setUser: function (displayName, picture, _id, email, logged) {
			user = {
				displayName: displayName,
				picture: picture,
				_id: _id,
				email: email,
				logged: logged
			}
		}
	};
}])