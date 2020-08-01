var keyBoardInput = {
    //creates keyboard listener
    initialize: function () {
        this.bind_keys();
    },

    bind_keys: function () {
        //called whenever a key is pressed
        window.onkeydown = function (e) {
            if(e.keyCode === 13) {
                //restarts game if you press enter while the game is paused
                if (game.status === 'pause') {
                    pause.restart();
                }
            } else if(e.keyCode === 27) {
                //exits to main menu if you press escape while the game is paused
                if (game.status === 'pause') {
                    pause.exit();
                }
                //exits to main menu if you press escape while in the finish screen
                else if (game.status === 'finish') {
                    finish.skip();
                }
            } else if(e.keyCode === 32) {
                if (game.status === 'finish') {
                    //restarts game if you press space while in the finish screen
                    finish.restart();
                } else if(game.status === 'menu') {
                    //starts game when space key is pressed in menu
                    menu.start();
                } else if (game.status === 'pause') {
                    //upauses game when space key is pressed in pause menu
                    pause.play();
                } else if (game.status === 'play') {
                    //pauses game when space key is pressed in game
                    theKey.pause();
                }
            }
            //passes in the letter pressed
            else if(e.keyCode >= 65 && e.keyCode < 91) {
                if (game.status === 'play') {
                    theKey.keyPressed(e.keyCode - 65);
                }
            }
        };
    }
};
