/**
* Copyright 2013 Facebook, Inc.
*
* You are hereby granted a non-exclusive, worldwide, royalty-free license to
* use, copy, modify, and distribute this software in source code or binary
* form for use in connection with the web services and APIs provided by
* Facebook.
*
* As with any software that integrates with the Facebook platform, your use
* of this software is subject to the Facebook Developer Principles and
* Policies [http://developers.facebook.com/policy/]. This copyright notice
* shall be included in all copies or substantial portions of the software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/


var gPlayerFBID;
var gPlayerBombs = 0;
var gPlayerCoins = 0;
var gTournamentCountdown;

kAchievements = {
    kACHIEVEMENT_SCORE50 : 0,
    kACHIEVEMENT_SCORE100 : 1,
    kACHIEVEMENT_SCORE150 : 2,
    kACHIEVEMENT_SCORE200 : 3,
    kACHIEVEMENT_SCOREx3 : 4
};

function createMenu() {
  var menuShim = document.createElement('div');
  menuShim.id = 'menu_shim';

  menuShim.style.width = gCanvasWidth + "px";
  menuShim.style.height = gCanvasHeight + "px";
  stage.appendChild(menuShim);

  var menuContainer = document.createElement('div');
  menuContainer.id = 'menu_container';
  stage.appendChild(menuContainer);
  menuContainer.style.width = stage.style.width;
  menuContainer.style.height = stage.style.height;


  /* Play Button */
  var playButton = document.createElement('div');
  playButton.className = 'menu_item';
  playButton.id = 'play_button';
  playButton.style.top = "188px";
  playButton.style.left = "0px";
  playButton.style.zIndex = "10";
  playButton.setAttribute('onclick', 'javascript:startGame(null, null)');
  playButton.style.backgroundImage = "url('images/button_play.png')";
  menuContainer.appendChild(playButton);

  var playButtonHover = document.createElement('div');
  playButtonHover.className = 'menu_item';
  playButtonHover.style.top = "188px";
  playButtonHover.style.left = "0px";
  playButtonHover.style.backgroundImage = "url('images/button_play_hot.png')";
  menuContainer.appendChild(playButtonHover);

  $("#play_button").hover (
    function() {
      $(this).stop().animate({"opacity": "0"}, "slow");
    },
    function() {
      $(this).stop().animate({"opacity": "1"}, "slow");
    }
  );

  if (g_useFacebook) {
    /* Brag Button */
    var bragButton = document.createElement('div');
    bragButton.className = 'menu_item';
    bragButton.id = 'brag_button';
    bragButton.style.top = "285px";
    bragButton.style.left = "0px";
    bragButton.style.zIndex = "10";
    bragButton.setAttribute('onclick', 'javascript:sendBrag()');
    bragButton.style.backgroundImage = "url('images/button_brag.png')";
    menuContainer.appendChild(bragButton);

    var bragButtonHover = document.createElement('div');
    bragButtonHover.className = 'menu_item';
    bragButtonHover.id = 'brag_button_hover';
    bragButtonHover.style.top = "285px";
    bragButtonHover.style.left = "0px";
    bragButtonHover.style.backgroundImage = "url('images/button_brag_hot.png')";
    menuContainer.appendChild(bragButtonHover);

    $("#brag_button").hover (
      function() {
        $(this).stop().animate({"opacity": "0"}, "slow");
      },
      function() {
        $(this).stop().animate({"opacity": "1"}, "slow");
      }
    );


    /* Challenge Button */
    var challengeButton = document.createElement('div');
    challengeButton.className = 'menu_item';
    challengeButton.id = 'challenge_button';
    challengeButton.style.top = "382px";
    challengeButton.style.left = "0px";
    challengeButton.style.zIndex = "10";
    challengeButton.setAttribute('onclick', 'javascript:sendChallenge()');
    challengeButton.style.backgroundImage = "url('images/button_challenge.png')";
    menuContainer.appendChild(challengeButton);

    var challengeButtonHover = document.createElement('div');
    challengeButtonHover.className = 'menu_item';
    challengeButtonHover.id = 'challenge_button_hover';
    challengeButtonHover.style.top = "382px";
    challengeButtonHover.style.left = "0px";
    challengeButtonHover.style.backgroundImage = "url('images/button_challenge_hot.png')";
    menuContainer.appendChild(challengeButtonHover);

    $("#challenge_button").hover (
      function() {
        $(this).stop().animate({"opacity": "0"}, "slow");
      },
      function() {
        $(this).stop().animate({"opacity": "1"}, "slow");
      }
    ); 

    FB.getLoginStatus(function(response) {
          if (response.status === 'connected') {
            gPlayerFBID = response.authResponse.userID;
            
            // Register this user with the server
            console.log("Registering player with server");
            
            if (!processIncomingURL()) {
                  
              welcomePlayer(gPlayerFBID);
              showScores();
            }
          }
    });

  } else {
    welcomePlayer(null);
  } 
}

