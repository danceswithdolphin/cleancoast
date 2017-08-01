// server.js
// load the things we need
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var the_file_name = '';
var responder=null;
var the_file_id = "";
var the_file_contents = '';
var service = null;
var auth = null;
var the_content = "";

var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
// var TOKEN_PATH = 'drive-nodejs-quickstart.json';

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

app.get('/trip-registration', function(req, res) {
    res.render('pages/trip-registration.ejs');
});

app.get('/drive-find', 
	function (req, res){
	  the_file_name=req.query.filename;
	  console.log ('the target is '+the_file_name);
        // console.log('entering drive-find');
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

app.get('/drive-get', 
	function (req, res){
	  the_file_id=req.query.fileId;
	  console.log ('the target id is '+the_file_id);
        // console.log('entering drive-get');
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
    authorize(JSON.parse(the_content), getFile);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-get anonymous function

app.get('/drive-upload', 
	function (req, res){
	  the_file_id = req.query.fileId;
	  the_file_contents = req.query.fileContents;
        console.log('entering drive-upload');
	console.log ('the target id is '+the_file_id);
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
    authorize(JSON.parse(the_content), uploadFile);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-upload anonymous function

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
      the_file_id = '';
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
        if (file.name === the_file_name) {
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

function getFile(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: the_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    the_file_contents = JSON.stringify(response);
    console.log(the_file_contents);
    // revivify res
    responder().send('fileContents='+the_file_contents);
  });
}

function uploadFile(auth) {
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: the_file_id,
    uploadType: 'media',
    resource: {
      name: 'Test',
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: the_file_contents
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log('update successful');
    // revivify res
    responder().send('update successful');
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

