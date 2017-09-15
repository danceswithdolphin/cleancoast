// server.js
// load the things we need
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var os = require('os');
var http = require('http');
var download_contents = '';
var first_line='';
var first = null;
var today_yyyy = '';
var today_mm = '';
var today_dd = '';
var x=0;
var y=0;
var d = null;
var difference = 0;
var fileName = '';
var backup_fileName = '';

var timer_queue_length = 0;
var timer_queue_entry = [];
var timer_queue = [];
var timer_function = "";
var timer_reponder = null;
var timer_email = "";
var timer_registrations = [];
var timer_my_registrations = [];
var timer_other_registrations = [];
var timer_client_secrets = null;
var timer_file_contents = "";
var users_file_id = "0B4mhjBrP36gyclRyS2RhSjFWVTA";
var registrations_file_id = "0B4mhjBrP36gyOHV3enZtUFJjaUk";
var trips_file_id = "0B4mhjBrP36gyTU80NUlVVkxTQTQ";
var lock_file_id = "0B4mhjBrP36gyUW1yajhEcDZEcWM";
var trips = [];
var my_trips = [];
var registrations = [];
var my_registrations = [];
var other_registrations = [];
var registration = [];
var email = "";
var trip = "";
var adults = "";
var children = "";
var users = [];
var user = [];
var name = '';
var mobile = '';
var home = '';
var verified = '';
var indexof = 0;
var crlf = "\r\n";
var recipient = "danceswithdolphin@gmail.com"
var base64EncodedEmail ="";
var email_msg = "";
var selected_email = "";
var the_gmail_recipient = '';
var the_gmail_message = '';
var html = '';
var the_file_name = '';
var responder=null;
var backup_responder=null;
var download_responder=null;
var restore_responder=null;
var the_file_id = "";
var the_file_contents = '';
var download_file_contents = '';
var backup_file_contents = '';
var restore_registrations_content = '';
var restore_users_content = '';
var restore_trips_content = '';
var service = null;
var auth = null;
var the_content = "";
var backup_content = "";
var download_content = "";
var restore_content = "";
var the_date = 0;

var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var TOKEN_PATH = 'drive-nodejs-quickstart.json';
var TOKEN_PATH_GMAIL = 'gmail-nodejs-send-quickstart.json';
var processing_url = '';

app.set('port', (process.env.PORT || 5000));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

function f_date_is_future(trip) {
  first=new Date();
  today_yyyy = first.getFullYear();
  today_mm = first.getMonth()+1;
  today_mm = "0"+today_mm;
  today_mm = today_mm.substring(today_mm.length -2);
  today_dd = first.getDate();
  today_dd = "0"+today_dd;
  today_dd = today_dd.substring(today_dd.length - 2);
  first_line = today_yyyy+'.'+today_mm+'.'+today_dd;
  //console.log('today is ' + first_line);
  first=new Date(first_line);
  x=first.getTime();
  line = trip.substring(0,10);
  d=new Date(line);
  //console.log('trip: '+d);
  //console.log('trip: '+d.toLocaleDateString());
  //console.log('trip: '+d.toLocaleTimeString());
  //console.log('trip: '+d.getTime());
  y=d.getTime();
  difference = (y-x)/(1000*60*60*24); 
  //console.log('difference: '+(y-x)/(1000*60*60*24)+' days');
  //console.log('TZ offset: '+d.getTimezoneOffset()/60);
  if (difference > 0) {
    return true;
  } else {
    return false;
  }
}

app.get('/', function(req, res) {
    the_date = new Date();
    console.log('/home ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/index.ejs');
});
app.get('/hostname',function (req,res) {
  console.log('hostname='+os.hostname());      
  console.log(req.get('host'));
  res.send(req.get('host'));
})

app.get('/mission', function(req, res) {
    the_date = new Date();
    console.log('/mission ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/Mission.ejs');
});

app.get('/contact-us', function(req, res) {
    the_date = new Date();
    console.log('/contact-us ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/Contact-Us.ejs');
});

