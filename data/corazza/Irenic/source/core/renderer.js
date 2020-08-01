/*
The renderer is a class that has access to the context. It's .render method takes in a scene and a camera as input and then renders the whole scene through the view of the camera.
*/


Irenic.Renderer = function(args)
{
    var renderer = this;

    renderer.canvas = args.canvas; //document.getElementById("canvas");
    renderer.context = renderer.canvas.getContext("2d");
    renderer.width = args.width || renderer.canvas.width; //Should be the width of the canvas element.
    renderer.height = args.height || renderer.canvas.height; //Should be the height of the canvas element.   
    renderer.last = new Date().getTime(); //Used for FPS.
    renderer.saveStack = 0
    
    renderer.settings = new Irenic.Settings(Irenic.defaultRendererSettings);
    renderer.settings.applySettings(args.settings);

    renderer.context.globalAlpha = 1; //This is 1 by default, if it hasn't been tempered with.
    renderer.resize(renderer.width, renderer.height);
    
    /*renderer.context.save = (function()
    {
        var original = renderer.context.save;
        
        return function()
        {
            renderer.saveStack ++;
            original.call(renderer.context);
        }
    })();

    renderer.context.restore = (function()
    {
        var original = renderer.context.restore;

        return function()
        {
            renderer.saveStack --;
            original.call(renderer.context);
        }
    })();*/
}

//Returns a string describing the graphical internal in a scene. Eg. "draw", "light", "effect"...
Irenic.Renderer.prototype.describe = function(ob)
{
    var renderer = this;

    if (ob instanceof Irenic.Drawable || ob instanceof Irenic.Tile || ob instanceof Irenic.Map || ob instanceof Irenic.ParticleEmitter)
    {
        return "draw";
    }
}

Irenic.Renderer.prototype.resize = function(x, y)
{
    var renderer = this;

    renderer.width = x;
    renderer.canvas.width = x;
    
    renderer.height = y;
    renderer.canvas.height = y;
}

Irenic.Renderer.prototype.clear = function()
{
    var renderer = this;
    
    var oldAlpha = renderer.context.globalAlpha;
    var oldFillStyle = renderer.context.fillStyle;
    
    renderer.context.globalAlpha = 1;
    renderer.context.fillStyle = renderer.settings.fillStyle;
    renderer.context.fillRect(0, 0, renderer.width, renderer.height);
    
    renderer.context.globalAlpha = oldAlpha;
    renderer.context.fillStyle = oldFillStyle;
}

//Accepts a scene and a camera object, draws everything on it.
Irenic.Renderer.prototype.render = function(scene, camera)
{
    var renderer = this;
    
    //Erase everything.
    renderer.clear();
    
    timePassed = new Date().getTime() - renderer.last;
    renderer.last = new Date().getTime();
    renderer.FPS = 1000/timePassed;

    if (camera.phi != 0 || scene.phi != 0 || camera.scale != 1)
    {
        renderer.context.save(); //Save the context state so it can be retrieved later (after the frame has finished rendering).
    }
    
    //Zoom.
    if (camera.scale != 1)
    {
        renderer.context.scale(camera.zoom, camera.zoom);
    }
    
    if (camera.phi != 0 || scene.phi != 0)
    {
        renderer.context.translate(renderer.width/2, renderer.height/2); //Get the context in the center of the canvas, so it can be rotated normally.

        //Rotate by -camera.phi (when you turn the camera around, the world actually "turns" in the other direction).
        if (camera.phi != 0)
        {
            renderer.context.rotate(-camera.phi);
        }    
        
        if (scene.phi != 0)
        {
            renderer.context.rotate(scene.phi);
        }
        
        renderer.context.translate(-renderer.width/2, -renderer.height/2); //After being rotated, get the context back to its previous position.
    }     
 
    
    //If the camera is following something, and that something isn't at the camera's position (aka it has been moved)...
    if (camera.following && (camera.position.x != camera.following.position.x + camera.following.picture.width/2 || camera.position.y != camera.following.position.y + camera.following.picture.height/2))
    {
        camera.center(camera.following); //Center the camera on that something.
    }
    
    //If the scene needs sorting, sort it by the z axis.
    if (scene.needsSort)
    {
        scene.sortByZ();
        scene.needsSort = false;
    }
    
    renderer.context.globalAlpha = scene.alpha;

    //Iterate through the scene's internals.draw...    
    for (var i = 0; i < scene.internals.draw.length; i ++)
    {        
        var ob = scene.internals.draw[i]; //The object that we want rendered.
        var warn = false;
        
        if (ob instanceof Irenic.ParticleEmitter)
        {
            warn = true;
        }
        
        var shortcut = ob.picture || ob;
        var position = [ob.position.x + scene.position.x - (camera.position.x - renderer.canvas.width/2*(1/camera.zoom)), ob.position.y + scene.position.y - (camera.position.y - renderer.height/2*(1/camera.zoom))];
        var render = false;

        if (ob instanceof Irenic.ParticleEmitter || (position[0] < renderer.width*(1/camera.zoom) && position[1] < renderer.height*(1/camera.zoom) && position[0] + shortcut.width*(1/camera.zoom) > 0 && position[1] + shortcut.height*(1/camera.zoom) > 0))
        {
            render = true;
        }
        
        if (render)
        {
            shortcut.draw({"position": position, "context": renderer.context});
        }
    }
    
    //Apply shadows.
    //Apply filters/shaders/after effects.

    if (camera.phi != 0 || scene.phi != 0 || camera.scale != 1)
    {
        renderer.context.restore();
    }
}




