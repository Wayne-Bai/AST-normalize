/* Maps.js */
// Contains functions for creating, populating, and using maps

/* Basic Map Functions */

function resetMaps() {
  var i, j, mapfunc;
  window.currentmap = [1,1];
  window.defaultsetting = { setting: "Overworld" };

  // Mapfuncs starts off such that [X][Y] is window.WorldXY, if it exists
  window.mapfuncs = new Array(9);
  // For each [i][j], if window.WorldIJ exists, it's used
  // Otherwise it will be queried via AJAX later
  for(var i = 1, j; i <= 9; ++i) {
    mapfunc = mapfuncs[i] = [0,0,0,0,0];
    for(j = mapfunc.length; j >= 0; --j)
      mapfunc[j] = window["World" + i + "" + j];
  }

  // Random maps are all window functions
  mapfuncs["Random"] = {
    Overworld:  WorldRandomOverworld,
    Underworld: WorldRandomUnderworld,
    Underwater: WorldRandomUnderwater,
    Bridge:     WorldRandomBridge,
    Sky:        WorldRandomSky,
    Castle:     WorldRandomCastle
  };

  // Right now there aren't too many special maps
  mapfuncs["Special"] = {
    Blank: BlankMap
  }

  // Maps not found, and sounds, are loaded via AJAX
//  startLoadingMaps();
}

// A new map, which contains general settings for the game run
function Map() {
  this.underwater = this.current_character = this.current_solid = this.current_scenery = this.xloc = 0;
  this.canscroll = true;
  this.floor = 104;
  this.time = 400; // optionally specified later
  this.curloc = -1;
  this.gravity = gravity;
  this.maxyvel = unitsize * 1.75;
  this.maxyvelinv = this.maxyvel * -2.1;
}

// An Area within a map, which contains the PreThings
function Area(setting, rawfunc) {
  this.creation = rawfunc || function() {};
  this.precharacters = [];
  this.presolids = [];
  this.prescenery = [];
  this.floor = 140;
  this.width = 0;
  this.underwater = false;
  setAreaSetting(this, setting || "");
}
function setAreaSetting(area, setting, sound) {
  map.shifting = true;
  if(arguments.length == 1) {
    setting = arguments[0] || "Overworld";
    area = map.area;
  }
  area.setting = area.background = setting;
  area.theme = setting.split(" ")[0];
  area.fillStyle = getAreaFillStyle(area.setting);
  // Water fixen
  if(area.fillStyle.indexOf("Underwater") != -1) goUnderWater();
  else goOntoLand();

  if(sound) AudioPlayer.playTheme();
  if(gameon) clearAllSprites();
  map.shifting = false;
}

// A location within an Area
// Specifies the entry function and xloc if needed
function Location(area, entry, xloc) {
  this.area = area;
  this.xloc = xloc || 0;
  this.yloc = this.floor = 0;
  // If entry is true, use entryPlain (beginning of level).
  // If it's valid, use it.
  // Otherwise, use entryNormal (drop from top)
  this.entry = ((entry == true) ? entryPlain : (entry || entryNormal));
}

// A holder for a thing to be placed in a Location
// Stores the coordinates, constructor, and any other arguments
function PreThing(xloc, yloc, type, extras, more, id) {
  this.xloc = xloc;
  this.yloc = yloc;
  this.type = type;
  // Pass any arguments after type into the Thing
  var args = arrayMake(arguments),
      // Blank Things are just basically {}, just with the name Thing in devtools :)
      object = new Thing();
  args[2] = type;
  args = args.splice(2); // args is now [type, arg1, arg2...]
  Thing.apply(object, args, id);

  this.object = object;
}


/* Map Setting */
// Resets the board and starts
function setMap(one, two) {
  if(!gameon) return;

  // Unless it's ok to, kill the editor
  if(!window.canedit && window.editing) editorClose(true);

  // Remove random stuff
  removeRandomDisplays();

  // If arguments[0] is an array, it's [one, two]
  if(one instanceof Array) {
    two = one[1];
    one = one[0];
  }

  var newcurrentmap = one ? [one, two] : window.currentmap,
      newmap = new Map(),
      func = mapfuncs[newcurrentmap[0]];

  // Create the new map using the mapfunc, making sure it's loaded
  if(!func) {
    log("No such map section exists (yet?):", func);
    return;
  }
  newcurrentmap.func = func = func[newcurrentmap[1]];
  if(!func) {
    log("No such map exists (yet?):", func);
    return;
  }

  // Since the func exists, set and use it
  window.map = newmap;
  window.currentmap = newcurrentmap;
  func(newmap);

  // Set the map variables back to 0
  newmap.areanum = newmap.curloc =/* window.playediting =*/ 0;
  window.area = newmap.area = newmap.areas[0];

  // Save the score if need be
  if(window.player && player.power) storePlayerStats();
  if(window.data) data.scoreold = data.score.amount;

  // Actual resetting is done in shiftToLocation
  shiftToLocation(0);
}

// For ease of transfer
// Random map pipe transports are ["Random", "XXXworld", LocationType]
// LocationType is either 1 (down) or -1 (up)
// Down means Player is moving down; Up means Player is moving up.
function setMapRandom(transport) {
  if(!gameon) return;

  resetSeed();

  // Determine how to get into the map
  if(typeof(transport) == "string") transport = ["Random", transport];
  else if(!transport) transport = ["Random", "Overworld"];

  // Actually set the map and shift to the location
  setMap(transport[0], transport[1]);

  // Record random-specific stuff
  data.traveledold = data.traveled;
  map.sincechange = map.num_random_sections = 0;
  map.entrancetype = transport[2];
  map.random = true;
  if(map.randname == "Sky") map.exitloc = ["Random", "Overworld", "Down"];
}



