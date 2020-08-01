include(0,
    ["lib/leap-0.6.3.min.js"],
function (){
var WIDTH = 640,
    HEIGHT = 480,
    HAND_COLORS = ["blue", "green"],
    FINGER_PARTS = ["tip", "dip", "pip", "mcp", "carp"],
    c = findEverything(),
    g = c.canv.getContext("2d"),
    controller = new Leap.Controller({ enableGestures: true }),
    lt = null, dt, taps = [];

c.canv.width = WIDTH;
c.canv.height = HEIGHT;
c.canv.style.width = px(c.canv.width);
c.canv.style.height = px(c.canv.height);

function E(v, f){   
    if(f){
        controller.on(v, f);
    }
    else{
        controller.on(v, console.log.bind(console, "Leap motion: " + v));
    }
}

function leapInterpolate(frame, pos){
    var b = frame.interactionBox,
        left = b.center[0] - b.width,
        top = b.center[1] + b.height,
        x = pos[0] - left,
        y = pos[1] - top;
    x *= WIDTH / (2 * b.width);
    y *= HEIGHT / (2 * b.height);
    
    return {x: x, y: -y};
}

E("connect");
E("streamingStarted");
E("streamingStopped");
E("deviceStreaming");
E("deviceStopped");
E("ready");
E("frame", function(frame){
    if(lt !== null){
        dt = (frame.timestamp - lt) * 0.000001;
    }
    lt = frame.timestamp;
        
    g.clearRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = "black";
    g.fillRect(0, 0, WIDTH, HEIGHT);
    for(var h = 0; h < frame.hands.length; ++h){
        g.fillStyle = HAND_COLORS[h];
        var hand = frame.hands[h];
        var p = leapInterpolate(frame, hand.palmPosition);
        g.fillRect(p.x, p.y, 25, 25);
        for(var f = 0; f < hand.fingers.length; ++f){
            var finger = hand.fingers[f];
            for(var i = 0; i < FINGER_PARTS.length; ++i){
                p = leapInterpolate(frame, finger[FINGER_PARTS[i] + "Position"]);
                g.fillRect(p.x, p.y, 10, 10);
            }
        }
    }
    for(var i = 0; i < frame.gestures.length; ++i){
        var gesture = frame.gestures[i];
        if(gesture.type === "keyTap"){
            taps.push(leapInterpolate(frame, gesture.position));
        }
    }
    
    while(taps.length > 10){
        taps.shift();
    }
    
    g.fillStyle = "yellow";
    for(var i = 0; i < taps.length; ++i){
        g.fillRect(taps[i].x, taps[i].y, 5, 5);
    }
});

controller.connect();

});