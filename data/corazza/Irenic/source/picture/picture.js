//A wrapper for the HTML5 image object.
Irenic.Picture = function(args)
{
    var picture = this;
    
    picture.image = args.image; //HTML5 image object.
    picture.phi = args.phi || 0; //Local phi.
    picture.alpha = args.alpha || 1; //Local alpha.
    picture.width = picture.image.width;
    picture.height = picture.image.height;
    picture.r = Math.sqrt(picture.width*picture.width + picture.height*picture.height)/2; //Useful for colissions.
}

Irenic.Picture.prototype.draw = function(args) //context, position[, phi, alpha]
{
    var picture = this;
    
    if (picture.image) //There is a possibility that the image is blank (tiles, for example.)
    {
        var position = args.position; //This is the correctly translated position according to the camera.
        
        var phi = args.phi || 0;
        phi += picture.phi;
        
        var alpha = args.alpha || 1;
        alpha *= picture.alpha;
        
        var context = args.context;

        //Rendering.
        context.save(); //Save the context state, we're about to change it a lot.

        context.globalAlpha *= alpha; //A scene might've already assigned an alpha, we would be messing with it if we just overrid it.     
        
        context.translate(position[0] + picture.width/2, position[1] + picture.height/2); //Translate the context to the center of the image.
        context.rotate(phi);
        //context.drawImage(picture.image, Math.floor(-picture.width/2) + 0.5, Math.floor(-picture.height/2) + 0.5);
        context.drawImage(picture.image, -picture.width/2, -picture.height/2);

        context.restore(); //Get the state back.
    }
}

Irenic.Picture.prototype.getImage = function()
{
    return this.image;
}

//Returns a rectangle in a relative coordinate system (used to make shapes).
//[NEEDS TO RETURN A POLYGON!!!]
Irenic.Picture.prototype.getRect = function()
{
    var picture = this;

    return 
    [
        new Irenic.Vector2D({"x": -picture.width/2, "y": -picture.height/2}),
        new Irenic.Vector2D({"x": picture.width/2, "y": -picture.height/2}),
        new Irenic.Vector2D({"x": picture.width/2, "y": picture.height/2}),
        new Irenic.Vector2D({"x": -picture.width/2, "y": picture.height/2}),
    ];
}