/* Map Traversal */
function shiftToLocation(loc) {
  // Make sure this is the right function
  if(map.random && typeof(loc) != "number") {
    return setMapRandom(loc);
  }
  if(typeof(loc) == "number")
    loc = map.locs[loc];

  // Reset everything game-related
  pause();
  resetGameState();
  resetGameScreenPosition();
  resetQuadrants();

  // Set this location's area as current
  map.areanum = loc.area;
  window.area = map.area = map.areas[map.areanum];

  // Clear everything, create the map, then set post-creation settings
  setAreaPreCreation(area);
  area.creation();
  setAreaPostCreation(area);

  // Start off by spawning, then placing Player
  spawnMap();
  player = placePlayer();
  scrollPlayer(loc.xloc * unitsize);
  locMovePreparations(player);
  // Note that some locs will pause manually after this
  unpause();
  // Typically this will do nothing or be from a pipe
  loc.entry(player, loc.entrything);
  // Don't forget the least annoying part of programming this!
  TimeHandler.addEvent(AudioPlayer.playTheme, 2);

  // Texts are bound-check checked periodically for peformance reasons
  TimeHandler.addEventInterval(checkTexts, 117, Infinity);
}
// To do: add in other stuff
function setAreaPreCreation(area) {
  // Clear the containers
  window.events = [];
  TimeHandler.clearAllEvents();
  window.characters = [];
  window.solids = [];
  window.scenery = [];
  clearTexts();
  area.precharacters = [];
  area.presolids = [];
  area.prescenery = [];

  // Reset the spawn & scroll settings
  map.current_solid = map.current_character = map.current_scenery = map.shifting = 0;
  map.canscroll = true;

  data.time.amount = map.time;
  data.world.amount = currentmap[0] + "-" + currentmap[1];
  setDataDisplay();
  startDataTime();

  if(map.random) {
    data.world.amount = "Random Map";
    data.world.element.innerHTML = "WORLD<br>Random Map";
  }
}
function clearTexts() {
  if(window.texts)
    for(var i = texts.length - 1; i >= 0; --i)
      if(texts[i])
        removeChildSafe(texts[i], body);
  window.texts = [];
}
function setAreaPostCreation() {
  map.current_character = map.current_solid = map.current_scenery = 0;
  area.width = max(area.width, gamescreen.width);

  // Reset gravity and underwater
  map.underwater = map.area.underwater;
  map.jumpmod = 1.056 + 3.5 * map.underwater;
  map.has_lakitu = false;
  TimeHandler.addEvent(setMapGravity, 1);

  // If it's underwater, give it the waves on top and player's bubble event
  if(area.underwater) {
    // Random maps have a block to stop player from swimming too high
    area.presolids.push(new PreThing(0, 0, WaterBlock, area.width));
    // Non-random maps also have a water sprite (randoms set it themselves)
    if(!map.random) area.presolids.push(new PreThing(0, 16, Sprite, "Water", [area.width / 3, 1]));
  }

  // Sort everything using ascending order
  area.presolids.sort(prethingsorter);
  area.precharacters.sort(prethingsorter);
  area.prescenery.sort(prethingsorter);

  // If the area has loops (really just castles), do this.
  if(area.sections && area.sections[0]) {
    setBStretch();
    area.sections.current = 0;
    area.sections[0](area.sections.start);
  }
  // Otherwise, give it a ScrollBlocker at the area.width if it's not a random Sky
  else if(!map.random && area.setting != "Sky") {
    var blocker = new PreThing(area.width, 0, ScrollBlocker);
    area.presolids.push(blocker);
  }

  // The fillstyle is the background color
  area.fillStyle = getAreaFillStyle(area.setting);
}
// Given a setting, returns the background color
function getAreaFillStyle(setting) {
  if(stringHas(setting, "Underworld") ||
     stringHas(setting, "Castle") ||
     stringHas(setting, "Night"))
      return stringHas(setting, "Underwater") ? "#2038ec" : "black";
  if(stringHas(setting, "Underwater")) return "#2038ec";
  return "#5c94fc";
}
function prethingsorter(a,b) {
  if(a.xloc == b.xloc) return b.yloc - a.yloc;
  else return a.xloc - b.xloc;
};


// Moves generation to a specific location #
function setLocationGeneration(num) {
  map.curloc = num;
  map.refx = map.locs[map.curloc].xloc;
  map.refy = map.locs[map.curloc].yloc + map.floor;
  map.areanum = map.locs[map.curloc].area;
}

/* Gamplay Functions */
// Solids are spawned a little bit before characters
function spawnMap() {
  var area = map.area,
      rightdiff = QuadsKeeper.getOutDifference(),
      screenright = gamescreen.right + rightdiff,
      quadswidtht2 = QuadsKeeper.getQuadWidth() * 2 + rightdiff,
      screenrightpq = screenright + quadswidtht2,
      arr, arrlen, prething, thing, current;

  // Spawn characters
  arr = area.precharacters;
  arrlen = arr.length;
  current = map.current_character;
  while(arrlen > current && screenright >= (prething = arr[current]).xloc * unitsize) {
    thing = prething.object;
    addThing(thing, prething.xloc * unitsize - gamescreen.left, prething.yloc * unitsize);
    thing.placenum = current;
    ++current;
  }
  map.current_character = current;

  // Spawn solids
  arr = area.presolids;
  arrlen = arr.length;
  current = map.current_solid;
  while(arrlen > current && screenrightpq >= (prething = arr[current]).xloc * unitsize) {
    thing = prething.object;
    addThing(thing, prething.xloc * unitsize - gamescreen.left, prething.yloc * unitsize);
    thing.placenum = current;
    ++current;
  }
  map.current_solid = current;

  // Spawn scenery
  arr = area.prescenery;
  arrlen = arr.length;
  current = map.current_scenery;
  while(arrlen > current && screenrightpq >= (prething = arr[current]).xloc * unitsize) {
    thing = prething.object;
    addThing(thing, prething.xloc * unitsize - gamescreen.left, prething.yloc * unitsize);
    thing.placenum = current;
    ++current;
  }
  map.current_scenery = current;
}


