app.controller('AdminCandidatesCtrl',
  ['$http', '$scope', 'User', 'Match', 'SERVER_URL',
   function ($http, $scope, User, Match, SERVER_URL) {

  $scope.query = '';
  $scope.config = {};
  $scope.config.exclude = true;

  $scope.toggleAccepted = function(exclude){
    exclude ? $scope.excludeAccepted() : $scope.includeAccepted();
  };
  
  $scope.excludeAccepted = function () {
    var results = {};
    for(var key in $scope.allGroups){
      results[key] = $scope.allGroups[key].filter(function(user){
        if(user.searchStage !== 'Accepted' && user.searchStage !== 'Out') return true;
        return false;
      });
    }
    $scope.groups = results;
  };

  $scope.includeAccepted = function(){
    $scope.groups = angular.copy($scope.allGroups);
  };

  User.getAll().then(function (users) {
    $scope.users = users;
    var userMap = {};
    var groups = {};
    // split users into groups<key,user>
    users.forEach(function (user) {
      if (!user.category) {
        user.category = {};
        user.category.name = 'Uncategorized';
      }
      if (user.isRegistered === false) {
        user.category.name = 'Invited, Has Never Logged In';
      }
      if(!groups[user.category.name]) {
        groups[user.category.name] = [];
      }
      groups[user.category.name].push(user);
    });

    users.forEach(function (user) {
      userMap[user._id] = user;
      userMap[user._id].interestDeclared = 0;
      userMap[user._id].interestThreeOrGreater = 0;
    });

    Match.getAll().then(function (data) {
      var matches = data.matches;
      for(var i = 0; i < matches.length; i++) {
        var match = matches[i];
        if (match.userInterest !== 0) {
          userMap[match.user].interestDeclared++;
          if (match.userInterest >= 3) {
            userMap[match.user].interestThreeOrGreater++;
          }
        }
      }
      $scope.allGroups = angular.copy(groups);
      $scope.excludeAccepted();
    });

  });

  $scope.downloadData = function () {
    $http.get(SERVER_URL + '/api/users/download')
    .success(function () {
      if (arguments[1] === 200) {
        $scope.dataToDownload = arguments[0];
        download(arguments[0], 'exported', 'text/csv');
      }
    });
  };

  function download(strData, strFileName, strMimeType) {
    var D = document,
        a = D.createElement("a");
        strMimeType= strMimeType || "application/octet-stream";


    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
    } /* end if(navigator.msSaveBlob) */


    if ('download' in a) { //html5 A[download]
        a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
        a.setAttribute("download", strFileName);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            a.click();
            D.body.removeChild(a);
        }, 66);
        return true;
    } /* end if('download' in a) */


    //do iframe dataURL download (old ch+FF):
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
  } /* end download() */

  


}]);
