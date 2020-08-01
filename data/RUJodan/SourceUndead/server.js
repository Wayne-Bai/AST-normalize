var express = require("express.io");
var mysql = require("mysql");
var post = require("./lib/posts");
var fs = require("fs");
var hash = require("password-hash");
var Player = require("./lib/Player");
var db = require("./lib/db");

var app = express();

app.http().io();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use("/css",express.static(__dirname+"/css"));
app.use("/js",express.static(__dirname+"/js"));


function authenticate(req,res,next) {
	if (!req.session.loggedIn) {
		fs.readFile('./html/login.html', "utf8", function(err, html) {
			res.send(html);
		});
	} else next();
}

function getPlayers(id,x,y) {
	//get players on tile
	var sql = "SELECT p.name FROM player p INNER JOIN player_data pd ON p.id = pd.id WHERE pd.id!="+id+" AND pd.x="+x+" AND pd.y="+y+" AND online=1";
	return db.query(sql).then(function(data) {
		return [data];
	});
}

function refreshPlayer(session) {
	var player = new Player(session.user,session.x,session.y,session.username,session.hp,session.maxHP);
	return player;
}

app.io.configure(function() {
	app.io.set("reconnection delay", 100);
	app.io.set("reconnection limit", 100);
	app.io.set("max reconnection attempts", Infinity)
});

//gets
app.get("/create",function(req,res) {
	fs.readFile("./html/createAccount.html","utf8",function(err,html) {
		res.send(html);
	});
});

app.io.route("stopDisconnection", function(req) {
	if (req.session.disconnection) {
		clearTimeout(req.session.disconnection);
		console.log("Timeout cleared");
	}
});

app.io.route("disconnect", function(req) {
	req.session.disconnection = setTimeout(function() {
		console.log("User timed out!");
		db.query("UPDATE player_data SET online=0 WHERE id="+mysql.escape(req.session.user));
		app.io.broadcast("event", {msg:req.session.username+" has logged out!"});
		app.io.broadcast("reloadXY");
		req.session.destroy();
	},5000);
});

app.io.route('getXY', function(req) {
	post.refresh(req.session.user).spread(function(obj) {
		var player = refreshPlayer(obj);
		req.session.x = player.getX();
		req.session.y = player.getY();
		req.io.emit("location",{loc:"("+player.getX()+","+player.getY()+")",check:player.getX()});
		getPlayers(req.session.user,req.session.x,req.session.y).spread(function(data){
			req.io.emit("coords", {
				name:data
			});
		});
	});
});

app.io.route("getHP", function(req) {
	db.query("SELECT hp,maxHP FROM player_data WHERE id="+req.session.user).spread(function(data){
		req.io.emit("updateHP", {hp:data.hp,maxHP:data.maxHP});
	});
});

app.io.route("getGold", function(req) {
	req.io.emit("updateGold", {gold:req.session.gold});
});

app.io.route('move', function(req,res) {
	var player = refreshPlayer(req.session);
	var dir = req.data.direction;
	var addX;
	var addY;
	switch (dir) {
		case "center":
			addX = addY = 0;
		case "nw":
			addX = addY = -1;
			break;
		case "ne":
			addX = 1;
			addY = -1;
			break;
		case "sw":
			addX = -1;
			addY = 1;
			break;
		case "se":
			addX = addY = 1;
			break;
		case "n":
			addX = 0;
			addY = -1;
			break;
		case "s":
			addX = 0;
			addY = 1;
			break;
		case "e":
			addX = 1;
			addY = 0;
			break;
		case "w":
			addX = -1;
			addY = 0;
			break;
	}
	player.move(addX,addY);
	if ((req.session.hp - 1) <= 0) req.session.hp += 0;
	else {
		req.session.hp -= 1;
		player.alterHP(-1);
	}
	req.session.x = player.getX();
	req.session.y = player.getY();
	req.io.emit("location",{loc:"("+player.getX()+","+player.getY()+")",check:player.getX()});
	req.io.emit("updateHP", {hp:player.getHP(),maxHP:player.getMaxHP()});
	req.io.broadcast("event", {msg:player.name+" has moved to ("+player.getX()+","+player.getY()+")"});
	app.io.broadcast("reloadXY");
});

app.get("/onePlayer",authenticate,function(req,res) {
	fs.readFile('./html/index.html',"utf8", function(err, html) {
        res.send(html);
    });
});

app.get("/",authenticate,function(req,res) {
	fs.readFile('./html/index.html',"utf8", function(err, html) {
        res.send(html);
    });
});

app.get("/logout",function(req,res) {
	db.query("UPDATE player_data SET online=0 WHERE id="+mysql.escape(req.session.user));
	req.io.broadcast("event", {msg:req.session.username+" has logged out!"});
	app.io.broadcast("reloadXY");
	req.session.destroy();
	res.redirect("/");
});

//posts
app.post("/createAccount",function(req,res) {
	post.createAccount(req.body.username,req.body.password,req.body.email).then(function(obj) {
		res.send(obj);
	});
});

app.post("/login",function(req,res) {
	post.login(req.body.user).spread(function(user) {
		if (user) {
			if (hash.verify(req.body.pass,user.password)) {
				req.session.loggedIn = true;
				req.session.user = user.id;
				req.session.x = user.x;
				req.session.y = user.y;
				req.session.hp = user.hp;
				req.session.maxHP = user.maxhp;
				req.session.username = user.name;
				res.send({
					"msg":"You have logged in!",
					"flag":false,
					"title":": Logged In"
				});
				req.io.broadcast("event", {msg:req.session.username+" has logged in!"});
				db.query("UPDATE player_data set online=1 WHERE id="+req.session.user);
				app.io.broadcast("reloadXY");
				console.log("Logged in...",req.sessionID)
			} else {
				res.send({
					"msg":"Your username and or password was incorrect.",
					"flag":true,
					"title":": Login Failed"
				});
			}
		} else {
			res.send({
				"msg":"This username does not exist!",
				"flag":true,
				"title":": Login Failed"
			});
		}
	});
});

app.server.listen(80, function() {
	console.log("Server running on port 80");
});