// Entry Functions
function goToTransport(transport) {
  // Goes to a new map
  if(transport instanceof Array) {
    map.ending = true;
    storePlayerStats();
    pause();
    if(map.random) {
      setMapRandom(transport);
      // entryRandom(player);
    }
    else setMap(transport);
  }
  // Goes to a new Location
  else shiftToLocation(map.locs[transport]);
}
function entryPlain(me) {
  // pause();
  setLeft(me, unitsizet16);
  setBottom(me, map.floor * unitsize);
  me.nocollide = me.piping = false;
  me.placed = true;
  // unpause();
}
function entryNormal(me) {
  // pause();
  setLeft(me, unitsizet16);
  setTop(me, unitsizet16);
  me.nocollide = me.piping = false;
  me.placed = true;
  // unpause();
}
function entryBlank(me) {
  setLeft(me, unitsizet16);
  setBottom(me, map.floor * unitsize);
  me.nocollide = me.piping = me.movement = false;
  me.placed = me.nofall = me.nocollide = notime = nokeys = true;
  thingStoreVelocity(me);
  clearDataDisplay();
}
function entryRandom(me) {
  data.time.amount = 0;
  data.time.dir = 1;
  updateDataElement(data.time);
  if(map.startwidth) {
    if(!map.nofloor) pushPreFloor(0, 0, map.startwidth);
  }
  else map.startwidth = 0;
  map.firstRandomThings(map);
  map.randtype((map.startwidth + 1) * 8); //17 * 8
  entryPlain(me);
  addDistanceCounter();
  addSeedDisplay();
  // To do: remember to set the text & width of the curmap datadisplay
  switch(map.entrancetype) {
    case "Down":
      entryNormal(player);
    break;
    case "Up":
      // Use a pipe
      locMovePreparations(player);
      exitPipeVert(player, addThing(new Thing(Pipe, 32), unitsizet8, (map.floor - 32) * unitsize));
    break;
    case "Vine":
      // Do that vine stuff
      locMovePreparations(player);
      TimeHandler.addEvent(function() { enterCloudWorld(player, true); }, 1);
      player.nofall = true;
      spawnMap();
    break;
    case "Castle":
      startCastle(player);
    break;
    default:
      // Only reached by Overworld the first time
      // if(map.randname == "Overworld") addThing(new Thing(Sprite, "Castle", 1), unitsizet16 * -1, (map.floor - 88) * unitsize);
    break;
  }
}
function enterCloudWorld(me) {
  // There are four cloud blocks to the left
  // The vine goes up until it has four blocks above the clouds, then waits 2 seconds
  // Player climbs up the left until two blocks from the top, then switches & jumps
  // if(paused) unpause();

  if(map.random) map.exitloc = getAfterSkyTransport();

  var screenbottom = 140 * unitsize,
      screentop = 72 * unitsize;
  me.placed = me.nofall = true;
  setTop(me, screenbottom);
  setLeft(me, unitsize * 30);
  removeClass(me, "jumping");
  addClasses(me, ["climbing", "animated"]);
  me.climbing = TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");

  me.attached = new Thing(Vine, -1);
  addThing(me.attached, unitsizet32, screenbottom - unitsizet8);

  var movement = setInterval(function() {
    // Vine moving up
    if(me.attached.top <= screentop) {
      clearInterval(movement);
      setTop(me.attached, screentop, true);
      me.attached.movement = false;
      var stopheight = me.attached.top + unitsizet16;
      movement = setInterval(function() {
        // Player moving up
        shiftVert(me, unitsized4 * -1, true);
        if(me.top <= stopheight) {
          // Player stops moving up
          removeClass(me, "animated");
          clearInterval(movement);
          setTop(me, stopheight, true);
          clearInterval(movement);
          setTimeout(function() {
            // Player switches sides
            setLeft(me, unitsize * 36, true);
            addClass(me, "flipped");
            setTimeout(function() {
              // Player hops off
              playerHopsOff(me, me.attached, true);
              TimeHandler.clearClassCycle(me, "climbing");
              me.running = TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"], "running", setPlayerRunningCycler);
            }, timer * 28);
          }, timer * 14);
        }
      }, timer);
    }
  }, timer);
}
function walkToPipe() {
  player = placePlayer();
  startWalking(player);
  map.canscroll = false;

  var hasPipingStarted = false;
  var move = setInterval(function() {
    if(player.piping) {
      // We have started piping
      AudioPlayer.pauseTheme();
      // nokeys = player.keys.run = notime = false;
      clearInterval(move);
      player.maxspeed = player.maxspeedsave;
    }
  }, timer);
  unpause();
}
function startWalking(me) {
  me.movement = movePlayer;
  me.maxspeed = me.walkspeed;
  nokeys = notime = me.keys.run = true;
  me.nofall = me.nocollide = false;
}
function intoPipeVert(me, pipe, transport) {
  if(!pipe.transport || !me.resting ||
                        me.right + unitsizet2 > pipe.right ||
                        me.left - unitsizet2 < pipe.left) return;
  pipePreparations(me);
  switchContainers(me, characters, scenery);
  unpause();
  var move = setInterval(function() {
    shiftVert(me, unitsized4, true);
    if(me.top >= pipe.top) {
      clearInterval(move);
      setTimeout(function() { goToTransport(transport); }, 700);
    }
  }, timer);
}
function intoPipeHoriz(me, pipe, transport) {
  // If Player isn't resting or swimming, he shouldn't be allowed to pipe
  // (resting may have been cleared at this point, so yvel is how it checks)
  // if(abs(me.yvel) > unitsized8 || !map.underwater) return;

  pipePreparations(me);
  switchContainers(me, characters, scenery);
  unpause();
  var move = setInterval(function() {
    shiftHoriz(me, unitsized4, true);
    if(me.left >= pipe.left) {
      clearInterval(move);
      setTimeout(function() { goToTransport(transport); }, 700);
    }
  }, timer);
}
function pipePreparations(me) {
  AudioPlayer.pauseTheme();
  AudioPlayer.play("Pipe");
  locMovePreparations(me);
  me.nofall = me.nocollide = nokeys = notime = true;
  me.movement = me.xvel = me.yvel = 0;
}

function locMovePreparations(me) {
  // pause();
  me.keys = new Keys();
  me.nocollide = me.piping = 1;
  me.placed = false;
  removeCrouch();
  removeClass(me, "running");
  removeClass(me, "jumping");
  removeClass(me, "flipped");
}
function startCastle(me) {
  me = me || window.player;
  if(!me) return;
  setBottom(me, unitsize * 56);
  setLeft(me, unitsizet2);
  me.nocollide = me.piping = false;
  me.placed = true;
}
// Exit functions
function exitPipeVert(me, pipe) {
  switchContainers(me, characters, scenery);
  me.nofall = nokeys = notime = true;
  AudioPlayer.play("Pipe");
  setTop(me, pipe.top);
  setMidXObj(me, pipe, true);
  var dy = unitsize / -4, move = setInterval(function() {
    shiftVert(me, dy, true);
    if(me.bottom <= pipe.top) {
      switchContainers(me, scenery, characters);
      clearInterval(move);
      me.nocollide = me.piping = me.nofall = nokeys = notime = false;
      me.placed = true;
    }
  }, timer);
}

function endLevel() {
  if(map.ending) return;
  map.ending = true;
  map.random ? setMapRandom(["Random", "Castle"]) : setNextLevelArr(currentmap);
  storePlayerStats();
  pause();
  setMap();
}

function setExitLoc(num) {
  map.exitloc = num;
}


/* Shortcut Functions */
// Most of which call pushPre---
function pushPreThing(type, xloc, yloc, extras, more, id) {
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, type, extras, more, id),
      object = prething.object;
  // Stretch the area's width if it's a solid or character
  if((object.solid || object.character) && !object.nostretch)
    map.area.width = max(map.area.width, prething.xloc + object.width);
  // Otherwise put it in solids or chars (scenery has its own pushPre*)
  if(object.solid && !object.spawn_as_char) map.area.presolids.push(prething);
  else map.area.precharacters.push(prething);
  return prething;
}
function pushPreScenery(name, xloc, yloc, repx, repy) {
  repx = round(repx || 1); repy = round(repy || 1);
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, Sprite, name, [repx, repy]);
  prething.yloc -= prething.object.height;
  map.area.prescenery.push(prething);
  return prething;
}
function pushPreScenerySolid(name, xloc, yloc, repx, repy) {
  repx = repx || 1; repy = repy || 1;
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, Sprite, name, [repx, repy]);
  prething.yloc -= prething.object.height;
  map.area.presolids.push(prething);
  return prething;
}
function pushPreText(settings, xloc, yloc) {
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, FuncSpawner, spawnText, settings);
  map.area.presolids.push(prething);
  return prething;
}

function fillPreThing(type, xloc, yloc, numx, numy, width, height, extras, more) {
  var x = xloc, y;
  for(var i = 0, j; i < numx; ++i) {
    y = yloc;
    for(j = 0; j < numy; ++j) {
      pushPreThing(type, x, y, extras, more);
      y += height;
    }
    x += width;
  }
}

