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
  playButton.id = 'play';
  playButton.style.width = "459px";
  playButton.style.height = "112px";
  playButton.style.top = "188px";
  playButton.style.left = "0px";
  playButton.setAttribute('onclick', 'javascript:startGame(null, null)');
  playButton.style.backgroundImage = "url('images/button_play.png')";
  menuContainer.appendChild(playButton);

  if (g_useFacebook) {
    /* Brag Button */
    var bragButton = document.createElement('div');
    bragButton.className = 'menu_item';
    bragButton.id = 'brag';
    bragButton.style.width = "459px";
    bragButton.style.height = "112px";
    bragButton.style.top = "308px";
    bragButton.style.left = "0px";
    bragButton.setAttribute('onclick', 'javascript:sendBrag()');
    bragButton.style.backgroundImage = "url('images/button_brag.png')";
    menuContainer.appendChild(bragButton);

    /* Challenge Button */
    var challengeButton = document.createElement('div');
    challengeButton.className = 'menu_item';
    challengeButton.id = 'challenge';
    challengeButton.style.width = "459px";
    challengeButton.style.height = "112px";
    challengeButton.style.top = "428px";
    challengeButton.style.left = "0px";
    challengeButton.setAttribute('onclick', 'javascript:sendChallenge()');
    challengeButton.style.backgroundImage = "url('images/button_challenge.png')";
    menuContainer.appendChild(challengeButton);

  } else {
    welcomePlayer(null);
  }


  function welcomePlayer(uid) {

    var welcomeMsgContainer = document.createElement('div');
    welcomeMsgContainer.id = 'welcome_msg_container';
    stage.appendChild(welcomeMsgContainer);

    if (g_useFacebook) {

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
}

function showScores() {
  
  var scoreboardContainer = document.createElement('div');
  scoreboardContainer.id = 'scoreboard_container';
  stage.appendChild(scoreboardContainer);
        
  var scoreboardTournamentStub = document.createElement('div');
  scoreboardTournamentStub.className = 'scoreboard_tournament_stub';
  scoreboardContainer.appendChild(scoreboardTournamentStub);  


  console.log("Fetching tournament info from server");

  $.getJSON(g_api_url + "/tournament",
  function(data) {
    
    
    var tournamentEndDate = data['end_date'];
    tournamentEndDate = tournamentEndDate.replace(/:| /g,"-");
    var YMDhms = tournamentEndDate.split("-");
    var tournamentEndDateSQL = new Date();
    tournamentEndDateSQL.setFullYear(parseInt(YMDhms[0]), parseInt(YMDhms[1])-1,
                                             parseInt(YMDhms[2]));
    tournamentEndDateSQL.setHours(parseInt(YMDhms[3]), parseInt(YMDhms[4]), 
                                          parseInt(YMDhms[5]), 0/*msValue*/);


    var scoreboardTournamentStubTime = document.createElement('div');
    scoreboardTournamentStubTime.className = 'scoreboard_tournament_stub_time';
    scoreboardContainer.appendChild(scoreboardTournamentStubTime);

    this.gTournamentCountdown = setInterval(function(){

      function pad2(number) {
        return (number < 10 ? '0' : '') + number
      }

      var currentDate = new Date();
      var delta = Math.abs(currentDate-tournamentEndDateSQL);
      delta /= 1000;
      var daysRemaining = Math.floor(delta / 86400);
      var hoursRemaining = Math.floor((delta % 86400) / 3600);
      var minutesRemaining = Math.floor(((delta % 86400) % 3600) / 60);
      var secondsRemaining = Math.floor(((delta % 86400) % 3600) % 60);
      var timeRemaining = daysRemaining + " Days " + pad2(hoursRemaining) + " Hrs " + pad2(minutesRemaining) + " Mins " + pad2(secondsRemaining) + " Secs";

      scoreboardTournamentStubTime.innerHTML = timeRemaining

    }, 1000);

   
  });

  console.log("Fetching scores from server");

  $.get(g_api_url + "/scores", { fbid: gPlayerFBID, access_token: FB.getAuthResponse()['accessToken']},
  function(data) {
      
      console.log("Got scores data from server");
      console.log(data);

      for (var i=0; i<data.length; i++) 
      {
        var scoreboardStub = document.createElement('div');
        scoreboardStub.className = 'scoreboard_stub';
        scoreboardContainer.appendChild(scoreboardStub);

        var scoreboardStubRank = document.createElement('div');
        scoreboardStubRank.className = 'scoreboard_stub_rank';
        scoreboardStubRank.innerHTML = (i+1) + ".";
        scoreboardStub.appendChild(scoreboardStubRank);

        var scoreboardStubName = document.createElement('div');
        scoreboardStubName.className = 'scoreboard_stub_name';
        scoreboardStubName.innerHTML = data[i].first_name;
        scoreboardStub.appendChild(scoreboardStubName);

        var scoreboardStubScore = document.createElement('div');
        scoreboardStubScore.className = 'scoreboard_stub_score';
        scoreboardStubScore.innerHTML = "Score: " + data[i].highscore;
        scoreboardStub.appendChild(scoreboardStubScore);

        var scoreboardStubImage = document.createElement('img');
        scoreboardStubImage.setAttribute('src', "https://graph.facebook.com/" + data[i].fbid + "/picture?width=128&height=128");
        scoreboardStubImage.className = 'scoreboard_stub_image';
        scoreboardStub.appendChild(scoreboardStubImage);

        var scoreboardStubChallengeButton = document.createElement('img');
        scoreboardStubChallengeButton.setAttribute('src', "/images/button_scoreboardchallenge.png");
        scoreboardStubChallengeButton.className = 'scoreboard_stub_challengebutton';
        
        scoreboardStubChallengeButton.onclick = (function() {
          var fbid = data[i].fbid;
          var first_name = data[i].first_name;
          return function() {
            startGame(fbid, first_name);
          } 
        })();

        scoreboardStub.appendChild(scoreboardStubChallengeButton);
          
      }
  });
}

function sendChallenge() {
}

function sendOG() {
}

function sendBrag() {
}

function sendScore() {
}

function sendAchievement(kAchievement) {
}


function displayMenu(display) {
  if (display == true) {
    document.getElementById('menu_container').style.display = 'block';
    document.getElementById('welcome_msg_container').style.display = 'block';
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

    if (g_useFacebook) {
      showScores();
    }
  }
  else {
    
    document.getElementById('menu_container').style.display = 'none';
    document.getElementById('welcome_msg_container').style.display = 'none';
    document.getElementById('menu_shim').style.display = 'none';

    //clearInteval(this.gTournamentCountdown);
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
    initGame(fbid, name);
    displayMenu(false, true);
}