app.get('/trip-registration', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration.ejs');
});

app.get('/trip-registration-1', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration-1 ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration-1.ejs');
});

app.get('/trip-registration-2', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration-2 ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration-2.ejs');
});

app.get('/verify-email', 
  function(req, res) {
    the_date = new Date();
    console.log('/verify-email ip ' + req.ip + ' date '+ the_date.toString());
    selected_email = req.query.email;
    //res.render('pages/verify-email.ejs', {email: selected_email});
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
        authorize(JSON.parse(the_content), verifyReadUsers);
      } //end of processClientSecrets 
    ) // end of fs.readFile parameter list
  }
);

function verifyReadUsers(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: users_file_id,
    alt: 'media' 	  
    }, function(err, response, therest) {
      if (err) {
        console.log('verifyReadUsers The API returned an error: ' + err);
        return;
      }
      //console.log("get :  "+response);
      //console.log("typeof " + typeof(response));
      the_file_contents = response;
      the_file_contents = the_file_contents.replace('%5b','[')
		                                       .replace('%5d', ']')
				  	                               .replace('%22','"');
      //console.log('after replace '+the_file_contents);
      the_file_contents = JSON.parse(the_file_contents);
      //console.log("parsed: "+the_file_contents);
      //console.log(the_file_contents);
      //users = JSON.parse(the_file_contents);
      users = the_file_contents;
      //console.log(users);
      users.forEach(function(item,index){
        user = item.slice(0); // make a copy
        [email,name,mobile,home,verified] = user;
        if (email === selected_email) {
          verified = "yes";
          user = [email, name, mobile, home, verified];
          users[index] = user;
        }
      })
      //console.log ('attempting upload');
      //console.log(users);
      verifyUploadUsers(auth);
    }
  )
}

function verifyUploadUsers (auth) {
  the_file_contents = JSON.stringify(users);
  the_file_contents = the_file_contents.replace('[','%5b')
	                                     .replace(']','%5d')
				                               .replace('"','%22');
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: users_file_id,
    uploadType: 'media',
    resource: {
      name: "users.json",
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: the_file_contents
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('verifyUploadUsers The API returned an error: ' + err);
      return;
    }
    //console.log('update successful');
    // revivify res
    responder().render('pages/verify-email.ejs',{response:'update successful'});
  });
}

app.get('/drive-read', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-read ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_name=req.query.filename;
	  //console.log ('the target is '+the_file_name);
        // console.log('entering drive-read');
    processing_url = "drive-read";
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
}) // end of drive-read anonymous function

app.get('/drive-read-trips', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-read-trips ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_name=req.query.filename;
    selected_email = req.query.email;
	  //console.log ('the target is '+the_file_name);
        // console.log('entering drive-read-trips');
    processing_url = "drive-read-trips";
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
    authorize(JSON.parse(the_content), getFileTrips);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-find anonymous function

function getFileTrips(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: trips_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('getFileTrips The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    the_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    the_file_contents = the_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
      //console.log('drive-read-trips response: '+the_file_contents);
      trips = JSON.parse(the_file_contents);
      //console.log('parsed trips'+trips);
      my_trips = [];
      trips.forEach(function(item,index){
        trip = item.slice(0); // make a copy
        if ((f_date_is_future(trip))) {
          my_trips.push(trip);
        }
      })
      the_file_contents = JSON.stringify(my_trips);
    // revivify res
    //console.log('sending: '+the_file_contents);
    responder().send('fileContents='+the_file_contents);
  });
}

function getFileMyRegistrations(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: registrations_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('getFileMyRegistrations The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    the_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    if (processing_url === "drive-read-registrations") {
    the_file_contents = the_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
      //console.log('drive-read-registations response: '+the_file_contents);
      registrations = JSON.parse(the_file_contents);
      //console.log('parsed registrations'+registrations);
      my_registrations = [];
      registrations.forEach(function(item,index){
        registration = item.slice(0); // make a copy
        [email,trip,adults,children] = registration;
        if ((email === selected_email) && (f_date_is_future(trip))) {
          my_registrations.push(registration);
        }
      })
      the_file_contents = JSON.stringify(my_registrations);
    }
    // revivify res
    //console.log('sending: '+the_file_contents);
    responder().send('fileContents='+the_file_contents);
  });
}