function pushPreFloor(xloc, yloc, length) {
  pushPreThing(Floor, xloc, yloc || 0, length || 1, DtB(yloc, 8));
}

function makeCeiling(xloc, num) {
  num = num || 1;
  for(var i=0; i<num; ++i)
    pushPreThing(Brick, xloc + i * 8, ceillev);
}
function makeCeilingCastle(xloc, bwidth, bheight) {
  pushPreThing(Stone, xloc, ceillev, bwidth || 1, bheight || 1);
}

function pushPreBridge(xloc, yloc, length, sides) {
  pushPreScenery("Railing", xloc, yloc, length * 2);
  pushPreThing(BridgeBase, xloc, yloc, length);
  if(sides instanceof Array) {
    if(sides[0]) pushPreThing(Stone, xloc - 8, yloc, 1, 64);
    if(sides[1]) pushPreThing(Stone, xloc + length * 8, yloc, 1, 64);
  }
}

function fillPreWater(xloc, yloc, width) {
  // Water is 3 x 5.5
  var dtb = DtB(yloc),
      numy = ceil(dtb / 5.5),
      dtby = numy * 5;
  pushPreScenery("Water", xloc, yloc - 5.5, width * 4 / 3);
  pushPreScenery("WaterFill", xloc, yloc - dtby - 15.5, width * 4 / 3, numy + 2);
}

function pushPrePlatformGenerator(xloc, width, dir) {
  pushPreThing(PlatformGenerator, xloc, ceilmax + 16, width, dir);
}

// settings = [platwidth, offy1, offy2] (offy is distance from top to platform)
function pushPreScale(xloc, yloc, width, settings) {
  var platwidth = settings[0],
      offx = platwidth * 2,
      offy1 = settings[1] + 1.5,
      offy2 = settings[2] + 1.5,
      me = pushPreThing(Scale, xloc, yloc, width).object;

  // Set the platforms
  platleft = pushPreThing(Platform, xloc - offx, yloc - offy1 * 4, platwidth, moveFallingScale).object;
  platright = pushPreThing(Platform, xloc + width * 4 - platwidth - 6, yloc - offy2 * 4, platwidth, moveFallingScale).object;
  platleft.parent = me; platright.parent = me;
  platleft.partner = platright; platright.partner = platleft;
  platleft.tension = offy1 * unitsizet4 - unitsize * 10;
  platright.tension = offy2 * unitsizet4 - unitsize * 10;

  // Set the tension
  me.tensionleft = offy1 * unitsize;
  me.tensionright = offy2 * unitsize;

  // Add the strings
  platleft.string = pushPreScenery("String", xloc, yloc - offy1 * 4, 1, (offy1 - .5) * 4).object;
  platright.string = pushPreScenery("String", xloc + width * 4 - 1, yloc - offy2 * 4, 1, (offy2 - .5) * 4).object;
}

// worlds gives the pipe [X,Y]
// offset is how far between scrollblocker and main area (8 before first pipe)
// block is whether the screen should be blocked from scrolling to this
function pushPreWarpWorld(xloc, yloc, worlds, offset, block) {
  if(worlds.length == 1) worlds = [-1, worlds[0], -1];
  var startx = (offset || 0) + xloc + 10,
      len = worlds.length,
      pipe, i;

  warp = pushPreThing(WarpWorld, xloc, yloc + ceilmax).object;
  var title = pushPreText({innerText: "WELCOME TO WARP ZONE!", style: {visibility: "hidden"} }, startx, 58);
  warp.texts.push(title.object);

  for(i = 0; i < len; ++i) {
    if(worlds[i] != -1) {
      warp.pipes.push(pipe = pushPrePipe(startx, yloc, 24, true, worlds[i]).object);
      warp.pirhanas.push(pipe.pirhana);
      if(worlds[i] instanceof Array)
        warp.texts.push(pushPreText({innerText: worlds[i][0], style: {visibility: "hidden"}}, startx + 4, 38).object);
    }
    startx += 32;
  }

  if(block) {
    window.block = pushPreThing(ScrollBlocker, xloc, ceilmax);
    pushPreThing(ScrollBlocker, startx + 16, ceilmax);
  }
}

// Can be called either in a map function or during gameplay
function goUnderWater() {
  if(window.map) {
    if(map.area) {
      if(window.player && !map.shifting)
        setAreaSetting(String(map.area.setting || "") + " Underwater");
      map.area.underwater = true;
    }
    setMapGravity();
    TimeHandler.clearEvent(map.bubbling);
    map.bubbling = TimeHandler.addEventInterval(playerBubbles, 96, Infinity);
    map.underwater = true;
  }
}
function goOntoLand() {
  if(map) {
    if(map.area) {
      if(window.player && !map.shifting)
        setAreaSetting(map.area.setting.replace("Underwater", "") || "Overworld");
      map.area.underwater = false;
    }
    setMapGravity();
    TimeHandler.clearEvent(map.bubbling);
    map.underwater = false;
  }
}
function setMapGravity() {
  if(window.player) {
    if(map.underwater) player.gravity = gravity / 2.8;
    else player.gravity = gravity;
  }
}

function setBStretch() {
  window.bstretch = gamescreen.width / 8 - 2;
}

/*
 * Specific creation of often-used stuff
 */
// The detector has stuff stored in it, so the animation functions can use them
// Some worlds (8-3, for example) have an unusual distance from flag to castle
// To do: use typical FuncColliders instead of detectors
function endCastleOutside(xloc, yloc, castlevel, wall, dist) {
  xloc = xloc || 0;
  yloc = yloc || 0;
  if(castlevel) castlevel = castlev;
  dist = dist || 20;
  var detect = pushPreThing(FlagDetector, xloc + 7, yloc + 108).object,
      detect2 = pushPreThing(CastleDoorDetector, xloc + 60 + (castlev == 0) * 8, 8).object;
  detect.flag = pushPreThing(Flag, xloc + .5, yloc + 79.5).object;
  detect.stone = pushPreThing(Stone, xloc + 4, yloc + 8).object;
  detect.top = pushPreThing(FlagTop, xloc + 6.5, 84).object;
  detect.pole = pushPreThing(FlagPole, xloc + 8, 80).object;

  // detect2.castle = pushPreScenery("Castle", xloc + dist, yloc + castlevel).object;
  if(wall) pushPreScenery("CastleWall", xloc + dist + 72, yloc, wall);
  if(castlevel == 0) shiftHoriz(detect2, unitsizet8);

  pushPreCastle(xloc + dist + 16, yloc, castlevel);
}

function startCastleInside() {
  pushPreThing(Stone, 0, 88, 5, 3);
  pushPreThing(Stone, 0, 48, 3, DtB(48, 8));
  pushPreThing(Stone, 24, 40, 1, DtB(40, 8));
  pushPreThing(Stone, 32, 32, 1, DtB(32, 8));
}

