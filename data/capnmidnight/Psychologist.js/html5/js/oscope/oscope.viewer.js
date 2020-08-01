var ctrls = findEverything(),
    formState = getSetting("formState"),
	prog = new LoadingProgress(
		"manifest/js/oscope/oscope.viewer.js",
		"lib/socket.io.js",
		"js/WebRTCSocket.js",
		displayProgress,
		postScriptLoad);


function displayProgress(file){
    ctrls.status.innerHTML = fmt(
        "Loading, please wait... $1 $2", 
        file, 
        prog.makeSize(FileState.STARTED | FileState.ERRORED | FileState.COMPLETE , "progress")
    );
}

function postScriptLoad(){
    var SLIDE_SPEED = 40,
        webSocket = io.connect(document.location.hostname, {
            "reconnect": true,
            "reconnection delay": 1000,
            "max reconnection attempts": 60
        }),
        socket = new WebRTCSocket(webSocket),
        gScope = ctrls.scope.getContext("2d"),
        gNames = ctrls.names.getContext("2d"),        
        valueState = {},
        min = Number.MAX_VALUE, lastMin = Number.MAX_VALUE,
        max = Number.MIN_VALUE, lastMax = Number.MIN_VALUE,
        lt = 0, accum = 0;

    socket.connect("oscope");

    function lerp(v){
        if(min === max){
            return ctrls.scope.height / 2;
        }
        else{
            return (v - min) * ctrls.scope.height / (max - min);
        }
    }
    
    function animate(t){
        requestAnimationFrame(animate);
        dt = (t - lt) * 0.001;
        lt = t;
        accum += dt;
        lastMin = min;
        lastMax = max;
        for(var key in valueState){
            var value = valueState[key];
            min = Math.min(min, value.current);
            max = Math.max(max, value.current);
        }
        
        var x = Math.round(SLIDE_SPEED * dt);
        gScope.save();
        gScope.scale(1, (lastMax - lastMin) / (max - min));
        gScope.translate(0, lastMin - min);
        gScope.drawImage(ctrls.scope, x, 0);
        gScope.restore();
        gScope.fillStyle = "slategrey";
        gScope.fillRect(0, 0, x, ctrls.scope.height);
        if(accum >= 1){
            accum -= 1;
            gScope.strokeStyle = "white";
            gScope.beginPath();
            gScope.moveTo(0, 0);
            gScope.lineTo(0, ctrls.names.height);
            gScope.stroke();
        }

        gNames.clearRect(0, 0, ctrls.names.width, ctrls.names.height);
        gNames.fillStyle = "white";
        gNames.textAlign = "right";
        gNames.textBaseline = "top";
        gNames.fillText(max, ctrls.names.width, 0);
        gNames.textBaseline = "bottom";
        gNames.fillText(min, ctrls.names.width, ctrls.names.height);
        var output = "";
        for(var key in valueState){
            var value = valueState[key];
            output += fmt("[$1] $2.00000<br>", key, value.current);
            if(value.last !== null && value.last !== undefined){
                var y = ctrls.scope.height - lerp(value.current);
                gScope.strokeStyle = value.color;
                gScope.beginPath();
                gScope.moveTo(0, y);
                gScope.lineTo(x, ctrls.scope.height - lerp(value.last));
                gScope.stroke();
                gNames.textBaseline = "middle";
                gNames.textAlign = "right";
                gNames.fillStyle = value.color;
                gNames.fillText(fmt("[$1] $2.00000", key, value.current), ctrls.names.width, y);
            }
            value.last = value.current;
        }
        ctrls.currentValues.innerHTML = output;
    }

    var colors = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff"
    ];

    function setValue(value){
        if(valueState[value.name] === null
            || (valueState[value.name] === undefined)){
            var c = "#ffffff";
            if(colors.length > 0){
                c = colors.shift();
            }
            valueState[value.name] = {
                color: c
            };
        }
        valueState[value.name].current = value.value;
    }
    
    socket.on("value", setValue);  

    gScope.fillStyle = "#ffffff";
    gScope.lineWidth = 2;
    gNames.font = "12px Arial";
    ctrls.status.style.display = "none";
    requestAnimationFrame(animate);
}

prog.start();