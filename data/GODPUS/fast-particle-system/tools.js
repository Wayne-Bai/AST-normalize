var particles, image, WIDTH, HEIGHT, NUM_PROPERTIES, DAMPING, TRAIL_DAMPING, workerIndex;
var i, x, y, vx, vy, prevX, prevY, prevIndex, currentIndex, colorIndex, n1, n2, n3, n4, n5, n6, n7, n8, neighborsAverageX, neighborsAverageY

function setGlobals(_particles, _image, _WIDTH, _HEIGHT, _NUM_PROPERTIES, _DAMPING, _TRAIL_DAMPING, _workerIndex){
    particles = _particles;
    image = _image;
    WIDTH = _WIDTH;
    HEIGHT = _HEIGHT;
    NUM_PROPERTIES = _NUM_PROPERTIES;
    DAMPING = _DAMPING;
    TRAIL_DAMPING = _TRAIL_DAMPING;
    workerIndex = _workerIndex;
}

function process(){

	for(i = 0; i < particles.length; i+= NUM_PROPERTIES){
        x = particles[i]
        y = particles[i+1];
        vx = particles[i+2];
        vy = particles[i+3];
        prevX = particles[i+4];
        prevY = particles[i+5];

        if(x > 2 && x < WIDTH-2 && y > 2 && y < HEIGHT-2)
        {   
            /*
            prevIndex = ((prevX | 0)+(prevY | 0)*WIDTH);
            currentIndex = ((x | 0)+(y | 0)*WIDTH);
            n1 = ((x+1 | 0)+(y+1 | 0)*WIDTH);
            n2 = ((x-1 | 0)+(y-1 | 0)*WIDTH);
            n3 = ((x-1 | 0)+(y+1 | 0)*WIDTH);
            n4 = ((x+1 | 0)+(y-1 | 0)*WIDTH);
            n5 = ((x+1 | 0)+(y | 0)*WIDTH);
            n6 = ((x-1 | 0)+(y | 0)*WIDTH);
            n7 = ((x | 0)+(y+1 | 0)*WIDTH);
            n8 = ((x | 0)+(y-1 | 0)*WIDTH);

            velocitiesX[currentIndex] = vx;
            velocitiesY[currentIndex] = vy;
            velocitiesX[prevIndex] *= TRAIL_DAMPING;
            velocitiesY[prevIndex] *= TRAIL_DAMPING;

            neighborsAverageX = (velocitiesX[n1]+velocitiesX[n2]+velocitiesX[n3]+velocitiesX[n4]+velocitiesX[n5]+velocitiesX[n6]+velocitiesX[n7]+velocitiesX[n8])/8;
            neighborsAverageY = (velocitiesY[n1]+velocitiesY[n2]+velocitiesY[n3]+velocitiesY[n4]+velocitiesY[n5]+velocitiesY[n6]+velocitiesY[n7]+velocitiesY[n8])/8;
            */

            colorIndex = ((x | 0)+(y | 0)*WIDTH)*4; //*4 for rgba
            image.data[colorIndex] = Math.abs(vx)*255;
            image.data[colorIndex+1] = Math.abs(vy)*255;
            image.data[colorIndex+2] = 255;
            image.data[colorIndex+3] = 255;

            //vx += neighborsAverageX;
            //vy += neighborsAverageY;
            //vx *= DAMPING;
            //vy *= DAMPING;
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

    return { image: image, workerIndex: workerIndex };
}