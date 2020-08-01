ig.module(
    'plugins.tiledLoader'
)
.requires(
    'impact.game'
)
.defines(function(){


// this will find a given tile set index, or what index in the array of tile sets a given data cell belongs to
var findTileSetIndexOfDataCell = function(level, dataCell) {
    var index = 0;
    var maxGid = 0;

    for(var i=0; i<level.tilesets.length; i+=1) {
        var tileset = level.tilesets[i];

        // Once we have found a tilset that has a firstgid that is less then our datacell
        // and that firstgid is greater then any other gid we have found then we know we have found an eligible
        // tileset.  Once we have found an eligible tileset we want to track it as such and look for a more eligible one.
        if(dataCell >= tileset.firstgid && tileset.firstgid > maxGid) {
            index = i;
            maxGid = tileset.firstgid;
        }
    }

    return index;
};

// turn a Tiled layer into an ImpactJS cmopatible layer.
var convertTiledLayerIntoImpactLayers = function(level, layer) {
    var result = [];
    var i, j;

    // initialize an empty result
    for(i=0; i<level.tilesets.length; i+=1) {
        // an impact layer has the format of: {tileSet: index, data: [[], ...[]] }
        result.push({
            tileSet: i,
            data: [],
            _hasTile: false
        });
    }

    // initialize the first row
    var row = new Array(level.tilesets.length);
    for(i=0;i <level.tilesets.length; i+=1) {
        row[i] = [];
    }

    for(i=0; i<layer.data.length; i+=1) {
        var dataCell = layer.data[i];
        var tileSetIndex = findTileSetIndexOfDataCell(level, dataCell);

        // each cell inside of tiled belongs to only one layer inside of impact.  Because we are creating multiple
        // layers for each cell, we have to push 0's to all of the layers that don't belong to this tileset.
        for(j=0; j<level.tilesets.length; j+=1) {
            if(j === tileSetIndex) {
                row[j].push(dataCell - level.tilesets[tileSetIndex].firstgid + 1);
                if(dataCell !== 0) {
                    result[j]._hasTile = true;
                }
            }
            else {
                row[j].push(0);
            }
        }

        // Once the map width has been reached push the new rows onto the result array, giving us
        // multidimensional array version of the single dimensional map
        if((i+1) % layer.width === 0) {
            for(j=0; j<level.tilesets.length; j+=1) {
                result[j].data.push(row[j]);
                row[j] = [];
            }
        }
    }

    for(i=level.tilesets.length-1; i>=0; i-=1) {
        if(!result[i]._hasTile) {
            result.splice(i, 1);
        }
    }

    return result;
};

var getProperty = function(properties, property, defaultValue) {
    if(typeof properties === 'undefined') {
        return defaultValue;
    }

    if(properties.hasOwnProperty(property)) {
        var value = properties[property];
        if(isNaN(value)) {
            return value;
        }

        return parseFloat(value, 10);
    }
    else {
        return defaultValue;
    }
};

// the background will consist of all tilesets really, this includes foreground, collision and background layers.
var loadBackground = function(path, filename, level) {
    var tileSize = level.tilewidth;

    this.backgroundMaps = [];

    for(var i=0; i<level.layers.length; i+=1) {
        var layer = level.layers[i];

        // do not add layers that are invisible
        if(layer.visible === false) {
            continue;
        }

        // Process only tilelayers in this method.
        if(layer.type !== 'tilelayer') { continue; }

        var impactLayers = convertTiledLayerIntoImpactLayers(level, layer);
        if(layer.name === 'collision') {
            // a collision layer is intended to use a specialized collision graphic that has been supplied.
            // Because impactJs only supports one collision layer we will have to make an assumption that only one
            // tileset is being used, and that it is the specialized collision tileset.
            if(impactLayers.length !== 1) {
                console.log("Collision layers can only have one tileset on them, found: '" + impactLayers.length + "'");
            }
            this.collisionMap = new ig.CollisionMap(tileSize, impactLayers[0].data);
        }
        else {
            // loop through each of the imapct layers and instantiate it within the system.
            // Because a layer is created for each tile sheet that exists in the tiled json file care is taken
            // to ensure that blank layers, or layers that have nothing on them, will not be instantiated.
            for(var j=0; j<impactLayers.length; j+=1) {
                var impactLayer = impactLayers[j];

                // the tiled map editor creates all of the graphical links as relative to where the map file is
                // saved.  ImpactJS usees relative graphical links from where the HTML file is. To fix this situation
                // we can prepend the path to the level to the image path from tiled. So ../../../media/test.jpg would turn
                // into lib/game/levels/../../../media/test.jpg
                var image = path + level.tilesets[impactLayer.tileSet].image;
                var newMap = new ig.BackgroundMap(tileSize, impactLayer.data, image);
                newMap.anims = this.backgroundAnims[image] || {};
                newMap.repeat = getProperty(layer.properties, "repeat", "false") === "true";
                newMap.distance = getProperty(layer.properties, "distance", 1);
                newMap.foreground = getProperty(layer.properties, "foreground", "false") === "true";
                newMap.preRender = getProperty(layer.properties, "preRender", "true") === "true";
                newMap.name = layer.name + "_" + j;
                this.backgroundMaps.push( newMap );
            }
        }
    }
};

// load entities into the map
var loadEntities = function(level) {
    this.entities = [];
    this.namedEntities = {};

    for(var i=0; i<level.layers.length; i+=1) {
        var layer = level.layers[i];
        if(layer.type !== "objectgroup") {
            continue;
        }

        for( var j = 0; j < layer.objects.length; j++ ) {
            var ent = layer.objects[j];

            // i find it easier to just type the important part of the class, for example "Player" instead of
            // "EntityPlayer".  The following code will just prepend "Entity" if the class is not found.
            var type = ent.type;
            if(!window.hasOwnProperty(type)) {
                type = "Entity" + type;
            }

            var entity = this.spawnEntity(type, ent.x, ent.y, ent.properties);

            // position the entity if the zIndex hasn't been specified through any other means
            if(typeof ent.zIndex === "undefined") {
                ent.zIndex = i * 100;
            }
        }

    }
    this.sortEntities();
};

// process the level data from the json return, at this point level will be a JSON object.
var onDoneLoadingJSON = function(path, filename, level) {
    if(level.orientation !== "orthogonal") {
        console.log("Only supports  'orthogonal' map types.  Found: '" + level.orientation + "'");
        return;
    }

    if(level.tilewidth !== level.tileheight) {
        console.log('Tile width and height have to be the same (square)');
        return;
    }

    this.screen = {x: 0, y: 0};

    loadEntities.call(this, level);
    loadBackground.call(this, path, filename, level);

    // post init function
    for( var i = 0; i < this.entities.length; i++ ) {
        this.entities[i].ready();
    }


    // :TODO: because the resources arn't loaded we have to delay this
    // impelemnting some sort of resource loader would be cool, could also be done manually though
    var self = this;
    setTimeout(function() {
        if(ig.debug) {
            ig.debug.panels.maps.load(self);
        }
    }, 1000);

};

ig.Game.inject({
    loadTiledLevel: function(level) {
        var self = this;


        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.overrideMimeType("application/json");
        xmlHttpRequest.open('GET', 'lib/game/levels/' + level, true);
        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === 4) {
                var jsonText = xmlHttpRequest.responseText;
                onDoneLoadingJSON.call(self, 'lib/game/levels/', level, JSON.parse(jsonText));
            }
        };
        xmlHttpRequest.send(null);
    }
});


});