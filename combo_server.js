var fs = require('fs');
// set up plain http server
var express = require('express');
var http = require('http');
var app = express();
// set up a route to redirect http to https
app.get('*',function(req,res){  
    //  console.log('redirecting'+JSON.stringify(req.params));
        console.log('hostname: '+req.hostname);
        console.log('path: '+req.path);
    //  console.log('ip: '+req.ip);
    //  console.log('method: '+req.method);
        console.log('originalUrl: '+req.originalUrl);
        console.log('url: '+req.url);
    //  console.log('protocol: '+req.protocol);

    //  console.log('url: '+req.url);
    //  res.send('url: '+req.url);
    res.redirect('https://'+req.hostname+req.url)
})

// have it listen on 80
var server = http.createServer(app);
//server.listen(80,'dev.cleancoast.org');
//server.listen(80,'localhost');
server.listen(80,'0.0.0.0');



// set up https server
var https = require ('https');
var key = fs.readFileSync('./cleancoast-key.pem');
var cert = fs.readFileSync('./cleancoast-cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var PORT = 443;
//var HOST = '35.196.224.238';
var HOST = '0.0.0.0';
app = express();
var router = express.Router();

// app.configure(function(){
//app.use(app.router);
//});

https_server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);


// routes
app.get('/hey', function(req, res) {
    res.send('HEY!');
});
app.get('/ho', function(req, res) {
    res.send('HO!');
});

