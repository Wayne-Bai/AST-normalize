/*
A scene is fed to a renderer. It contains SCENE CLASSES, which can be found in scene.js.

Anything being put in a scene must have a .position argument, which is an instance of the OnScenePosition class (found in math.js).
The position is a 3D vector, and the z determines in which order will the internals be drawn. Objects with lower z get drawn first.
*/

Irenic.Scene = function(args)
{
    var scene = this;

    //Here, all the visuals go. Depending on the type.
    scene.internals = args.internals || 
    {
        "draw": [],
        "light": [],
        "effect": [],
    };
    
    scene.position = args.position || new Irenic.Vector2D({"x": 0, "y": 0}); //This probably shouldn't need to change much.
    scene.phi = args.phi || 0; //Scene's rotation. Rotates around scene.position. Not supported at the moment.
    scene.alpha = args.alpha || 1; //The global alpha of the scene. When rendering occurs, all subsequent alphas are multiplied by this one.
    scene.needsSort = args.needsSort || false;
    
    scene.settings = new Irenic.Settings(Irenic.defaultSceneSettings); //The settings object, has values that influence various timers, etc...
    scene.settings.applySettings(args.settings); //Override it (the settings object) with anything the user might've provided.   
    
    scene.updateHandler = new Irenic.UpdateHandler({});
}

Irenic.Scene.prototype.empty = function()
{
    var scene = this;

    scene.internals =
    {
        "draw": [],
        "light": [],
        "effect": [],
    };
}

//<UpdateHandler facade>
Irenic.Scene.prototype.update = function(currentTime)
{
    var scene = this;

    return scene.updateHandler.update(currentTime);
}

Irenic.Scene.prototype.addUpdate = function(update)
{
    var scene = this;

    return scene.updateHandler.add(update);
}
//</UpdateHandler facade>

//Lower z's get drawn first, so sort from lower to higher z.
Irenic.Scene.prototype.sortByZ = function()
{
    var scene = this;
    
    scene.internals.sort(function(a, b)
    {
        return a.position.z - b.position.z;
    });
}

//Add an instance of a scene class (Drawable, ParticleSystem, Light2D, Map, etc...) to the scene.
Irenic.Scene.prototype.add = function(ob)
{
    var scene = this;
    
    var draw = false;

    switch (scene.settings.typeCheck(ob))
    {
        case "draw":
            scene.addDrawable(ob);
            break;
            
        //Support for other types!
    }
}


Irenic.Scene.prototype.addDrawable = function(ob) //Add something that can be directly drawn by the renderer.
{
    
    var scene = this;
    var location = scene.internals.draw; //As the actual location might change...

    if (location.length != 0)
    {   
        var didNotAdd = true;    
    
        for (var i = 0; i < location.length; i ++)
        {
            if (ob.position.z <= location[i].position.z)
            {
                buff1 = location.slice(0, i);
                buff2 = location.slice(i, location.length);
                
                buff1.push(ob);

                //Empty the array and fill it with the new elements.
                location.splice(0, location.length);
                location.push.apply(location, buff1.concat(buff2));    
    
                didNotAdd = false;
                break;
            }
        }

        if (didNotAdd)
        {
            location.push(ob);
        }
    }
    else
    {
        location.push(ob);
    }
}



//Finds and removes a given object. Returns true if successful, false if unsuccessful.
Irenic.Scene.prototype.remove = function(ob)
{
    var scene = this;
    
    for (var i = 0; i < scene.internals.length; i ++)
    {
        if (scene.internals[i] == ob)
        {
            scene.splice(i, 1);
            return true;
        }
    }
    
    return false; //In case there were no layers in the scene at all, or if the object specified could not be found, return false.
}

//Starts increasing the global scene alpha, lasts [t] milliseconds.
Irenic.Scene.prototype.up = function(t, cb)
{
    var scene = this;

    //If the scene is trying to both raise it's alpha and decrease it, it ends up in an infinite loop.
    if (scene.downing)
    {
        scene.downing.stop();
    }

    var updateArgs =
    {
        "t": t/scene.settings.sceneAlphaUpdatePS,
        "f": function()
             {
                  scene.alpha += 1/(t/scene.settings.sceneAlphaUpdatePS);
             
                 //The alpha can maximally be 1, so when it reaches over 1...
                 if (scene.alpha > 1)
                 {
                     scene.alpha = 1; //Set it to 1.
                     scene.upping.stop();
                     scene.upping = undefined;
                     cb(); //Call the callback.
                 }
            }
    }

    scene.upping = new Irenic.Update(updateArgs);

    scene.addUpdate(scene.upping);
}

//Starts decreasing the global scene alpha, lasts [t] milliseconds.
Irenic.Scene.prototype.down = function(t, cb)
{
    var scene = this;
    
    //If the scene is trying to both raise it's alpha and decrease it, it ends up in an infinite loop.
    if (scene.upping)
    {
        scene.upping.stop();
    }

    var updateArgs = 
    {
        "t": t/scene.settings.sceneAlphaUpdatePS,
        "f": function(timePassed)
             {
                 scene.alpha -= 1/(t/scene.settings.sceneAlphaUpdatePS);
 
                 if (scene.alpha < 0)
                 {
                     scene.alpha = 0;
                     scene.downing.stop(); //This referes to the update object.
                     scene.downing = undefined;
                     cb();
                 }
             }
    };
    
    scene.downing = new Irenic.Update(updateArgs);

    scene.addUpdate(scene.downing);
}

