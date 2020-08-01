var pause = {
    //unpauses the game
    play: function () {
        theKey.newKey();
        game.status = 'play';
    },

    //restarts the game
    restart: function () {
        scoreboard.reset();
        theKey.newKey();
        game.status = 'play';
    },

    //exits to the menu
    exit: function () {
        scoreboard.reset();
        theKey.newKey();
        game.status = 'menu';
    },

    //drawing to screen
    draw: function () {
        //draw outer pause menu box
        game.ctx.fillStyle = '#000000';
        game.ctx.fillRect(280, 100, 240, 310);

        //draw pause menu title
        game.ctx.font = '45px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillStyle = '#FFFFFF';
        game.ctx.fillText('PAUSED', 400, 150);

        //draw pause menu buttons
        game.ctx.fillStyle = '#FF0000';
        game.ctx.fillRect(300, 170, 200, 60);
        game.ctx.fillRect(300, 250, 200, 60);
        game.ctx.fillRect(300, 330, 200, 60);

        //draw pause menu actions
        game.ctx.font = '30px Arial';
        game.ctx.fillStyle = '#000000';
        game.ctx.fillText('RESUME', 400, 200);
        game.ctx.fillText('RESTART', 400, 280);
        game.ctx.fillText('EXIT', 400, 360);

        //draw pause menu keys
        game.ctx.font = '15px Arial';
        game.ctx.fillText('press space', 400, 220);
        game.ctx.fillText('press enter', 400, 300);
        game.ctx.fillText('press escape', 400, 380);
    }
};