function endCastleInside(xloc, last, hard) {
  var collider = pushPreThing(FuncCollider, xloc + 104, 48, CastleAxeFalls, [16, 24]).object,
      axe = collider.axe = pushPreThing(CastleAxe, xloc + 104, 40).object;
  axe.bridge = pushPreThing(CastleBridge, xloc, 24, 13).object;
  axe.chain = pushPreThing(CastleChain, xloc + 96.5, 32).object;
  axe.bowser = pushPreThing(Bowser, xloc + 69, 42, hard).object;
  pushPreThing(ScrollBlocker, xloc + 112, ceilmax); // 104 + 16

  pushPreThing(Stone, xloc, 88, 32);
  fillPreWater(xloc, 0, 26);
  pushPreFloor(xloc + 104, 32, 3);
  pushPreFloor(xloc + 104, 0, 19);
  pushPreThing(Stone, xloc + 112, 80, 2, 3);

  // Stop that scrolling... again
  pushPreThing(ScrollBlocker, xloc + 256, ceilmax);

  // Place the NPC
  endCastleInsideFinal(xloc, last);
}

function endCastleInsideFinal(xloc, last) {
  var stopper = pushPreFuncCollider(xloc + 180, collideCastleNPC).object,
      style = { visibility: "hidden" },
      text, i;
  // Either put Peach...
  if(last) {
    pushPreThing(Peach, xloc + 194, 13).object;
    text = stopper.text = [
      pushPreText({innerHTML: "THANK YOU " + window.player.title.toUpperCase() + "!", style: style}, xloc + 160, 66).object,
      pushPreText({innerHTML: "YOUR QUEST IS OVER.<BR>WE PRESENT YOU A NEW QUEST.", style: style}, xloc + 148, 50).object,
      pushPreText({innerHTML: "PRESS BUTTON B<BR>TO SELECT A WORLD.", style: style}, xloc + 148, 26).object
    ];
  }
  // ...or that jerk Toad
  else {
    pushPreThing(Toad, xloc + 194, 12).object;
    text = stopper.text = [
      pushPreText({innerHTML: "THANK YOU " + window.player.title.toUpperCase() + "!", style: style}, xloc + 160, 66).object,
      pushPreText({innerHTML: "BUT OUR PRINCESS IS IN<BR>ANOTHER CASTLE!", style: style}, xloc + 148, 50).object
    ];
  }
}

function pushPreSectionPass(xloc, yloc, width, height, secnum) {
  var passer = pushPreThing(Collider, xloc, yloc, [width, height], [sectionPass, sectionColliderInit]).object,
      secnum = map.area.sections.current || 0,
      section = map.area.sections[secnum];

  if(section.numpass) ++section.numpass;
  else section.numpass = 1;

  if(!section.colliders) section.colliders = [passer];
  else section.colliders.push(passer);
}
function pushPreSectionFail(xloc, yloc, width, height, secnum) {
  var failer = pushPreThing(Collider, xloc, yloc, [width, height], [sectionFail, sectionColliderInit]).object,
      secnum = map.area.sections.current || 0,
      section = map.area.sections[secnum];

  if(!section.colliders) section.colliders = [failer];
  else section.colliders.push(failer);
}
function pushCastleDecider(xloc, secnum) {
  pushPreThing(castleDecider, xloc, ceilmax, xloc, secnum);
}
function sectionColliderInit(me) {
  me.sections = map.area.sections;
  me.parent = me.sections[me.sections.current];
  me.movement = false;
}
function sectionPass(character, collider) {
  if(character.type != "player") return false;
  collider.nocollide = true;
  var parent = collider.parent;
  if(--parent.numpass) return;
  activateSection(collider.parent, true);
}
function sectionFail(character, collider) {
  if(character.type != "player") return false;
  collider.nocollide = true;

  activateSection(collider.parent, false);
}
function activateSection(parent, status) {
  var colliders = parent.colliders;
  for(var i=colliders.length-1; i>=0; --i)
    killNormal(colliders[i]);

  parent.activated = true;
  parent.passed = status;
}

function pushPreTree(xloc, yloc, width) {
  pushPreThing(TreeTop, xloc, yloc, width);
  // Although the tree trunks in later trees overlap earlier ones, it's ok because
  // the pattern is indistinguishible when placed correctly.
  var dtb = DtB(yloc);
  pushPreScenerySolid("TreeTrunk", xloc + 8, yloc - dtb - 8, width - 2 , dtb / 8);
}
function pushPreShroom(xloc, yloc, width) {
  pushPreThing(ShroomTop, xloc, yloc, width);
  var dtb = DtB(yloc - 4);
  pushPreScenery("ShroomTrunk", xloc + width * 4 - 4, yloc - dtb - 8, 1, dtb / 8);
}

function pushPrePipe(xloc, yloc, height, pirhana, intoloc, exitloc) {
  if(!isFinite(height)) {
    height = gamescreen.height;
    yloc -= gamescreen.height;
  }

  var prepipe = pushPreThing(Pipe, xloc, yloc + height, height / 8, intoloc),
      pipe = prepipe.object/*,
      vert = pushPreThing(PipeVertical, xloc, yloc + height - 8, height - 8)*/;

  if(pirhana) pipe.pirhana = pushPreThing(Pirhana, xloc + 4, yloc + height + 12).object;
  if(exitloc) {
    map.locs[exitloc].entrything = pipe;
    map.locs[exitloc].xloc = xloc;
  }
  return prepipe;
}

function pushPreCastle(xloc, yloc, big) {
  xloc = xloc || 0;
  yloc = yloc || 0;
  if(big) pushPreCastleBig(xloc, yloc);
  else pushPreCastleSmall(xloc, yloc);
}