app.get('/drive-read-registrations', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-read-registrations ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_name=req.query.filename;
    selected_email = req.query.email;
	  //console.log ('the target is '+the_file_name);
        // console.log('entering drive-read-registrations');
    processing_url = "drive-read-registrations";
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
    authorize(JSON.parse(the_content), getFileMyRegistrations);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-find anonymous function

function getFileMyRegistrations(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: registrations_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('getFileMyRegistrations The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    the_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    the_file_contents = the_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    //console.log('drive-read-registations response: '+the_file_contents);
    registrations = JSON.parse(the_file_contents);
    //console.log('parsed registrations'+registrations);
    my_registrations = [];
    registrations.forEach(function(item,index){
      registration = item.slice(0); // make a copy
      [email,trip,adults,children] = registration;
      if ((email === selected_email) && (f_date_is_future(trip))) {
        my_registrations.push(registration);
      }
    })
    the_file_contents = JSON.stringify(my_registrations);
    // revivify res
    //console.log('sending: '+the_file_contents);
    responder().send('fileContents='+the_file_contents);
  });
}

app.get ('/drive-restore',
  function (req,res) {
    the_date = new Date();
    console.log('/drive-restore ip ' + req.ip + ' date '+ the_date.toString());
    restore_responder=(function(){
      return function(){return res}
    })();
    fs.readFile('public/registrations.json', 
      function (err, content){
        if (err) {
          console.log('Error loading registrations.json file: ' + err);
          restore_responder().send('error='+err);	      
          throw err;
        }
        // readFile completed successfully
        restore_registrations_content = content.toString(); 
        //console.log('restore_registrations_content:'+restore_registrations_content);
        // Authorize a client with the loaded credentials, then call the
        //   Drive API.
        fs.readFile('client_secret.json', 
          function processClientSecrets(err, content){
            if (err) {
              console.log('Error loading client secret file: ' + err);
              restore_responder().send('error='+err);	      
              throw err;
            }
            // readFile completed successfully
            restore_content = content; 
            //console.log ('restore_content:'+restore_content);
            authorize(JSON.parse(restore_content), restoreWriteRegistrations);
          } //end of processClientSecrets 
        ) // end of fs.readFile parameter list
      } //end of readFile registrations.json async function 
    ) // end of fs.readFile registrations.json parameter list
  } // end of drive-restore async function
) // end of drive-restore parameter list 

function restoreWriteRegistrations (auth) {
  restore_registrations_content = restore_registrations_content.replace('[','%5b')
	                                     .replace(']','%5d')
				                               .replace('"','%22');
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: registrations_file_id,
    uploadType: 'media',
    resource: {
      name: "registrations.json",
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: restore_registrations_content
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('restoreWriteRegistrations The API returned an error: ' + err);
      return;
    }
    restore_get_users ();
    //authorize(JSON.parse(restore_content), restore_users);
  })
}

function restore_get_users (){
  fs.readFile('public/users.json', 
    function (err, content){
      if (err) {
        console.log('Error loading users.json file: ' + err);
        restore_responder().send('error='+err);	      
        throw err;
      }
      // readFile completed successfully
      restore_users_content = content.toString(); 
      fs.readFile('client_secret.json', 
        function processClientSecrets(err, content){
          if (err) {
            console.log('Error loading client secret file: ' + err);
            restore_responder().send('error='+err);	      
            throw err;
          }
          // readFile completed successfully
          restore_content = content; 
          //console.log ('restore_content:'+restore_content);
          authorize(JSON.parse(restore_content), restore_users);
      } //end of processClientSecrets 
    ) // end of fs.readFile parameter list
    } //end of readFile users.json async function 
  ) // end of fs.readFile users.json parameter list
}
function restore_users (auth) {
  restore_users_content = restore_users_content.replace('[','%5b')
	                                     .replace(']','%5d')
				                               .replace('"','%22');
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: users_file_id,
    uploadType: 'media',
    resource: {
      name: "users.json",
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: restore_users_content
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('restore_users The API returned an error: ' + err);
      return;
    }
    restore_get_trips (auth);
    //authorize(JSON.parse(restore_content), restore_trips);
  })
}

