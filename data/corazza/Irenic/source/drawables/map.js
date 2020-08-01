Irenic.Tile = function(args)
{   
    var tile = this;

    Drawable.call(tile, args);
}

Irenic.Tile.prototype = Object.create(Irenic.Drawable.prototype);
Irenic.Tile.prototype.constructor = Irenic.Tile;


Irenic.Map = function(args)
{
    var map = this;
    
    map.tileSize = args.tileSize;
    map.tiles = args.tiles;
    map.position = args.position || new Irenic.Vector2D({"x": 0, "y": 0});
}

Irenic.Map.prototype.draw = function(args)
{
    var map = this;
 
    for (var y = 0; y < map.tiles.length; y ++)
    {
        for (var x = 0; x < map.tiles[y].length; x ++)
        {
            var position = [args.position.x + x*map.tileSize, args.position.y + y*map.tileSize];
            
            map.tiles[y][x].picture.draw({"position": position, "context": args.context});      
        }        
    }
}
