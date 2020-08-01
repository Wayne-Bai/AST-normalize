var createGame = require('voxel-engine');
var voxel = require('voxel');
var game = createGame({
    generate: voxel.generator['Valley'],
    texturePath: '/textures/'
});
game.appendTo('#container');

var createPlayer = require('voxel-player')(game);
var substack = createPlayer('substack.png');
substack.possess();

window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        substack.toggle();
    }
});

var createSpider = require('../')(game);

for (var i = 0; i < 20; i++) (function (spider) {
    spider.position.y = 200;
    spider.position.x = Math.random() * 300 - 150;
    spider.position.z = Math.random() * 300 - 150;
    
    spider.on('block', function () { spider.jump() });
    spider.notice(substack, { radius: 500 });
    
    spider.on('notice', function (player) {
        spider.lookAt(player);
        spider.move(0, 0, 0.5);
    });
    
    spider.on('frolic', function (player) {
        spider.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
        spider.move(0, 0, 0.5 * Math.random());
    });
    
    spider.on('collide', function (player) {
        console.log('COLLISION');
    });
})(createSpider());
