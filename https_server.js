var fs = require('fs');
var express = require('express');

var https = require('https');
var key = fs.readFileSync('./cleancoast-key.pem');
var cert = fs.readFileSync('./cleancoast-cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var PORT = 443;
var HOST = 'dev.cleancoast.org';
app = express();
var router = express.Router();

// app.configure(function(){
//app.use(app.router);
//});

server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);


// routes
app.get('/hey', function(req, res) {
    res.send('HEY!');
});
app.get('/ho', function(req, res) {
    res.send('HO!');
});