// Note: off by 16 or so
function pushPreCastleBig(xloc, yloc) {
  var i, j;
  pushPreCastleSmall(xloc + 16, yloc + 48);
  // Top alternate fillings
  for(i = 0; i < 3; ++i)
    for(j = 0; j < 2; ++j)
      pushPreScenerySolid("BrickPlain", xloc + 16 + i * 16, yloc + 24 + j * 8);
  // Top alternate doors
  for(i = 0; i < 2; ++i)
    pushPreScenerySolid("CastleDoor", xloc + 24 + i * 16, yloc + 24);
  // Top half filling
  for(i = 0; i < 5; ++i)
    if(i == 2) continue;
    else pushPreScenerySolid("BrickHalf", xloc + 16 + i * 8, yloc + 48);

  // Left railings
  for(i = 0; i < 2; ++i)
    pushPreScenerySolid("CastleRailing", xloc + i * 8, yloc + 44);
  // Middle railings
  for(i = 0; i < 5; ++i)
    pushPreScenerySolid("CastleRailingFilled", xloc + 16 + i * 8, yloc + 44);
  // Right railings
  for(i = 5; i < 7; ++i)
    pushPreScenerySolid("CastleRailing", xloc + 16 + i * 8, yloc + 44);

  // Bottom alternate fillings
  for(i = 0; i < 2; ++i)
    for(j = 0; j < 3; ++j)
      pushPreScenerySolid("BrickPlain", xloc + 24 + i * 16, yloc + j * 8);
  // Bottom alternate doors
  for(i = 0; i < 3; ++i)
    pushPreScenerySolid("CastleDoor", xloc + 16 + i * 16, yloc);

  // Left fill
  for(i = 0; i < 2; ++i) {
    for(j = 0; j < 5; ++j)
      pushPreScenerySolid("BrickPlain", xloc + i * 8, yloc + j * 8);
    pushPreScenerySolid("BrickHalf", xloc + i * 8, yloc + 40);
  }

  // Right fill
  for(i = 0; i < 2; ++i) {
    for(j = 0; j < 5; ++j)
      pushPreScenerySolid("BrickPlain", xloc + 56 + i * 8, yloc + j * 8);
    pushPreScenerySolid("BrickHalf", xloc + 56 + i * 8, yloc + 40);
  }

  for(i = 0; i < 3; ++i)
    for(j = 0; j < 2; ++j)
      pushPreScenerySolid("BrickHalf", xloc + 16 + i * 16, yloc + 20 + j * 20);
}

// To do: y u no work scenery
function pushPreCastleSmall(xloc, yloc) {
  var i, j;

  // Top railing
  for(i = 0; i < 3; ++i) pushPreScenerySolid("CastleRailing", xloc + 8 + i * 8, yloc + 36);
  // Top bricking
  for(i = 0; i < 2; ++i) pushPreScenerySolid("CastleTop", xloc + 8 + i * 12, yloc + 24);
  // Med railing
  pushPreScenerySolid("CastleRailing", xloc, yloc + 20);
  for(i = 1; i <= 3; ++i) pushPreScenerySolid("CastleRailingFilled", xloc + i * 8, yloc + 20);
  pushPreScenerySolid("CastleRailing", xloc + 32, yloc + 20);
  // Base filling left
  for(i = 0; i < 2; ++i) { // x
    pushPreScenerySolid("BrickHalf", xloc + i * 8, yloc);
    for(j = 0; j < 2; ++j) // y
      pushPreScenerySolid("BrickPlain", xloc + i * 8, yloc + 4 + j * 8);
  }
  // Base filling right
  for(i = 0; i < 2; ++i) { // x
    pushPreScenerySolid("BrickHalf", xloc + 24 + i * 8, yloc);
    for(j = 0; j < 2; ++j) // y
      pushPreScenerySolid("BrickPlain", xloc + 24 + i * 8, yloc + 4 + j * 8);
  }
  // Door
  pushPreScenerySolid("CastleDoor", xloc + 16, yloc);
}

function pushPreFuncCollider(position, func) {
  // Fancy positions are [xloc, yloc, width, height]
  if(position instanceof Array) {
    console.log("position", position);
    return pushPreThing(FuncCollider, position[0], position[1], func, [position[2], position[3]]);
  }
  // Normally position is xloc
  else return pushPreThing(FuncCollider, position, ceilmax + 40, func);
}
function pushPreFuncSpawner(xloc, func) {
  return pushPreThing(FuncSpawner, xloc, jumplev1, func);
}

function zoneEnableLakitu() {
  map.zone_lakitu = true;
  enterLakitu();
}
function zoneDisableLakitu() {
  if(!map.has_lakitu) return;// killNormal(me);

  var lakitu = map.has_lakitu;
  map.zone_lakitu = map.has_lakitu = false;

  if(!lakitu.lookleft) {
    lakitu.lookleft = true;
    removeClass(lakitu, "flipped");
  }
  lakitu.movement = function(me) {
    me.xvel = max(me.xvel - unitsized32, unitsize * -1);
  };
}
function zoneStartCheeps(xloc) { pushPreFuncCollider(xloc, zoneEnableCheeps); }
function zoneStopCheeps(xloc) { pushPreFuncCollider(xloc, zoneDisableCheeps); }
function zoneEnableCheeps(me) {
  if(map.zone_cheeps || !me.player) return;
  startCheepSpawn();
}
function zoneDisableCheeps(me) {
  if(!me.player) return;
  map.zone_cheeps = false;
}

// This is for patterns
// Sprites will have optional inputs for how many vertically/horizontally
function pushPrePattern(name, xloc, yloc, reps) {
  var xpos = xloc,
      pattern = Scenery.patterns[name],
      info, i, j;
  for(i = 0; i < reps; ++i) {
    for(j in pattern) {
      // Get the sprite information
      info = pattern[j];
      if(!(info instanceof Array)) continue;
      //[0] is name, [1/2] are x/yloc, [3/4] are repx/y (1 by default)
      pushPreScenery(info[0], xpos + info[1], yloc + info[2], info[3], info[4]);
    }
    xpos += pattern.width;
  }
}

/* Misc. Helpers */

// Distance from the yloc to botmax
//// Assumes yloc is in the form given by mapfuncs - distance from floor
function DtB(yloc, divider) {
  return (yloc + botmax) / (divider || 1);
}

// Used for the editor
function BlankMap(map) {
  map.locs = [ new Location(0, entryBlank) ];
  map.areas = [ new Area("Overworld", function() {
    setTimeout(refillCanvas, timer + 2);
  }) ];
}

