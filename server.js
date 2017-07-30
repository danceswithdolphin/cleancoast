// server.js
// load the things we need
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var responder=null;
var the_file_id="";
var service = null;
var auth = null;
var the_content = "";

var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var TOKEN_PATH = 'drive-nodejs-quickstart.json';

var fileName = "";
var dirName = "";
var mydata = "";
var subtasks = 0;
var subdirs = [];
var files = [];

function f_stats_complete (res, subdirs, files) {
  res.send('?subdirs='+subdirs+'&files='+files);
}
function createCallback (_fullpath, _res) {
  return function (err, stats) { 	
    if (err) {
      console.log('fs.stat err='+err);    
    } else if (stats.isDirectory()) {
      subdirs.push(_fullpath);
    } else if (stats.isFile()) {
      files.push(_fullpath);
    }
    if (--subtasks === 0) {
      f_stats_complete (_res, subdirs, files);
    }
  }  
}

app.set('port', (process.env.PORT || 5000));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('pages/index.ejs');
});

app.get('/mission', function(req, res) {
    res.render('pages/Mission.ejs');
});

app.get('/contact-us', function(req, res) {
    res.render('pages/Contact-Us.ejs');
});

app.get('/xhr-stat',function(req,res){
  fileName=req.query.filename;
  fs.stat(fileName,(err,stats) => {
  res.send('?err='+err+'&stats='+JSON.stringify(stats));
  });
});

app.get('/xhr-unlink-file', function(req, res){
  fileName=req.query.filename;
  fs.unlink(fileName, (err) => {
    if (err) throw err;
    res.send('deleted '+ fileName + ' successfully');
  });
});

app.get('/xhr-write', function(req, res){
  fileName=req.query.filename;
  mydata=req.query.mydata;
  fs.open(fileName, 'w', (err,fd) => {
    if (err) { 
      console.log('err.code='+err.code);
      console.log('err='+err);
      if (err.code === 'ENOENT'){
	console.log('error='+err);      
        res.send('error=ENOENT')      
      } else {
        throw err;
      }
    }
    else {
      mydata = mydata.replace(/[\r]/gm,'');
      fs.writeFile(fd, mydata, (err, data) => {
        if (err) throw err;
        fs.close(fd, (err) => {
          if (err) throw err;
        });
        res.send('written successfully');
      });
    }
  });
});

app.get('/xhr-read', function(req, res){
  fileName=req.query.filename;
  fs.open(fileName, 'r', (err,fd) => {
    if (err) { 
      if (err.code === 'ENOENT'){
        res.send('error=ENOENT')      
      } else {
        res.send('error='+err);	      
      }
    } else {
      fs.readFile(fd, (err, data) => {
      if (err) throw err;
      mydata = data.toString();
      fs.close(fd, (err) => {
      if (err) throw err;
      });
      res.send(mydata);
      });
    };
  });
});

app.get('/xhr-mkdir', function(req, res){
  dirName=req.query.dirname;
  fs.mkdir(dirName, (err) => {
    if (err) {
      res.send('?error='+err);
    } else {
      res.send();
    }
  });
});

app.get('/xhr-rmdir', function(req, res){
  dirName=req.query.dirname;
  fs.rmdir(dirName, (err) => {
    if (err) {
      res.send('?error='+err);
    } else {
      res.send('OK');
    }
  });
});

console.log('defining xhr-readdir');
app.get ('/xhr-readdir', function(req,res){
  if (req.query.dirname) { 
    dirName=req.query.dirname;
    subdirs=[];
    files=[];
    fs.readdir(dirName, (err,data) => {
      if (err) { 
        if (err.code === 'ENOENT'){
	  res.send('error=ENOENT')      
        } else {
	  console.log('error='+err)
          res.send('error='+err);	      
          throw err;
        }
      } else {
	var arrLength=data.length;
	subtasks = arrLength;
	if (subtasks === 0){
          res.send('error=no entries in directory');
	}
	for (var i =0; i < arrLength; i++) {
          var fullpath=dirName+path.sep+data[i];
	  var stats = null;
	  fs.stat(fullpath, createCallback (fullpath, res));
	}
      }
    });
  } else {
    res.send('error=dirname missing from xhr-readdir parameters');
  }
});

console.log('defining drive-find');
app.get('/drive-find', 
	function (req, res){
        console.log('entering drive-file');
	// preserve res as a global resource using a closure
	responder=(function(){
		return function(){return res}
	})();
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', 
              function processClientSecrets(err, content){
    if (err) {
      console.log('Error loading client secret file: ' + err);
      res.send('error='+err);	      
      throw err;
      }
    // readFile completed successfully
    // Authorize a client with the loaded credentials, then call the
    //   Drive API.
    the_content = content; 
    authorize(JSON.parse(the_content), listFiles);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-find anonymous function
console.log('end defining drive-find');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      // getNewToken(oauth2Client, callback);
      console.log('Error loading token file: ' + err);
      res.send('error='+err);	      
      throw err;
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function listFiles(auth) {
  service = google.drive('v3');
  service.files.list({
    auth: auth,
    pageSize: 100,
    fields: "nextPageToken, files(id, name)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      // console.log('Files:');
      // console.log(JSON.stringify(files,null,2));
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
        if (file.name === 'Test') {
	  the_file_id = file.id;
	  console.log("The file id is " + the_file_id);
        }
	else
	{
	//  console.log('not equal')
	}
      }
      if (the_file_id){
        // revivify res
        responder().send('fileId='+the_file_id);
      } else {
        responder().send('error=not found');
      }
    }
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

