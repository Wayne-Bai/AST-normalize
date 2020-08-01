var Fiber;
var Server;
var server;
var randomstring = require("randomstring");

var MString = function () { }
var userConnected = new Array();

var init = function () {

    Fiber = require('fibers');
    Server = require("mongo-sync").Server;
    server = new Server('localhost');

}

var vibrate = function (caller, queryParams) {
    
    var brana = "";

    switch (caller) {

        case "App":
            brana = "./PBrane/AppBrane.json";
            break;
        case "Site":
            brana = "./PBrane/SiteBrane.json";
            break;
        case "Admin":
            brana = "./PBrane/AdminBrane.json";
            break;
    }
    
    return require(brana);
}

MString.prototype.GetFermionNBoson = function (caller, queryParams, callback) {
    init();
    
    Fiber(function () {
        try {
            
            var today = new Date();
            var from = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
            var to = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 7, 00, 00, 00));

            var materias = server.db("MTheory").getCollection("Theories")
            .distinct('Category', { Enabled: 1, When: { $gt: from, $lt: to } });
            
            callback(materias);
        }
        catch (e) {
            callback({ Strings: 'Collapsed' , Exception : e });
        }
    }).run();
}

MString.prototype.WacthUniverseExtension = function (caller, queryParams, callback) {
    init();
    
    Fiber(function () {
        try {
            
            var ObjectID = require('mongodb').ObjectID;
            var o_id = new ObjectID(queryParams._id);

            var materias = server.db("MTheory").getCollection("Theories")
            .findOne({ _id : o_id }, { Stats: 1, _id: 0 });
            
            callback(materias);
        }
        catch (e) {
            callback({ Strings: 'Collapsed' , Exception : e });
        }
    }).run();
}

MString.prototype.ExpandStar = function (caller, queryParams, callback) {
    init();
    
    Fiber(function () {
        try {
            
            var ObjectID = require('mongodb').ObjectID;
            var o_id = new ObjectID(queryParams._id);
            
            var materias = server.db("MTheory").getCollection("Theories")
            .findOne({ _id : o_id });
            
            init();
            materias.Stats.ViewedNumber += queryParams.Stats.ViewedNumber;
            materias.Stats.GoingTo += queryParams.Stats.GoingTo;

            server.db("MTheory").getCollection("Theories").save(materias);
            callback('');
        }
        catch (e) {
            callback('');
        }
    }).run();
}

MString.prototype.GetMateria = function (caller, queryParams, callback) {
    
    

    var quantesConfigurations = vibrate(caller, queryParams);
    var atmoicConfiguration = Object.keys(quantesConfigurations);
    
    var protons = new Object();
    
    atmoicConfiguration.forEach(function (key) {
        protons[key] = 1;
    });
    
    init();
    
    if (queryParams.When != undefined) {

        if (queryParams.When.$gt != undefined)
            queryParams.When.$gt = new Date(queryParams.When.$gt);
        if (queryParams.When.$lt != undefined)
            queryParams.When.$lt = new Date(queryParams.When.$lt);
    }

    Fiber(function () {
        try {

            var materias = server.db("MTheory").getCollection("Theories")
            .find(queryParams, protons).toArray();

            callback(materias);
        }
        catch (e) {
            callback({ Strings: 'Collapsed' , Exception : e });
        }
    }).run();
}

MString.prototype.UniverseComposition = function (type,value){

    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
        {
            host     : 'localhost',
            user     : 'root',
            password : 'cfvABC2104',
            database : 'sbariapp',
        });
        
        connection.connect();
        
        value = value.replace("'", "''");
        
        var queryString = "INSERT INTO plaza (`Type`, `Value`, `When`) VALUES ('" + type.replace(/\'/g, "''")+ "', '" + value.replace(/\'/g, "''") + "', '" + new Date().getFullYear() + "/" + (new Date().getMonth() + 1).toString() + "/" + new Date().getDate() + "');";
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) return;
        });
    }
    catch (e) {
    }
    
    connection.end();
}