function updatePlayerUI() {
  $('.player_bombs').html(gPlayerBombs);
  $('.player_coins').html(gPlayerCoins);
}

function welcomePlayer(uid) {
    console.log("Welcoming player");
    var welcomeMsgContainer = document.createElement('div');
    welcomeMsgContainer.id = 'welcome_msg_container';
    stage.appendChild(welcomeMsgContainer);

    if (g_useFacebook) {
      FB.api('/me?fields=first_name', function(response) {
          var welcomeMsg = document.createElement('div');
          var welcomeMsgStr = 'Welcome, ' + response.first_name + '!';
          welcomeMsg.innerHTML = welcomeMsgStr;
          welcomeMsg.id = 'welcome_msg';
          welcomeMsgContainer.appendChild(welcomeMsg);

          var imageURL = 'https://graph.facebook.com/' + uid + '/picture?width=256&height=256';
          var profileImage = document.createElement('img');
          profileImage.setAttribute('src', imageURL);
          profileImage.id = 'welcome_img';
          profileImage.setAttribute('height', '148px');
          profileImage.setAttribute('width', '148px');
          welcomeMsgContainer.appendChild(profileImage);
      });

      gPlayerBombs = 5;
      gPlayerCoins = 100;
          
      updatePlayerUI();

      var coinsDisplay = document.createElement('div');
      coinsDisplay.className  = 'stats_display';
      coinsDisplay.style.top  = '100px';
      coinsDisplay.style.left = '180px';
      welcomeMsgContainer.appendChild(coinsDisplay);
      
      var coinsIcon = document.createElement('img');
      coinsIcon.setAttribute('src', 'images/coin40.png');
      coinsDisplay.appendChild(coinsIcon);
      
      var coinsNumber = document.createElement('span');
      coinsNumber.className   = 'player_coins';
      coinsNumber.innerHTML   = gPlayerCoins;
      coinsDisplay.appendChild(coinsNumber);
      
      var bombsDisplay = document.createElement('div');
      bombsDisplay.className  = 'stats_display';
      bombsDisplay.style.top  = '100px';
      bombsDisplay.style.left = '270px';
      welcomeMsgContainer.appendChild(bombsDisplay);
      
      var bombsIcon = document.createElement('img');
      bombsIcon.setAttribute('src', 'images/bomb40.png');
      bombsDisplay.appendChild(bombsIcon);
      
      var bombsNumber = document.createElement('span');
      bombsNumber.className   = 'player_bombs';
      bombsNumber.innerHTML   = gPlayerBombs;
      bombsDisplay.appendChild(bombsNumber);

      var buyBombDisplay = document.createElement('div');
      buyBombDisplay.className  = 'buy_bomb';
      buyBombDisplay.style.top  = '100px';
      buyBombDisplay.style.left = '360px';
      buyBombDisplay.style.cursor = 'pointer';
      welcomeMsgContainer.appendChild(buyBombDisplay);
      
      var buyBombIcon = document.createElement('img');
      buyBombIcon.setAttribute('src', 'images/buybomb40.png');
      buyBombDisplay.appendChild(buyBombIcon);

      buyBombDisplay.onclick = function() {
        if(gPlayerCoins >= 100) {
          gPlayerCoins -= 100;
          gPlayerBombs++;
          updatePlayerUI();
        } else {
          alert('Not enough coins to buy a bomb!');
        }
      };
      
    } else {
          var welcomeMsg = document.createElement('div');
          var welcomeMsgStr = 'Welcome, Player!';
          welcomeMsg.innerHTML = welcomeMsgStr;
          welcomeMsg.id = 'welcome_msg';
          welcomeMsgContainer.appendChild(welcomeMsg);
    }
    

    var welcomeSubMsg = document.createElement('div');
    welcomeSubMsg.innerHTML = 'Let\'s smash some friends!';
    welcomeSubMsg.id = 'welcome_submsg';
    welcomeMsgContainer.appendChild(welcomeSubMsg);
  }