function restore_get_trips (auth) {
  fs.readFile('public/trips.json', 
    function (err, content){
      if (err) {
        console.log('Error loading trips.json file: ' + err);
        restore_responder().send('error='+err);	      
        throw err;
      }
      // readFile completed successfully
      restore_trips_content = content.toString(); 
      fs.readFile('client_secret.json', 
        function processClientSecrets(err, content){
          if (err) {
            console.log('Error loading client secret file: ' + err);
            restore_responder().send('error='+err);	      
            throw err;
          }
          // readFile completed successfully
          restore_content = content; 
          //console.log ('restore_content:'+restore_content);
          authorize(JSON.parse(restore_content), restore_trips);
        } //end of processClientSecrets 
      ) // end of fs.readFile parameter list
    } //end of readFile users.json async function 
  ) // end of fs.readFile users.json parameter list
}

function restore_trips (auth) {
  restore_trips_content = restore_trips_content.replace('[','%5b')
	                                     .replace(']','%5d')
				                               .replace('"','%22');
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: trips_file_id,
    uploadType: 'media',
    resource: {
      name: "trips.json",
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: restore_trips_content
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('restore_trips The API returned an error: ' + err);
      return;
    }
    restore_responder().send('restore complete');
  })
}

app.get('/drive-backup', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-backup ip ' + req.ip + ' date '+ the_date.toString());
	// preserve res as a global resource using a closure
	backup_responder=(function(){
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
    backup_content = content; 
    authorize(JSON.parse(backup_content), backupGetFiles);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-find anonymous function

function backupGetFiles(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: registrations_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('backupGetFiles The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    backup_file_contents = response;
    //backup_file_contents = JSON.parse(response);
    //console.log("parsed: "+backup_file_contents);
    backup_file_contents = backup_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    // write registrations.json
    backup_fileName="public/registrations.json";
    fs.open(backup_fileName, 'w', (err,fd) => {
      if (err) { 
        console.log('err.code='+err.code);
        console.log('err='+err);
        if (err.code === 'ENOENT'){
	        console.log('error='+err);      
          backup_responder().send('error=ENOENT')      
        } else {
          throw err;
        }
      } else {
        fs.writeFile(fd, backup_file_contents, (err, data) => {
          if (err) throw err;
          fs.close(fd, (err) => {
            if (err) throw err;
          });
          backupGetUsers(auth);
        });
      }
    });
    //
  })
}

function backupGetUsers(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: users_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('backupGetUsers The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    backup_file_contents = response;
    //backup_file_contents = JSON.parse(response);
    //console.log("parsed: "+backup_file_contents);
    backup_file_contents = backup_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    // write users.json
    backup_fileName="public/users.json";
    fs.open(backup_fileName, 'w', (err,fd) => {
      if (err) { 
        console.log('err.code='+err.code);
        console.log('err='+err);
        if (err.code === 'ENOENT'){
	        console.log('error='+err);      
          backup_responder().send('error=ENOENT')      
        } else {
          throw err;
        }
      } else {
        fs.writeFile(fd, backup_file_contents, (err, data) => {
          if (err) throw err;
          fs.close(fd, (err) => {
            if (err) throw err;
          });
          backupGetTrips(auth);
        });
      }
    });
    //
  })
}

function backupGetTrips(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: trips_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('backupGetTrips The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    backup_file_contents = response;
    //backup_file_contents = JSON.parse(response);
    //console.log("parsed: "+backup_file_contents);
    backup_file_contents = backup_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    // write trips.json
    backup_fileName="public/trips.json";
    fs.open(backup_fileName, 'w', (err,fd) => {
      if (err) { 
        console.log('err.code='+err.code);
        console.log('err='+err);
        if (err.code === 'ENOENT'){
	        console.log('error='+err);      
          backup_responder().send('error=ENOENT')      
        } else {
          throw err;
        }
      } else {
        fs.writeFile(fd, backup_file_contents, (err, data) => {
          if (err) throw err;
          fs.close(fd, (err) => {
            if (err) throw err;
          });
          backup_responder().send('backed up successfully');
        });
      }
    });
    //
  })
}

