/*
 *	This Factory is in charge of validating user emails via the auth `validate` endpoint
 *	API call and expose it to controllers who require it.
 */

app.factory('validator', ['$http', function ($http) {
	return {
		validateEmail: function (validate) {
			return $http({
				method: 'POST',
				data: validate,
				url: '/api/auth/v0/validate/email'
			});
		}
	};
}])