MString.prototype.CreateSolarSystem = function (email,password,telephone,callback) {
    
    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
            {
                host     : 'localhost',
                user     : 'root',
                password : 'cfvABC2104',
                database : 'sbariapp',
            });
        
        connection.connect();
        
        var queryString = "SELECT Email FROM users where Email='" + email.replace(/\'/g, "''") + "'";
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) {
                callback({ Error: "Impossibile effettuare la registrazione.Errore di Orion!" });
                return;
            }
            if (rows.length > 0) {
                callback({ Error: "Esiste gia' un utente registrato con questa email." });
                return;
            }

            queryString = "INSERT INTO users (`Username`, `Email`, `Password`,`Telephone`,`RegisteredSince`) VALUES ('" + email.replace(/\'/g, "''") + "', '" + 
            email.replace(/\'/g, "''") + "', '" + password.replace(/\'/g, "''") + "','" + telephone.replace(/\'/g, "''") + "','" + new Date().getFullYear() + "/" + (new Date().getMonth() + 1).toString() + "/" + new Date().getDate() + "');";

            connection.query(queryString, function (e, r, f) {

                if (e) {
                    callback({ Error: "Impossibile effettuare la registrazione.Errore di Orion!!" });
                    return;
                }
                
                connection.end();
                callback({ Ok: "OK" });
            });
        });
    }
    catch (e) {
    }
}

MString.prototype.GetSolarSystemComposition = function (caller, queryParams, callback) {
    
    var UserId = this.UserIdByToken(queryParams.params.token);
    if (UserId == 0) {
        callback({ AuthError: "Sessione scaduta riperete l'accesso" });
        return;
    }
    
    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
            {
                host     : 'localhost',
                user     : 'root',
                password : 'cfvABC2104',
                database : 'sbariapp',
            });
        
        connection.connect();
        
        var queryString = "SELECT * FROM users where Id='" + UserId + "'";
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) {
                callback({ Error: "Impossibile ottenere le informazioni dell'utente.Errore di Orion!" });
                return;
            }
            
            callback({ 'Email': rows[i].Email, 'Since': rows[i].RegisteredSince, 'Telephone': rows[i].Telephone });
        });
        connection.end();
    }
    catch (e) {
    }

}

MString.prototype.JumpWarmHole = function (caller, queryParams, callback) {
    
    var UserId = this.UserIdByToken(queryParams.params.token);
    if (UserId == 0) {
        callback({ AuthError: "Sessione scaduta riperete l'accesso" });
        return;
    }
    
    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
            {
                host     : 'localhost',
                user     : 'root',
                password : 'cfvABC2104',
                database : 'sbariapp',
            });
        
        connection.connect();
        
        var queryString = "SELECT * FROM kronos where UserId='" + UserId + "'";
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) {
                callback({ Error: "Impossibile ottenere le informazioni dell'utente.Errore di Orion!" });
                return;
            }
            
            var result = [];

            for (i = 0; i < rows.length; i++) 
                result.push({
                    'EventName': rows[i].Name , 
                    'Category': rows[i].Category , 
                    'Owner' : rows[i].Owner, 
                    'When' : rows[i].When, 
                    'Stats': {
                        ViewedNumber: rows[i].Viewed, 
                        GoingTo: rows[i].GoingTo
                    }
                });
            
            
            callback(result);
        });
        connection.end();
    }
    catch (e) {
    }

}

MString.prototype.GetIdrogen = function (caller, queryParams, callback) {
    
    var colors = ["#FF0F00" , "#FF6600", "#FF9E01", "#FCD202", "#F8FF01", "#B0DE09", "#04D215", "#0D8ECF", "#0D52D1", "#2A0CD0", "#8A0CCF", "#CD0D74"];
    
    
    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
            {
                host     : 'localhost',
                user     : 'root',
                password : 'cfvABC2104',
                database : 'sbariapp',
            });
        
        connection.connect();
        
        var now = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 0, 0, 0, 0);
        
        var queryString = "SELECT `Value` ,Count(*) as cnt FROM plaza where `When` >= '" +
                now.getFullYear() + "/" + now.getMonth() + "/" + (now.getDate() - 7).toString() + "' AND  `When` <= '" +
                now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate() + "'group by Value order by `When` desc LIMIT 5 ";
        
        var result = []
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) callback({ Error: "Errore di orion!" });
            
            for (i = 0; i < rows.length; i++) {
                
                var header = rows[i].Value;
                
                result.push({ 'header': header , 'val': rows[i].cnt , color : colors[Math.floor(Math.random() * 11) + 0] });
            
            }
            
            connection.end();
            callback(result);
            
        });
    }
    catch (e) {
    }
    
}