app.get('/drive-download-registrations', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-download-registrations ip ' + req.ip + ' date '+ the_date.toString());
	// preserve res as a global resource using a closure
	download_responder=(function(){
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
    download_content = content; 
    authorize(JSON.parse(download_content), downloadGetRegistrations);
    } //end of processClientSecrets 
  ) // end of fs.readFile parameter list
}) // end of drive-find anonymous function

function downloadGetRegistrations(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: registrations_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('downloadGetRegistrations The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    download_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    download_file_contents = download_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    //console.log('drive-read-registations response: '+the_file_contents);
    registrations = JSON.parse(download_file_contents);
    //console.log('parsed registrations'+registrations);
    download_contents = '"email","trip","adults","children"\n';
    registrations.forEach(function(item,index){
      [email,trip,adults,children] = item;
      if (f_date_is_future(trip)) {
        download_contents += '"'+email+'","'+trip+'","'+adults+'","'+children+'"'+"\n";      
      }
    })
    // write registations.csv
    fileName="public/registrations.csv";
    fs.open(fileName, 'w', (err,fd) => {
      if (err) { 
        console.log('err.code='+err.code);
        console.log('err='+err);
        if (err.code === 'ENOENT'){
	        console.log('error='+err);      
          download_responder().send('error=ENOENT')      
        } else {
          throw err;
        }
      } else {
        fs.writeFile(fd, download_contents, (err, data) => {
          if (err) throw err;
          fs.close(fd, (err) => {
            if (err) throw err;
          });
          download_responder().send('written successfully');
        });
      }
    });
    //
  })
}

app.get('/drive-find', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-find ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_name=req.query.filename;
	  //console.log ('the target is '+the_file_name);
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
    the_date = new Date();
    console.log('/drive-get ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_id=req.query.fileId;
	  //console.log ('the target id is '+the_file_id);
        // console.log('entering drive-get');
	// preserve res as a global resource using a closure
	responder=(function(){
		return function(){return res}
	})();
  // load client secrets from a local file.
  fs.readFile('client_secret.json', 
              function processclientsecrets(err, content){
    if (err) {
      //console.log('error loading client secret file: ' + err);
      res.send('error='+err);	      
      throw err;
      }
    // readfile completed successfully
    // authorize a client with the loaded credentials, then call the
    //   drive api.
    the_content = content; 
    authorize(JSON.parse(the_content), getFile); } //end of processclientsecrets 
  ) // end of fs.readfile parameter list
}) // end of drive-get anonymous function

app.get('/drive-upload', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-upload ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_id = req.query.fileId;
	  the_file_contents = req.query.fileContents;
    the_file_contents = the_file_contents.replace('[','%5b')
		                                     .replace(']','%5d')
					                               .replace('"','%22');
	  //console.log('upload: '+the_file_contents);
	  //console.log ('the target id is '+the_file_id);
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

app.get('/drive-upload-registrations', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-upload-registrations ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_id = req.query.fileId;
	  the_file_contents = req.query.fileContents;
    the_file_contents = the_file_contents.replace('[','%5b')
		                                     .replace(']','%5d')
					                               .replace('"','%22');
	  //console.log('upload: '+the_file_contents);
	  //console.log ('the target id is '+the_file_id);
	  // preserve res as a global resource using a closure
	  timer_responder=(function(){
		  return function(){return res}
	  })();
    timer_queue_length = timer_queue.length;
    timer_function = "upload_registrations";
    timer_email = req.query.email;
    timer_my_registrations = JSON.parse (req.query.fileContents);
    //console.log('req.query.fileContents='+timer_my_registrations);
    timer_queue.push ([timer_function, timer_email,timer_my_registrations, timer_responder]);
    f_run_timer();
}) // end of drive-upload anonymous function