// World11 is kept here to avoid loading
function World11(map) {
  map.locs = [
    new Location(0, true),
    new Location(0, exitPipeVert),
    new Location(1)
  ];
  map.areas = [
    new Area("Overworld", function() {
      setLocationGeneration(0);

      pushPrePattern("backreg", 0, 0, 5);
      pushPreFloor(0, 0, 69);


      pushPreThing(Brick, 120, jumplev1);
      pushPreThing(Brick, 128, jumplev1);
      pushPreThing(Goomba, 176, 8, null, null, '/problems/1');
      pushPreThing(Brick, 136, jumplev1);
      pushPreThing(Brick, 144, jumplev1);
      pushPreThing(Brick, 152, jumplev1);


      pushPreThing(Brick, 128, jumplev2);
      pushPreThing(Brick, 136, jumplev2);
      pushPreThing(Brick, 144, jumplev2);
      pushPreThing(Koopa, 136, jumplev2+16, true, false, '/problems/4');

      pushPreThing(Goomba, 224, 24, null, null, '/problems/3');
      pushPrePipe(224, 0, 16, false);
//      pushPreThing(Goomba, 248, 8, null, null, '/problems/4');
      pushPrePipe(304, 0, 24);
      pushPrePipe(368, 0, 32);
      pushPreThing(Goomba, 340, 8, null, null, '/problems/5');

      pushPreThing(Block, 424, jumplev1, null, null, '/learned/1');
      pushPreThing(Block, 432, jumplev1, null, null, '/learned/2');
      pushPreThing(Block, 440, jumplev1, null, null, '/learned/3');
      pushPreThing(Block, 432, jumplev2, null, null, '/learned/4');

      pushPrePipe(524, 0, 16, false);
      pushPreThing(Stone, 572, 8, 1, 1);
      pushPreThing(Stone, 672, 8, 1, 1);

      pushPreFloor(568, 0, 15);
      pushPreThing(Brick, 618, jumplev1);
      pushPreThing(Brick, 626, jumplev1);
      pushPreThing(Brick, 634, jumplev1);
      pushPreThing(Brick, 640, jumplev2);
      pushPreThing(Goomba, 640, jumplev2 + 8, null, null, '/problems/6');
      pushPreThing(Brick, 648, jumplev2);
      pushPreThing(Brick, 656, jumplev2);
      pushPreThing(Goomba, 672, jumplev2 + 8, null, null, '/problems/7');
      pushPreThing(Brick, 664, jumplev2);
      pushPreThing(Brick, 672, jumplev2);
      pushPreThing(Brick, 680, jumplev2);
      pushPreThing(Brick, 688, jumplev2);
      pushPreThing(Brick, 696, jumplev2);
      pushPreFloor(712, 0, 64);
      pushPreThing(Brick, 728, jumplev2);
      pushPreThing(Brick, 736, jumplev2);
      pushPreThing(Brick, 744, jumplev2);

      pushPreThing(Blooper, 800, 16, null, null, '/problems/8');
      pushPreThing(Blooper, 880, 16, null, null, '/problems/9');

      pushPreThing(Brick, 850, jumplev1);
      pushPreThing(Brick, 858, jumplev1);
      pushPreThing(Brick, 866, jumplev1);
      pushPreThing(Brick, 874, jumplev1);
      pushPreThing(Brick, 882, jumplev1);
      pushPreThing(Brick, 890, jumplev1);
      pushPreThing(Brick, 898, jumplev1);

      pushPreThing(Block, 866, jumplev2, null, null, '/learned/5');
      pushPreThing(Block, 874, jumplev2, null, null, '/learned/6');
      pushPreThing(Block, 882, jumplev2, null, null, '/learned/7');

      pushPreFloor(1240, 0, 69);
      pushPreThing(Stone, 1008, 8);
      pushPreThing(Stone, 1016, 16, 1, 2);
      pushPreThing(Stone, 1024, 24, 1, 3);
      pushPreThing(Stone, 1032, 32, 1, 4);
      pushPreThing(Stone, 1040, 40, 1, 5);
      pushPreThing(Stone, 1048, 48, 1, 6);
      pushPreThing(Stone, 1056, 56, 1, 7);
      endCastleOutside(1080, 0, 1);

    })
  ];
}

function World12(map) {
  map.locs = [
    new Location(0, walkToPipe),
    new Location(1),
    new Location(2),
    new Location(1, exitPipeVert),
    new Location(3, exitPipeVert),
    new Location(1, false, 1000)
  ];
  map.areas = [
    new Area("Overworld", function() {
      setLocationGeneration(0);

      pushPreCastle();
      pushPrePattern("backcloud", 0, 4, 1);
      pushPreFloor(0, 0, 24);
      pushPreThing(PipeSide, 80, 16, 1);
      pushPrePipe(96, 0, 32);
    }),
    new Area("Underworld", function() {
      setLocationGeneration(1);

      fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
      pushPreFloor(0, 0, 80);
      makeCeiling(48, 83);
      pushPreThing(Block, 80, jumplev1, Mushroom);
      fillPreThing(Block, 88, jumplev1, 4, 1, 8, 8);

      pushPreThing(Goomba, 128, 8);
      pushPreThing(Stone, 136, 8);
      pushPreThing(Goomba, 136, 16);
      pushPreThing(Stone, 152, 16, 1, 2);
      pushPreThing(Stone, 168, 24, 1, 3);
      pushPreThing(Stone, 184, 32, 1, 4);
      pushPreThing(Stone, 200, 32, 1, 4);
      pushPreThing(Stone, 216, 24, 1, 3);
      pushPreThing(Goomba, 232, 8);
      pushPreThing(Brick, 232, 40, Coin);
      pushPreThing(Stone, 248, 24, 1, 3);
      pushPreThing(Stone, 264, 16, 1, 2);

      fillPreThing(Brick, 312, 32, 1, 3, 8, 8);
      pushPreThing(Brick, 320, 32);
      pushPreThing(Coin, 321, 39);
      fillPreThing(Brick, 328, 32, 1, 3, 8, 8);
      fillPreThing(Coin, 330, 63, 4, 1, 8, 8);
      pushPreThing(Brick, 336, 48);
      pushPreThing(Brick, 344, 48);
      fillPreThing(Koopa, 352, 12, 2, 1, 12);
      fillPreThing(Brick, 352, 32, 1, 3, 8, 8);

      // pushPreThing(Coin, 360, 62);
      pushPreThing(Brick, 360, 32);
      fillPreThing(Brick, 368, 32, 1, 2, 8, 8);
      pushPreThing(Coin, 361, 39);
      pushPreThing(Brick, 368, 48, Star);
      fillPreThing(Brick, 416, 32, 2, 5, 8, 8);
      fillPreThing(Brick, 432, 16, 2, 3, 8, 8);
      fillPreThing(Brick, 432, 72, 2, 2, 8, 8);
      fillPreThing(Brick, 464, 32, 4, 1, 8, 8);
      fillPreThing(Brick, 464, 72, 5, 2, 8, 8);
      fillPreThing(Coin, 465, 39, 4, 1, 8, 8);
      pushPreThing(Koopa, 472, 12);
      fillPreThing(Brick, 496, 32, 2, 7, 8, 8);
      pushPreThing(Goomba, 494, 8);
      pushPreThing(Goomba, 510, 8);

      fillPreThing(Brick, 528, 72, 4, 2, 8, 8);
      fillPreThing(Brick, 536, 32, 1, 5, 8, 8);
      fillPreThing(Brick, 544, 32, 2, 1, 8, 8);
      pushPreThing(Coin, 545, 39);
      pushPreThing(Brick, 552, 40, Mushroom);

      fillPreThing(Brick, 576, 32, 2, 1, 8, 8);
      pushPreThing(Brick, 576, 40);
      fillPreThing(Brick, 576, 48, 2, 3, 8, 8);
      pushPreThing(Brick, 584, 40, Coin);
      pushPreThing(Goomba, 584, 72);

      fillPreThing(Brick, 608, 32, 4, 1, 8);
      fillPreThing(Brick, 608, 72, 4, 2, 8);
      fillPreThing(Goomba, 608, 40, 2, 1, 12);

      pushPreFloor(664, 0, 34);
      fillPreThing(Brick, 672, 40, 6, 2, 8, 8);
      fillPreThing(Coin, 674, 64, 6, 1, 8, 8);
      pushPreThing(Brick, 712, 88, [Mushroom, 1]);
      makeCeiling(720, 45);
      fillPreThing(Goomba, 768, 8, 3, 1, 12, 8);
      pushPrePipe(800, 0, 24, true, 2);
      pushPrePipe(848, 0, 32, true);
      pushPreThing(Goomba, 872, 8);
      pushPrePipe(896, 0, 16, true, false, 3);

      pushPreFloor(952, 0, 2);
      fillPreThing(Brick, 952, 8, 2, 3, 8, 8);

      pushPreFloor(984, 0, 12);
      pushPreThing(Stone, 1040, 8);
      pushPreThing(Stone, 1048, 16, 1, 2);
      pushPreThing(Stone, 1056, 24, 1, 3);
      pushPreThing(Goomba, 1056, 32);
      pushPreThing(Stone, 1064, 32, 1, 4);
      pushPreThing(Goomba, 1064, 48);
      pushPreThing(Stone, 1072, 32, 1, 4);
      pushPrePlatformGenerator(1096, 6, 1);
      // pushPreThing(PlatformGenerator, 1096, ceilmax, 6, 1);

      pushPreFloor(1144, 0, 8);
      fillPreThing(Brick, 1144, 40, 5, 1, 8, 8);
      pushPreThing(Koopa, 1152, 12, true);
      pushPreThing(Brick, 1184, 40, Mushroom);
      pushPrePlatformGenerator(1224, 6, -1);
      // pushPreThing(PlatformGenerator, 1224, ceilmax, 6, -1);

      pushPreFloor(1266, 0, 32);
      fillPreThing(Brick, 1266, 8, 17, 3, 8, 8);
      pushPreThing(PipeSide, 1314, 40, 4);
      pushPreThing(PipeVertical, 1330, 88, 64);
      makeCeiling(1274, 7);
      fillPreThing(Brick, 1346, 32, 7, 7, 8, 8);
      pushPreThing(ScrollEnabler, 1340, ceilmax);
      makeCeiling(1346, 17);
      pushPreWarpWorld(1400, 0, [[4,1],[3,1],[2,1]], 0, true);
      fillPreThing(Brick, 1506, 8, 2, 11, 8, 8);
    }),
    new Area("Underworld", function() {
      setLocationGeneration(2);

      pushPreFloor(0, 0, 17);
      fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
      fillPreThing(Coin, 25, 7, 9, 1, 8, 8);
      fillPreThing(Brick, 24, 32, 9, 1, 8, 8);
      fillPreThing(Coin, 33, 39, 8, 1, 8, 8);
      pushPreThing(Brick, 96, 32, Coin);
      fillPreThing(Brick, 24, 64, 10, 4, 8, 8);
      fillPreThing(Brick, 104, 24, 2, 9, 8, 8);
      pushPreThing(PipeSide, 104, 16, 3);
      pushPreThing(PipeVertical, 120, 100, 100);
    }),
    new Area("Overworld", function() {
      setLocationGeneration(4);

      pushPrePattern("backreg", 104, 0, 1);
      pushPreFloor(0, 0, 58);
      pushPrePipe(0, 0, 16, true, false, 4);
      pushPreThing(Stone, 16, 8);
      pushPreThing(Stone, 24, 16, 1, 2);
      pushPreThing(Stone, 32, 24, 1, 3);
      pushPreThing(Stone, 40, 32, 1, 4);
      pushPreThing(Stone, 48, 40, 1, 5);
      pushPreThing(Stone, 56, 48, 1, 6);
      pushPreThing(Stone, 64, 56, 1, 7);
      pushPreThing(Stone, 72, 64, 2, 8);
      endCastleOutside(148);
    })
  ];
}

