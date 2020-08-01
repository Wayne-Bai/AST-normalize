//A rectangle filled with color.
Irenic.Rect = function(args)
{
    var rect = this;
    
    rect.width = args.width || 10;
    rect.height = args.height || 10;
    rect.phi = args.phi || 0;
    rect.alpha = args.alpha || 1;
    rect.style = args.style || "rgb(255, 0, 0)";
}

Irenic.Rect.prototype.draw = function(args)
{
    var rect = this;

    var position = args.position; //This is the correctly translated position according to the camera.
    
    var phi = args.phi || 0;
    phi += rect.phi;
    
    var alpha = args.alpha || 1;
    alpha *= rect.alpha;
    
    var context = args.context;

    //Rendering.
    context.save(); //Save the context state, we're about to change it a lot.

    context.globalAlpha *= alpha; //A scene might've already assigned an alpha, we would be messing with it if we just overrid it.     
    
    context.translate(position[0] + rect.width/2, position[1] + rect.height/2); //Translate the context to the center of the image.
    context.rotate(phi);
    //context.drawImage(rect.image, Math.floor(-rect.width/2) + 0.5, Math.floor(-rect.height/2) + 0.5);
    context.fillStyle = rect.style;
    context.fillRect(-rect.width/2, -rect.height/2, rect.width, rect.height);

    context.restore(); //Get the state back.
}

Irenic.Rect.prototype.getRect = function()
{
    var rect = this;

    return 
    [
        new Irenic.Vector2D({"x": -rect.width/2, "y": -rect.height/2}),
        new Irenic.Vector2D({"x": rect.width/2, "y": -rect.height/2}),
        new Irenic.Vector2D({"x": rect.width/2, "y": rect.height/2}),
        new Irenic.Vector2D({"x": -rect.width/2, "y": rect.height/2}),
    ];

}
