// set up plain http server
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);

// set up a route to redirect http to https
app.get('*',function(req,res){  
        console.log('redirecting');
    res.redirect('https://dev.cleancoast.org'+req.url)
})

// have it listen on 80
server.listen(80,'dev.cleancoast.org');