MString.prototype.GetUniverseComposition = function (caller, queryParams, callback) {
    
    var colors = ["#FF0F00" , "#FF6600", "#FF9E01", "#FCD202", "#F8FF01", "#B0DE09", "#04D215", "#0D8ECF", "#0D52D1", "#2A0CD0", "#8A0CCF", "#CD0D74"];
    

    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
            {
                host     : 'localhost',
                user     : 'root',
                password : 'cfvABC2104',
                database : 'sbariapp',
            });
        
        connection.connect();
        
        var now = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 0, 0, 0, 0);
        
        var queryString = "SELECT `When`,`Value` ,Count(*) as cnt FROM plaza where type = '" + queryParams.params.type.replace(/\'/g, "''") + "' AND `When` = '" +
        now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate() + "' group by Value";

        var today = [];
        var forward = [];
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) callback({ Error: "Errore di orion!" });
            
            for (i = 0; i < rows.length; i++) {
                
                var header = rows[i].Value;
                
                today.push({ 't': 'n', 'header': header , 'val': rows[i].cnt , color : colors[Math.floor(Math.random() * 11) + 0] });
            
            }
            
            queryString = "SELECT `When`,`Value` ,Count(*) as cnt FROM plaza where type = '" + queryParams.params.type.replace(/\'/g, "''") + "' AND `When` > '" +
                now.getFullYear() + "/" + now.getMonth() + "/" + (now.getDate() - 7).toString() + "' AND  `When` < '" +
                now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate() + "'group by Value";
            
            connection.query(queryString, function (e, r, fields) {
                
                if (e) callback({ Error: "Errore di orion!" });
                
                for (i = 0; i < r.length; i++) {
                    
                    var header = r[i].Value;
                    
                    forward.push({ 't': 'f', 'header': header , 'val': r[i].cnt, color : colors[Math.floor(Math.random() * 11) + 0]});
                }
                
                var result = { 'now': today, 'forward': forward };
                connection.end();
                callback(result);
            });
        });
    }
    catch (e) {
    }
    
}

MString.prototype.Stellarium = function (caller, queryParams, callback) {
    
    var UserId = this.UserIdByToken(queryParams.params.token);
    if (UserId == 0) {
        callback({ AuthError: "Sessione scaduta riperete l'accesso" });
        return;
    }
    init();
    
    Fiber(function () {
        try {
            
            var inPending = server.db("MTheory").getCollection("Theories")
            .find({
                "PublisherId": UserId ,
                Enabled : 0
            }).toArray().length;
            
            init();
            
            var running = server.db("MTheory").getCollection("Theories")
            .find({
                "PublisherId": UserId ,
                Enabled : 1
            }).toArray().length;
            
            callback({ Pending: inPending , Running: running });
        }
        catch (e) {
            callback({ Error: 'Collapsed' , Exception : e });
        }
    }).run();
}


MString.prototype.CreateMateria = function (caller, queryParams, callback) {
    
    var fs = require('fs');
    var imageData;
    var mimeType;
    var filePath;

    try {

        var dirPath = "D:\\SbariappImgs\\" + queryParams.ev.When.getTime().toString();
        fs.mkdirSync(dirPath);

        if (queryParams.thm != null) {
            imageData = queryParams.thm.data.replace(/^data:image\/png;base64,/, "");
            mimeType = queryParams.thm.type.replace("image/", "");
            filePath = dirPath + '\\th.' + mimeType;
            fs.writeFileSync(filePath, imageData, 'base64');
            queryParams.ev.Thumb = "file:///" + filePath;
        }
        if (queryParams.img != null) {
            imageData = queryParams.img.data.replace(/^data:image\/png;base64,/, "");
            mimeType = queryParams.img.type.replace("image/", "");
            filePath = dirPath + '\\im1.' + mimeType;
            fs.writeFileSync(filePath, imageData, 'base64');
            queryParams.ev.Img1 = "file:///" + filePath;
        }
        if (queryParams.img2 != null) {
            imageData = queryParams.img2.data.replace(/^data:image\/png;base64,/, "");
            mimeType = queryParams.img2.type.replace("image/", "");
            filePath = dirPath + '\\im2.' + mimeType;
            fs.writeFileSync(filePath, imageData, 'base64');
            queryParams.ev.Img2 = "file:///" + filePath;
        }
        if (queryParams.img3 != null) {
            imageData = queryParams.img3.data.replace(/^data:image\/png;base64,/, "");
            mimeType = queryParams.img3.type.replace("image/", "");
            filePath = dirPath + '\\im3.' + mimeType;
            fs.writeFileSync(filePath, imageData, 'base64');
            queryParams.ev.Img3 = "file:///" + filePath;
        }
    }
    catch (e) {
        callback({ Strings: 'File save Collapsed' , Exception : e });
        return;
    }
    
    queryParams.ev["Stats"] = new Object();
    queryParams.ev.Stats["ViewedNumber"] = 0;
    queryParams.ev.Stats["GoingTo"] = 0;
    queryParams.ev["Enabled"] = 0;
    queryParams.ev["Suggested"] = 0;

    init();
    
    Fiber(function () {
        try {

            var ev = server.db("MTheory").getCollection("Theories")
            .insert(queryParams.ev);

            callback("OK");
        }
        catch (e) {
            callback({ Strings: 'Insert Collapsed' , Exception : e });
        }
    }).run();
}

