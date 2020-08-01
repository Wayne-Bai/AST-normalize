if (ioAngularAvailable) {
	// The connection service
	io.factory("ioconnection", ['$rootScope', function($scope) {

		// Whether or not connected to the server
		var connected = true;

		// If we are unloading the page
		var unloading = false;

		window.addEventListener("beforeunload", function() {
			unloading = true;
		});

		// Notify of a change in the state
		var notify = function() {
			$scope.$broadcast("ioconnectionchange", connected);
			if (connected) {
				$scope.$broadcast("ioconnected");
			} else if (!unloading) {
				// Only dispatch disconnect if we're not unloading the page
				$scope.$broadcast("iodisconnected");
			}
			// We need somewhere to reset the unloading, in case user cancels
			unloading = false;
		}

		// Handle the state of the connection
		importio.addConnectionCallback(function(state) {
			var changed = false;
			switch (state.data.type) {
				case "CONNECTED":
					if (!connected) {
						changed = true;
					}
					connected = true;
					break;
				case "CONNECTION_BROKEN":
				case "CONNECTION_CLOSED":
					if (connected) {
						changed = true;
					}
					connected = false;
					break;
			}

			if (changed) {
				notify();
			}
		});

		return {
			connected: function() {
				return connected;
			}
		}

	}]);
}