/* Random Maps */
function randMapType(map) {
  map.locs = [
    new Location(0, entryRandom)
  ];
  map.areas = [
    new Area(map.areatype, function() {
      setLocationGeneration(0);
      if(map.randname == "Underwater") {
        goUnderWater();
        // To do: make a unified function for adding in water & blocker, by the block width
        pushPreScenery("Water", 0, ceilmax - 21, (map.startwidth + 1) * 8 / 3, 1)
        pushPreThing(WaterBlock, 0, ceilmax, (map.startwidth + 1) * 8);
      }
      // if(map.randname == "Sky")
        // map.locs[0].entry = enterCloudWorld
    })
  ];
  map.treefunc = randTrue(3) ? pushPreTree : pushPreShroom;
  map.treeheight = map.treelev = map.sincechange = 0;
}
function randDayNight() {
  return randTrue(3) ? "" : " Night";
}
function WorldRandomOverworld(map) {
  map.random = true;
  map.randtype = pushRandomSectionOverworld;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {
    // castle added by entrancetype
    for(var i=0; i<10; ++i) {
      if(randTrue()) pushRandomGroundScenery(i * 8);
    }
  }
  map.startwidth = 14;
  map.onlysmartkoopas = false;
  randMapType(map);
}
function WorldRandomTrees(map) {
  map.random = true;
  map.randtype = pushRandomSectionTrees;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {
    map.treefunc(100, (map.treelev = randTrue() + 2) * 8, randTrue() + 4);
    map.startwidth += 7;
  }
  map.startwidth = 11;
  map.onlysmartkoopas = randTrue();
  randMapType(map);
}
function WorldRandomUnderworld(map) {
  map.random = true;
  map.randtype = pushRandomSectionUnderworld;
  map.randname = map.areatype = "Underworld";
  map.firstRandomThings = function(map) {
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
  }
  map.startwidth = randTrue(3) + 7;
  map.onlysmartkoopas = true;
  map.respawndist = 42;
  map.entrancetype = "Up";
  randMapType(map);
}
function WorldRandomUnderwater(map) {
  map.random = true;
  map.randtype = pushRandomSectionUnderwater;
  map.randname = "Underwater";
  map.areatype = "Underwater" + randDayNight();
  map.firstRandomThings = function(map) {}
  map.startwidth = randTrue(3) + 7;
  map.entrancetype = "Up";
  map.countCheep = map.countBlooper = 0;
  map.respawndist = 42;
  map.onlysmartkoopas = true;
  randMapType(map);
}
function WorldRandomBridge(map) {
  map.random = true;
  map.randtype = startRandomSectionBridge;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {}
  map.startwidth = 14;
  randMapType(map);
}
function WorldRandomSky(map) {
  map.random = true;
  map.randtype = startRandomSectionSky;
  map.randname = "Sky";
  map.areatype = "Sky" + randDayNight();
  map.entrancetype = "Vine";
  map.firstRandomThings = function(map) {
    pushPreThing(Stone, 0, 0, 4);
  }
  map.startwidth = 4;
  map.nofloor = true;
  randMapType(map);
}
function WorldRandomCastle(map) {
  map.random = true;
  map.randtype = startRandomSectionCastle;
  map.randname = map.areatype = map.entrancetype = "Castle";
  map.firstRandomThings = function(map) {
    startCastleInside();
    startCastle();
  };
  map.respawndist = 35;
  randMapType(map);
}
