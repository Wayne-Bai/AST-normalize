var express = require('express');
var app = module.exports = express();
var process = require('./process');

app.set('views',__dirname);
app.set('view engine','ejs');

app.get('/dashboard',function(req,res){
    
    if(!req.session.username)
	    res.redirect('/login');
    res.render('dashboard.ejs',{
        
        sess_user : (req.session.username) ? req.session.username : ''
    
    });
});