function processIncomingURL() {
  var startedGame = false;
  var urlParams = {};

  (function () {
      var match,
          pl     = /\+/g,  // Regex for replacing addition symbol with a space
          search = /([^&=]+)=?([^&]*)/g,
          decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
          query  = window.location.search.substring(1);

      while (match = search.exec(query))
         urlParams[decode(match[1])] = decode(match[2]);
  })();

  var requestType = urlParams["app_request_type"];
  
  if (requestType == "user_to_user") {
    var requestID = urlParams["request_ids"]; 
    startedGame = true;

    FB.api(requestID, function(response) {
        console.log(response);
        var gChallengerID = response.from.id;
        var gChallengerName = response.from.name.split(" ")[0];
        startGame(gChallengerID, gChallengerName);
    });
  }

  var feedStorySender = urlParams["challenge_brag"];

  if (feedStorySender) {
    startedGame = true;
      FB.api(feedStorySender, function(response) {
        console.log(response);
        var gChallengerName = response.first_name;
        startGame(feedStorySender, gChallengerName);
    });
  }

  console.log("Parsed log with a result of: " + startedGame);

  return startedGame;
}

function showScores() {
  
  var scoreboardContainer = document.createElement('div');
  scoreboardContainer.id = 'scoreboard_container';
  stage.appendChild(scoreboardContainer);

  var scoreboardHeader = document.createElement('div');
  scoreboardHeader.className = 'scoreboard_header';
  scoreboardContainer.appendChild(scoreboardHeader);

  var scoresEndpoint = '/' + appId + '/scores?fields=user.first_name,score';

  FB.api(scoresEndpoint, function(response) {
    for(var i = 0; i < response.data.length; i++) {

      var scoreboardEntry = document.createElement('div');
      scoreboardEntry.className = 'scoreboard_entry';

      var scoreboardEntryRank = document.createElement('div');
      scoreboardEntryRank.className = 'scoreboard_entry_rank';
      scoreboardEntryRank.innerHTML = (i+1) + ".";
      scoreboardEntry.appendChild(scoreboardEntryRank);

      var scoreboardEntryName = document.createElement('div');
      scoreboardEntryName.className = 'scoreboard_entry_name';
      scoreboardEntryName.innerHTML = response.data[i].user.first_name;
      scoreboardEntry.appendChild(scoreboardEntryName);

      var scoreboardEntryScore = document.createElement('div');
      scoreboardEntryScore.className = 'scoreboard_entry_score';
      scoreboardEntryScore.innerHTML = "Score: " + response.data[i].score;
      scoreboardEntry.appendChild(scoreboardEntryScore);

      var scoreboardEntryImage = document.createElement('img');
      scoreboardEntryImage.setAttribute('src', "https://graph.facebook.com/" + response.data[i].user.id + "/picture?width=128&height=128");
      scoreboardEntryImage.className = 'scoreboard_entry_image';
      scoreboardEntry.appendChild(scoreboardEntryImage);

      var scoreboardEntryChallengeButton = document.createElement('img');
      scoreboardEntryChallengeButton.setAttribute('src', "images/button_scoreboardchallenge.png");
      scoreboardEntryChallengeButton.className = 'scoreboard_entry_challengebutton';
      
      scoreboardEntryChallengeButton.onclick = (function() {
        var fbid = response.data[i].user.id;
        var first_name = response.data[i].user.first_name;
        return function() {
          startGame(fbid, first_name);
        } 
      })();
      scoreboardEntry.appendChild(scoreboardEntryChallengeButton);

      scoreboardContainer.appendChild(scoreboardEntry);
    }
  });
}

function sendChallenge() {
  
  var challengeData = {"challenge_score" : gScore};

  if (gScore) {
    FB.ui({method: 'apprequests',
      title: 'Friend Smash Challenge!',
      message: 'I just smashed ' + gScore + ' friends! Can you beat it?',
      data: challengeData
    }, fbCallback);
  }
  else {
    FB.ui({method: 'apprequests',
      title: 'Play Friend Smash with me!',
      message: 'Been having a smashing time playing Friend Smash, come check it out.',
    }, fbCallback);
  }
}

function sendOG() {
  console.log("Sending custom OG story...");

  FB.api('/me/'+appNamespace+':smash?profile=' + gFriendID, 'post', {}, function(response) {
    console.log(response);
  });
}

function sendBrag() {    
  if (gScore) {
    FB.ui({ method: 'feed',
      caption: 'I just smashed ' + gScore + ' friends! Can you beat it?',
      picture: 'http://www.friendsmash.com/images/logo_large.jpg',
      name: 'Checkout my Friend Smash greatness!',
      link: 'http://apps.facebook.com/'+appNamespace+'/?challenge_brag=' + gPlayerFBID
    }, fbCallback);
  }
}

