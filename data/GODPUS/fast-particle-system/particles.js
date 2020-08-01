if(!window.Float64Array){
    if(!window.Float32Array){
        window.Float64Array = Array;
    }else{
        window.Float64Array = window.Float32Array;
    }
}

window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame   ||
    window.mozRequestAnimationFrame      ||
    window.oRequestAnimationFrame        ||
    window.msRequestAnimationFrame       ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var canvas = document.getElementById('canvas');
canvas.width = Math.round(document.body.clientWidth);
canvas.height = Math.round(document.body.clientHeight);
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
ctx.globalCompositeOperation = 'source-over';

var mouse = { x: 0, y: 0, prevX: 0, prevY: 0, radius: 1000, isDown: false };
canvas.onmousedown = function(e){ mouse.prevX = mouse.x; mouse.prevY = mouse.y; mouse.isDown = true; }
canvas.onmouseup = function(e){ mouse.isDown = false; }
canvas.onmousemove = function(e){ mouse.x = e.x; mouse.y = e.y; }

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var CENTERX = WIDTH/2;
var CENTERY = HEIGHT/2;
var NUM_PARTICLES = 300000;
var NUM_PROPERTIES = 6;
var DAMPING = 0.7;
var TRAIL_DAMPING = 0.1;
var PAUSE = true;
var RANDOM_PLACEMENT = false;
var COUNT, particles, velocitiesX, velocitiesY;

window.onload = function() {
    var gui = new dat.GUI();
    gui.add(this, 'DAMPING', 0, 1);
    gui.add(this, 'TRAIL_DAMPING', 0, 1);

    var randomController = gui.add(this, 'RANDOM_PLACEMENT');
    randomController.onFinishChange(function(value){ PAUSE = true; });

    var numParticlesController = gui.add(this, 'NUM_PARTICLES').min(1000).max(2000000).step(10000);
    numParticlesController.onFinishChange(function(value){ PAUSE = true; });
};

function restart()
{
    particles.length = 0;
    velocitiesX.length = 0;
    velocitiesY.length = 0;

    delete particles;
    delete velocitiesX;
    delete velocitiesY;

    init();
}

function init()
{
    PAUSE = true;

    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    particles = new Float64Array(NUM_PARTICLES*NUM_PROPERTIES);
    velocitiesX = new Float64Array(WIDTH*HEIGHT);
    velocitiesY = new Float64Array(WIDTH*HEIGHT);

    COUNT = particles.length;
    var j = 0;
    var x, y;

    for(var i = 0; i < COUNT; i += NUM_PROPERTIES){
        if(RANDOM_PLACEMENT){ x = Math.random()*WIDTH; y = Math.random()*HEIGHT; }
        else{ x = CENTERX+Math.cos(j)*(j*((NUM_PARTICLES/HEIGHT)*.00001)); y = CENTERY+Math.sin(j)*(j*((NUM_PARTICLES/HEIGHT)*.00001)); }
        particles[i] = x; //x
        particles[i+1] = y; //y
        particles[i+2] = 0; //vx
        particles[i+3] = 0; //vy
        particles[i+4] = 0; //prevX
        particles[i+5] = 0; //prevY
        j++;
    }

    PAUSE = false;
    requestAnimationFrame(draw, canvas);
}

var i, x, y, vx, vy, xFloor, yFloor, prevX, prevY, angle, newColor, image, imageData, prevIndex, colorIndex, currentIndex, n1, n2, n3, n4, n5, n6, n7, n8, neighborsAverageX, neighborsAverageY;

function draw(){
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    imageData = image.data;

    if(mouse.isDown){
        angle = Math.atan2(mouse.y-mouse.prevY, mouse.x-mouse.prevX);
    
        for(var i = 0; i < mouse.radius; i++){
            x = mouse.x+(Math.cos(i)*(i*.05));
            y = mouse.y+(Math.sin(i)*(i*.05));
            currentIndex = ((x | 0)+(y | 0)*WIDTH);
            velocitiesX[currentIndex] = Math.cos(angle)*(Math.abs(mouse.x-mouse.prevX)*(mouse.radius-i))*.001;
            velocitiesY[currentIndex] = Math.sin(angle)*(Math.abs(mouse.y-mouse.prevY)*(mouse.radius-i))*.001;
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
    }

    for(i = 0, l = COUNT; i < l; i+= NUM_PROPERTIES){
        x = particles[i]
        y = particles[i+1];
        xFloor = ~~(x);
        yFloor = ~~(y);
        vx = particles[i+2];
        vy = particles[i+3];
        prevX = particles[i+4];
        prevY = particles[i+5];

        if(x > 2 && x < WIDTH-2 && y > 2 && y < HEIGHT-2)
        {   
            prevIndex = (~~(prevX)+ ~~(prevY)*WIDTH);
            currentIndex = ((xFloor)+(yFloor)*WIDTH);
            n1 = ((xFloor+1)+(yFloor+1)*WIDTH);
            n2 = ((xFloor-1)+(yFloor-1)*WIDTH);
            n3 = ((xFloor-1)+(yFloor+1)*WIDTH);
            n4 = ((xFloor+1)+(yFloor-1)*WIDTH);
            n5 = ((xFloor+1)+(yFloor)*WIDTH);
            n6 = ((xFloor-1)+(yFloor)*WIDTH);
            n7 = ((xFloor)+(yFloor+1)*WIDTH);
            n8 = ((xFloor)+(yFloor-1)*WIDTH);

            velocitiesX[currentIndex] = vx;
            velocitiesY[currentIndex] = vy;
            velocitiesX[prevIndex] *= TRAIL_DAMPING;
            velocitiesY[prevIndex] *= TRAIL_DAMPING;

            neighborsAverageX = (velocitiesX[n1]+velocitiesX[n2]+velocitiesX[n3]+velocitiesX[n4]+velocitiesX[n5]+velocitiesX[n6]+velocitiesX[n7]+velocitiesX[n8])/8;
            neighborsAverageY = (velocitiesY[n1]+velocitiesY[n2]+velocitiesY[n3]+velocitiesY[n4]+velocitiesY[n5]+velocitiesY[n6]+velocitiesY[n7]+velocitiesY[n8])/8;

            colorIndex = ((xFloor)+(yFloor)*WIDTH)*4; //*4 for rgba
            imageData[colorIndex] = Math.abs(vx)*255;
            imageData[colorIndex+1] = Math.abs(vy)*255;
            imageData[colorIndex+2] = 255;

            vx += neighborsAverageX;
            vy += neighborsAverageY;
            vx *= DAMPING;
            vy *= DAMPING;
            x += vx;
            y += vy;

            particles[i+4] = particles[i]; //prevX
            particles[i+5] = particles[i+1]; //prevY
            particles[i] = x; //x
            particles[i+1] = y; //y
            particles[i+2] = vx; //vx
            particles[i+3] = vy; //vy
        }
    }

    ctx.putImageData(image, 0, 0);
    if(!PAUSE){ requestAnimationFrame(draw, canvas); }else{ restart(); }
}

init();