MString.prototype.AlterMateria = function (caller, queryParams, callback) {
    
    init();
    
    Fiber(function () {
        try {

            server.db("MTheory").getCollection("Theories")
            .update({ _id : queryParams._id }, { $set: queryParams })

            callback({ Strings: 'Materialized' });
        }
        catch (e) {
            callback({ Strings: 'Collapsed' , Exception : e  });
        }
    }).run();
}

MString.prototype.checkTokenExpired = function() {
    
    for (i = userConnected.length -1; i >=0; i--) {
        
        if (userConnected[i].LastOperation == undefined) {
            userConnected[i].spilce(i, 1);
            return true;
        }
        var diff = new Date() - userConnected[i].LastOperation;
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
        if (diffMins > 30) {
            userConnected.splice(i, 1);
            return true;
        }
    }
    return false;
}

MString.prototype.setNewLastOperation = function(authToken) {
    for (i = userConnected.length - 1; i >= 0; i--) {
        if (userConnected[i].Token === authToken) {
            userConnected[i].LastOperation = new Date();
            break;
        }
            
    }
}

function deleteUserToken(authToken) {
    for (i = userConnected.length - 1; i >= 0; i--) {
        if (userConnected[i].Token === authToken) {
            userConnected.splice(i, 1);
            break;
        }
    }
}

MString.prototype.UserIdByToken  = function(authToken) {
    for (i = userConnected.length - 1; i >= 0; i--) {
        if (userConnected[i].Token === authToken) {
            return userConnected[i].UserId
        }
    }

    return 0;
}

MString.prototype.UserConnected = function (authToken) {
    for (i = userConnected.length - 1; i >= 0; i--) {
        
        if (userConnected[i].LastOperation == undefined) {
            deleteUserToken(authToken)
            return false;
        }
        
        var diff = new Date() - userConnected[i].LastOperation;
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
        if (diffMins > 30) {
            deleteUserToken(authToken)
            return false;
        }
        else return true;
    }
}

function checkAndDeleteUserAlreadyConnected(userId){

    for (i = userConnected.length - 1; i >= 0; i--) {
        if (userConnected[i].UserId === userId) {
            userConnected.splice(i, 1);
            break;
        }
    }
}


MString.prototype.DestroyElement = function (caller, queryParams, callback) {

    if (queryParams.params.token == undefined || queryParams.token == '') {
        callback("OK");
    }

    deleteUserToken(queryParams.params.token);
    callback("OK");
}


MString.prototype.IdentifyElement = function (caller, queryParams, callback) {
    
    
    if (queryParams.params.userId == undefined || queryParams.params.userId == '' 
        || queryParams.params.pwd == undefined || queryParams.params.pwd == '') {
        
        callback({ AuthError: "Specificare le informazioni di login" });
        return;
    }
    
    var userId = queryParams.params.userId;
    var pwd = queryParams.params.pwd;
    
    try {
        var mysql = require('mysql');
        var connection = mysql.createConnection(
        {
            host     : 'localhost',
            user     : 'root',
            password : 'cfvABC2104',
            database : 'sbariapp',
        });
        
        connection.connect();
        
        var queryString = "SELECT * FROM users where Username ='" + userId.replace(/\'/g, "''") + "'";
        
        connection.query(queryString, function (err, rows, fields) {
            
            if (err) callback({ Error: "Errore di orion!" });
            if (rows.length == 0) {
                callback({ AuthError: "Nessun utente trovato con questo username" });
                return;
            }
            if (rows[0].Password != queryParams.params.pwd) {
                callback({ AuthError: "La password specificata non e' corretta" });
                return;
            }
            
            try {
                
                checkAndDeleteUserAlreadyConnected(rows[0].Id);
                var user = { UserId: rows[0].Id, Token: randomstring.generate(5), ConnectedAt: new Date(), LastOperation: new Date() };
                userConnected.push(user);
                
                callback(queryParams.params.userId + '|' + user.Token);
            }
            catch (e) {
                callback({ Error: e });
            }
        });
    }
    catch (e) {
        callback({ Error: e });
    }
    
    connection.end();
}

MString.prototype.DestroyMateria = function (caller, queryParams, callback) {
    
    init();
    
    Fiber(function () {
        try {
            
            server.db("MTheory").getCollection("Theories")
            .remove({ _id : queryParams._id });
            
            callback({ Strings: 'Materialized' });
        }
        catch (e) {
            callback({ Strings: 'Collapsed' , Exception : e });
        }
    }).run();
}

module.exports = new MString();

process.on('uncaughtException', function (err) {
    console.log("Orion error " + err);
});