function sendScore() {
  if (gScore) {
    console.log("Posting score to Facebook");
    FB.api('/me/scores/', 'post', { score: gScore }, function(response) {
      console.log("Score posted to Facebook");
    });
  }
}

function sendAchievement(kAchievement) {

  var achievementURLs = Array();
  achievementURLs[0] = 'http://apps.facebook.com/'+appNamespace+'achievement_50.html';
  achievementURLs[1] = 'http://apps.facebook.com/'+appNamespace+'achievement_100.html';
  achievementURLs[2] = 'http://apps.facebook.com/'+appNamespace+'achievement_150.html';
  achievementURLs[3] = 'http://apps.facebook.com/'+appNamespace+'achievement_200.html';
  achievementURLs[4] = 'http://apps.facebook.com/'+appNamespace+'achievement_x3.html';

  FB.api('/me/scores/', 'post', { achievement: achievementURLs[kAchievement] }, function(response) {
    console.log("Achievement posted");
  });
}



function displayMenu(display) {
  if (display == true) {

    if (!document.getElementById('welcome_msg_container')) {
      welcomePlayer(gPlayerFBID);
    }
    else {
      document.getElementById('welcome_msg_container').style.display = 'block';
    }

    document.getElementById('menu_container').style.display = 'block';
    
    document.getElementById('menu_shim').style.display = 'block';
    
    if (document.getElementById('ingame_scoreText')) {
      document.getElementById('ingame_scoreText').style.display = 'none';
    }
    if (document.getElementById('ingame_smashText')) {
      document.getElementById('ingame_smashText').style.display = 'none';
    }

    for (var j=0; j<gLifeImages.length; j++) {
          gLifeImages[j].style.display = 'none';
    }

    for (var j=0; j<gBombImages.length; j++) {
          gBombImages[j].style.display = 'none';
    }    

    if (g_useFacebook) {
      showScores();
    }
  }
  else {
    
    if (document.getElementById('menu_container')) {
      document.getElementById('menu_container').style.display = 'none';
    }

    if (document.getElementById('welcome_msg_container')) {
      document.getElementById('welcome_msg_container').style.display = 'none';  
    }


    document.getElementById('menu_shim').style.display = 'none';

    $("#scoreboard_container").detach();

    if (document.getElementById('ingame_scoreText')) {
      document.getElementById('ingame_scoreText').style.display = 'block';
    }
    if (document.getElementById('ingame_smashText')) {
      document.getElementById('ingame_smashText').style.display = 'block';
    }
  }
}

function startGame(fbid, name) {
    initGame(fbid, name, Math.min(3, gPlayerBombs));
    displayMenu(false, true);
}

function fbCallback(response) {
  console.log(response);
}

function showPopUp(options) {
  options       = options || {};
  var img_src   = options.img || false;
  var titleMsg  = options.title || "";
  var callback  = options.callback || null; 
  
  var background = document.createElement('div');
  background.id         = 'modal_background';
  stage.appendChild(background);
  
  var container = document.createElement('div');
  container.id      = 'pop_up';
  stage.appendChild(container);
  
  var closeButton = document.createElement('div');
  closeButton.id    = 'close_button';
  closeButton.setAttribute('onclick', 'javascript:closePopUp('+callback+')');
  stage.appendChild(closeButton);
  
  var header = document.createElement('div');
  container.appendChild(header);
  
  if(img_src) {
    var image = document.createElement('img');
    image.setAttribute('src', 'images/'+img_src);
    header.appendChild(image);
  }
  
  var title = document.createElement('h1');
  title.innerHTML  = titleMsg;
  header.appendChild(title);
  
  var content = document.createElement('div');
  content.style.position  = 'absolute';
  content.style.top       = '75px';
  content.style.width     = '100%';
  container.appendChild(content);
  
  $(background).animate({'opacity': 1}, 'fast');
  $(container).animate({'opacity': 1}, 'normal');
  $(closeButton).animate({'opacity': 1}, 'normal');
  
  return content;
}

function closePopUp(callback) {
  $('#modal_background').animate({'opacity': 0}, 'normal', function(){ $('#modal_background').remove(); if(callback) callback();});
  $('#pop_up').animate({'opacity': 0}, 'fast', function(){ $('#pop_up').remove()});
  $('#close_button').animate({'opacity': 0}, 'fast', function(){ $('#close_button').remove()} );
}