function f_run_timer() {
  if (timer_queue_length === 0) {
    setTimeout(f_timer_tick, 20)
  }
}

function f_timer_tick () {
  timer_queue_entry = timer_queue.shift();        
  [timer_function, timer_email, timer_my_registrations, timer_responder] = timer_queue_entry;
  if (timer_function === "upload_registrations") {
    f_upload_registrations ();
  }
}

function f_upload_registrations () {
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', 
    function processClientSecrets(err, content){
      if (err) {
        console.log('Error loading client secret file: ' + err);
        timer_responder().send('error='+err);	      
        throw err;
      }
      // readFile completed successfully
      // Authorize a client with the loaded credentials, then call the
      //   Drive API.
      timer_client_secrets = content; 
      authorize(JSON.parse(timer_client_secrets), f_get_other_registrations);
    }
  )
}

function f_get_other_registrations (auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: registrations_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('f_get_other_registrations The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    timer_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    timer_file_contents = timer_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
      timer_registrations = JSON.parse(timer_file_contents);
      timer_other_registrations = [];
      timer_registrations.forEach(function(item,index){
        timer_registration = item.slice(0); // make a copy
        [timer_email,timer_trip,timer_adults,timer_children] = timer_registration;
        if ((timer_email !== selected_email) && (f_date_is_future(timer_trip))) {
          timer_other_registrations.push(timer_registration);
        }
      })
      f_upload_merged_registrations (auth);    
  });
};

function f_upload_merged_registrations (auth) {
  //console.log('timer_other_registrations.length:'+timer_other_registrations.length);      
  //console.log('timer_my_registrations.length:'+timer_my_registrations.length);      
  //console.log('timer_my_registrations='+timer_my_registrations);
  timer_registrations = [];
  if (timer_other_registrations.length > 0) {
    timer_registrations = timer_other_registrations.slice(0);
    timer_registrations = timer_registrations.concat(timer_my_registrations);
    //console.log('combined timer_registrations.length:'+timer_registrations.length);      
  } else {
    timer_registrations = timer_my_registrations;
  }
  timer_registrations = timer_registrations.sort();
  //console.log('writing timer_registrations='+timer_registrations);
  timer_file_contents = JSON.stringify(timer_registrations);
  timer_file_contents = timer_file_contents.replace('[','%5b')
	                                     .replace(']','%5d')
				                               .replace('"','%22');

  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: registrations_file_id,
    uploadType: 'media',
    resource: {
      name: the_file_name,
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: timer_file_contents
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('f_upload_merged_registrations The API returned an error: ' + err);
      return;
    }
    //console.log('update successful');
    // revivify res
    timer_responder().send('update successful');

    timer_queue_length = timer_queue.length;
    if (timer_queue_length > 0) {
      f_timer_tick();
    }
  });
}

app.get('/log', function(req, res) {
  console.log(req.query.s);
  res.send("ok");
})

