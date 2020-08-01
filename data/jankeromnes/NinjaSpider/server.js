// server.js: run this with Node.js in the web/ folder to start your server
// Copyright (c) 2011 Jan Keromnes & Yann Tyl. No rights reserved.

// import ScoutCamp's server module for easy web & ajax
var Camp = require ('./lib/ScoutCamp/camp.js');

// let's rock'n'roll!
Camp.Server.start (80, true);


