! ✖ / env;
node(function()  {
      "use strict";
   }
());
var http = require("http");
var url = require("url");
var querystring = require("querystring");
var fs = require("fs");
var cookies = require("./node_modules/cookies");
var static_files =  {
   index.html:fs.readFileSync("index.html"), 
   game-client.js:fs.readFileSync("game-client.js"), 
   layout.css:fs.readFileSync("layout.css"), 
   color.css:fs.readFileSync("color.css"), 
   typography.css:fs.readFileSync("typography.css"), 
   normalize.css:fs.readFileSync("thirdparty/normalize.css"), 
   jquery.min.js:fs.readFileSync("thirdparty/jquery.min.js"), 
   jquery-ui.min.js:fs.readFileSync("thirdparty/jquery-ui.min.js"), 
   jquery.cookie.js:fs.readFileSync("thirdparty/jquery.cookie.js"), 
   light_noise_diagonal.png:fs.readFileSync("media/light_noise_diagonal.png"), 
   wood.png:fs.readFileSync("media/dark_wood.png")}
;
var CHATLINES = 1000;
function Game(name)  {
   this.name = name;
   this.board = [];
   this.boardmat = [];
   for (var i = 0; i < 181; i++)  {
         this.boardmat[i] = new Array(181);
      }
   this.players =  {} ;
   this.turn_pieces = [];
   this.chat = [];
   this.dimensions =  {
      top:90, 
      right:90, 
      bottom:90, 
      left:90   }
;
   this.pieces = [];
   var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
   var shapes = ["circle", "star", "diamond", "square", "triangle", "clover"];
   for (var c in colors)  {
         if (! colors.hasOwnProperty(c))  {
            continue;
         }
         for (var s in shapes)  {
               if (! shapes.hasOwnProperty(s))  {
                  continue;
               }
               this.pieces.push( {
                     piece:new Piece(shapes[s], colors[c]), 
                     count:3                  }
               );
            }
      }
}
;
Game.prototype.toJSON = function()  {
   return  {
      name:this.name, 
      players:this.players   }
;
}
;
Game.prototype.drawPieces = function(num)  {
   var draw = [];
   while (draw.length < num && this.pieces.length > 0)  {
         var r = Math.floor(Math.random() * this.pieces.length);
         var p = this.pieces[r].piece;
         draw.push(new Piece(p.shape, p.color));
         if (this.pieces[r].count = 1 < 1)  {
            this.pieces.splice(r, 1);
         }
      }
   return draw;
}
;
Game.prototype.returnPieces = function(pieces)  {
   for (var p in pieces)  {
         if (! pieces.hasOwnProperty(p))  {
            continue;
         }
         var piece = pieces[p];
         var found = this.pieces.some(function(x)  {
               if (piece.equals(x.piece))  {
                  x.count = 1;
                  return true;
               }
            }
         );
         if (! found)  {
            this.pieces.push( {
                  piece:new Piece(piece.shape, piece.color), 
                  count:1               }
            );
         }
      }
}
;
function Player(name)  {
   this.name = name;
   this.pieces = [];
   this.points = 0;
   this.has_turn = false;
}
;
function Piece(shape, color)  {
   this.shape = shape;
   this.color = color;
   this.equals = function(x)  {
      return this.shape === x.shape && this.color === x.color;
   }
;
}
;
function GamePiece(piece, row, column)  {
   this.piece = piece;
   this.row = row;
   this.column = column;
   this.equals = function(x)  {
      return this.column === x.column && this.row === x.row && this.piece.equals(x.piece);
   }
;
}
;
function respOk(response, data, type)  {
   if (type)  {
      headers =  {
         Content-Type:type      }
;
   }
   response.writeHead(200, headers);
   if (data)  {
      response.write(data, "utf-8");
   }
   response.end();
}
;
function addGamePiece(game, gamepiece)  {
   var row = gamepiece.row;
   var col = gamepiece.column;
   var points = 0;
   if (game.boardmat[row][col] !== undefined)  {
      return "GamePiece already exists.";
   }
   function _adjacentPieces(piece, getAdjacent)  {
      for (var i = 1; i <= 6; i++)  {
            adjacent = getAdjacent(i);
            if (typeof adjacent === "undefined")  {
               return false;
            }
             else if (i === 6)  {
               return adjacent;
            }
            var samecolor = adjacent.piece.color === piece.color;
            var sameshape = adjacent.piece.shape === piece.shape;
            if (samecolor || sameshape && ! samecolor && sameshape)  {
               if (! game.turn_pieces.some(function(x)  {
                     return x.equals(adjacent);
                  }
               ))  {
                  points = 1;
               }
               continue;
            }
            return adjacent;
         }
      return false;
   }
;
   var checkLeft = _adjacentPieces(gamepiece.piece, function(offset)  {
         var _row = row - offset;
         var piece = game.boardmat[_row][col];
         return piece && new GamePiece(piece, _row, col);
      }
   );
   var checkRight = _adjacentPieces(gamepiece.piece, function(offset)  {
         var _row = row + offset;
         var piece = game.boardmat[_row][col];
         return piece && new GamePiece(piece, _row, col);
      }
   );
   var checkUp = _adjacentPieces(gamepiece.piece, function(offset)  {
         var _col = col - offset;
         var piece = game.boardmat[row][_col];
         return piece && new GamePiece(piece, row, _col);
      }
   );
   var checkDown = _adjacentPieces(gamepiece.piece, function(offset)  {
         var _col = col + offset;
         var piece = game.boardmat[row][_col];
         return piece && new GamePiece(piece, row, _col);
      }
   );
   var badPiece = checkLeft || checkRight || checkUp || checkDown;
   if (badPiece !== false)  {
      return "GamePiece adjacent to incompatible piece: " + badPiece.piece.color + " " + badPiece.piece.shape;
   }
   function sameRowOrCol(otherpiece)  {
      return otherpiece.row === row || otherpiece.column === col;
   }
;
   if (game.turn_pieces)  {
      if (! game.turn_pieces.every(sameRowOrCol))  {
         return "GamePiece must be in same row or column as others " + "placed this turn.";
      }
   }
   game.turn_pieces.push(gamepiece);
   game.boardmat[row][col] = gamepiece.piece;
   game.board.push(gamepiece);
   var dim = game.dimensions;
   if (col < dim.left)  {
      dim.left = col;
   }
    else if (col > dim.right)  {
      dim.right = col;
   }
   if (row < dim.top)  {
      dim.top = row;
   }
    else if (row > dim.bottom)  {
      dim.bottom = row;
   }
   return points + 1;
}
;
function playerFromReq(request, response, game)  {
   var jar = new cookies(request, response);
   var p = decodeURIComponent(jar.get("player"));
   return game.players[p];
}
;
function requestQuery(request)  {
   return querystring.parse(url.parse(request.url).query);
}
;
function requestBody(request, onEnd)  {
   var fullBody = "";
   request.on("data", function(d)  {
         fullBody = d.toString();
      }
   );
   request.on("end", function()  {
         onEnd(querystring.parse(fullBody));
      }
   );
}
;
function nextTurn(game, player)  {
   if (player.has_turn === false)  {
      return ;
   }
   player.has_turn = false;
   var _players = Object.keys(game.players);
   var next_idx = _players.indexOf(player.name) + 1 % _players.length;
   var next = game.players[_players[next_idx]];
   next.has_turn = true;
   next.pieces = next.pieces.concat(game.drawPieces(6 - next.pieces.length));
}
;
function switchPlayers(game, player)  {
   game.turn_pieces = [];
   nextTurn(game, player);
}
;
function addPlayerToGame(game, playernm)  {
   var p = new Player(playernm);
   p.pieces = game.drawPieces(6);
   game.players[p.name] = p;
   if (Object.keys(game.players).length === 1)  {
      p.has_turn = true;
   }
}
;
function handlePlayers(request, response, game, path)  {
   var func, player, resp;
   if (! path.length)  {
      if (request.method === "POST")  {
         player = playerFromReq(request, response, game);
         if (player)  {
            func = function(form)  {
               if (form && form.end_turn)  {
                  switchPlayers(game, player);
                  respOk(response);
               }
            }
;
         }
          else  {
            func = function(form)  {
               if (form && form.name)  {
                  addPlayerToGame(game, form.name);
                  var jar = new cookies(request, response);
                  jar.set("player", encodeURIComponent(form.name),  {
                        httpOnly:false                     }
                  );
                  respOk(response, "", "text/json");
               }
            }
;
         }
         requestBody(request, func);
         return ;
      }
       else if (request.method === "DELETE")  {
         func = function(form)  {
            if (form && form.name)  {
               player = game.players[form.name];
               if (player === undefined)  {
                  response.writeHead(404,  {
                        Content-Type:"text/json"                     }
                  );
                  response.end();
                  return ;
               }
               nextTurn(game, player);
               game.returnPieces(player.pieces);
               delete game.players[form.name];
               if (Object.keys(game.players).length === 0)  {
                  delete games[game.name];
               }
               respOk(response);
            }
         }
;
         requestBody(request, func);
         return ;
      }
       else  {
         resp = JSON.stringify(game.players);
      }
   }
    else  {
      player = game.players[path[0]];
      if (typeof player === "undefined")  {
         response.writeHead(404,  {
               Content-Type:"text/json"            }
         );
         response.end();
         return ;
      }
      if (path[1] === "pieces")  {
         resp = JSON.stringify(player.pieces);
      }
   }
   respOk(response, resp, "text/json");
}
;
function handleGame(request, response, game, path)  {
   var resp;
   switch(path[0]) {
      case "board":
 
            if (request.method === "POST")  {
               requestBody(request, function(form)  {
                     var player = playerFromReq(request, response, game);
                     if (form && form.shape && form.color && form.row && form.column && player)  {
                        var row = parseInt(form.row, 10);
                        var column = parseInt(form.column, 10);
                        var piece = new Piece(form.shape, form.color);
                        var idx = - 1, _idx = 0;
                        for (var p in player.pieces)  {
                              var _piece = player.pieces[p];
                              if (piece.equals(_piece))  {
                                 idx = _idx;
                                 break;
                              }
                              _idx = 1;
                           }
                        if (idx > - 1)  {
                           var gp = new GamePiece(piece, row, column);
                           resp = addGamePiece(game, gp);
                           if (typeof resp === "string")  {
                              response.writeHead(409,  {
                                    Content-Type:"text/json"                                 }
                              );
                              response.write(resp, "utf-8");
                              response.end();
                              return ;
                           }
                            else  {
                              player.points = resp;
                              player.pieces.splice(idx, 1);
                              respOk(response, "", "text/json");
                           }
                        }
                     }
                  }
               );
               return ;
            }
            resp = JSON.stringify(game.board);
            break;
         
      case "players":
 
            handlePlayers(request, response, game, path.slice(1));
            return ;
         
      case "pieces":
 
            resp = JSON.stringify(game.pieces);
            break;
         
      case "chat":
 
            handleChat(request, response, game.chat);
            break;
         
      case "dimensions":
 
            resp = JSON.stringify(game.dimensions);
         
}
;
   respOk(response, resp, "text/json");
}
;
function handleGames(request, response, path)  {
   var resp;
   if (! path.length)  {
      if (request.method === "POST")  {
         requestBody(request, function(form)  {
               var gamenm = form.name;
               while (games[gamenm])  {
                     gamenm = gamenm + Math.floor(Math.random() * 10);
                  }
               var game = new Game(gamenm);
               var jar = new cookies(request, response);
               var p = decodeURIComponent(jar.get("player"));
               games[gamenm] = game;
               addPlayerToGame(game, p);
               respOk(response, JSON.stringify( {
                        name:gamenm                     }
                  ), "text/json");
            }
         );
      }
       else  {
         resp = JSON.stringify(games);
         respOk(response, resp, "text/json");
      }
   }
    else  {
      var game = games[path.shift()];
      if (game === undefined)  {
         response.writeHead(404,  {
               Content-Type:"text/json"            }
         );
         response.write("No such game exists", "utf-8");
         response.end();
         return ;
      }
      handleGame(request, response, game, path);
   }
}
;
function handleChat(request, response, chat)  {
   var resp, id;
   if (request.method === "POST")  {
      requestBody(request, function(form)  {
            while (chat.length > CHATLINES)  {
                  chat.shift();
               }
            if (chat.length)  {
               id = chat[chat.length - 1].id + 1;
            }
             else  {
               id = 0;
            }
            chat.push( {
                  id:id, 
                  name:form.name, 
                  input:form.input               }
            );
            respOk(response, "", "text/json");
         }
      );
   }
    else  {
      var form = requestQuery(request);
      var lastid = + form.lastid;
      if (lastid >= 0)  {
         for (var i = 0; i < chat.length; i++)  {
               if (chat[i].id === lastid)  {
                  break;
               }
            }
         resp = JSON.stringify(chat.slice(i + 1));
      }
       else  {
         resp = JSON.stringify(chat);
      }
      respOk(response, resp, "text/json");
   }
}
;
var chat = [];
var games =  {} ;
var server = http.createServer();
server.on("request", function(request, response)  {
      var u = url.parse(request.url);
      var path = u.pathname.split("/").map(function(x)  {
            return decodeURIComponent(x);
         }
      ).filter(function(x)  {
            return Boolean(x);
         }
      );
      switch(path[0]) {
         case "games":
 
               handleGames(request, response, path.slice(1));
               break;
            
         case "chat":
 
               handleChat(request, response, chat);
               break;
            
         default:
 
               var f;
               if (f = static_files[path[0]])  {
                  var type = "text/html";
                  if (path[0].search("css$") >= 0)  {
                     type = "text/css";
                  }
                   else if (path[0].search("js$") >= 0)  {
                     type = "text/javascript";
                  }
                  respOk(response, f, type);
               }
                else  {
                  respOk(response, static_files["index.html"], "text/html");
               }
               break;
            
}
;
   }
);
var port = process.env.PORT || process.env.npm_package_config_port || 8010;
server.listen(port);