app.get('/gmail-send',
  function (req, res) {
    the_date = new Date();
    console.log('/gmail-send ip ' + req.ip + ' date '+ the_date.toString());
  
    the_gmail_recipient = req.query.r;
    the_gmail_message = req.query.m;
    //console.log('to: '+the_gmail_recipient);
    //console.log('m: '+the_gmail_message);
	  responder=(function(){
		  return function(){return res}
    }())
    email_msg = "To: " + the_gmail_recipient+crlf;
    email_msg += "Subject: Email Verification"+crlf;
    email_msg += "Content-Type: text/html; char-set=utf-8"+crlf;
    email_msg += "Content-Transfer-Encoding: base64"
    email_msg += crlf + crlf;
    email_msg += "<html><body>"
    email_msg += the_gmail_message; 
    email_msg += "</body></html>";
    //console.log("email_msg=" + email_msg+'!!!!!');
    mybuffer = new Buffer(email_msg);

    base64EncodedEmail = mybuffer.toString('base64');
    base64EncodedEmail = base64EncodedEmail.replace(/\+/g,'-');
    base64EncodedEmail = base64EncodedEmail.replace(/\//g,'_');
    indexof = base64EncodedEmail.indexOf('=');
    if (indexof > 0){
      base64EncodedEmail=base64EncodedEmail.substr(0,indexof);
    }

    fs.readFile('client_secret_gmail.json', 
      function processClientSecrets(err, content){
        if (err) {
          console.log('Error loading client secret file: ' + err);
          res.send('error='+err);	      
          throw err;
        }
        // readFile completed successfully
        // Authorize a client with the loaded credentials, then call the
        //   gmail API.
        the_content = content; 
        //console.log(JSON.parse(content));
        authorize_gmail (JSON.parse(content), sendMessage);
        //res.send('ok');
      } //end of processClientSecrets 
    ) // end of fs.readFile parameter list
  })

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

function authorize_gmail(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH_GMAIL, function(err, token) {
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
      console.log('listFiles The API returned an error: ' + err);
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
        //console.log('%s (%s)', file.name, file.id);
        if (file.name === the_file_name) {
	        the_file_id = file.id;
	        //console.log("The file id is " + the_file_id);
        }
	else
	{
	//  console.log('not equal')
	}
      }
      if (the_file_id){
        // revivify res
        if ((processing_url === "drive-read") ||
            (processing_url === "drive-read-registrations")) {
	        //console.log ('targetting id is '+the_file_id);
          // authorize a client with the loaded credentials, then call the
          //   drive api.
          // one authorize is sufficent for several service calls !!!!!!  
          // authorize(JSON.parse(the_content), getFile);
          getFile(auth);
        } else {
          responder().send('fileId='+the_file_id);
        }
      } else {
        responder().send('error=not found');
      }
    }  // end files.length not = 0
  }); // end service.files.list completion function
}  // end of listFiles(auth)

function getFile(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: the_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('getFile The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    the_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    the_file_contents = the_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    if (processing_url === "drive-read-registrations") {
      //console.log(the_file_contents);
      registrations = JSON.parse(the_file_contents);
      //console.log(registrations);
      my_registrations = [];
      registrations.forEach(function(item,index){
        registration = item.slice(0); // make a copy
        [email,trip,adults,children] = registration;
        if (email === selected_email) {
          my_registrations.push(registration);
        }
      })
      the_file_contents = JSON.stringify(my_registrations);
    }
    // revivify res
    responder().send('fileId='+the_file_id+'&fileContents='+the_file_contents);
  });
}

function uploadFile(auth) {
  service = google.drive('v3');
  service.files.update ({
    auth: auth,
    fileId: the_file_id,
    uploadType: 'media',
    resource: {
      name: the_file_name,
      mimeType: 'text/plain'
    },
    media: {    
      mimeType: 'text/plain',
      body: the_file_contents
    }
  }, function(err, response, therest) {
    if (err) {
      console.log('uploadFile The API returned an error: ' + err);
      return;
    }
    //console.log('update successful');
    // revivify res
    responder().send('update successful');
  });
}

function sendMessage (auth) {
  var gmail = google.gmail('v1');
  gmail.users.messages.send({
    auth: auth,
    userId: 'joe@josephbonds.com',
    resource: {
      raw: base64EncodedEmail
    }
  }, function(err, response) {
    if (err) {
      console.log('sendMessage The API returned an error: ' + err);
      return;
    } else {
      //console.log ('Response:' + JSON.stringify(response));
      responder().send('ok');
      return;
    }
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

