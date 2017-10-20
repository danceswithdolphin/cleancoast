var fs = require('fs');
// set up plain http server
var express = require('express');
var http = require('http');
var app = express();
// set up a route to redirect http to https
app.get('*',function(req,res){  
  console.log('protocol: '+req.protocol);
  console.log('method: '+req.method);
  console.log('hostname: '+req.hostname);
  console.log('originalUrl: '+req.originalUrl);
  console.log('url: '+req.url);
  res.redirect('https://'+req.hostname+req.url)
})

// have it listen on 80
var server = http.createServer(app);
server.listen(80,'0.0.0.0'); //!
console.log('http server 0.0.0.0 listening on port 80');


// set up https server
var https = require ('https');
var key = fs.readFileSync('./cleancoast-key.pem');
var cert = fs.readFileSync('./cleancoast-cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var PORT = 443;
var HOST = '0.0.0.0';
app = express();
var router = express.Router(); //do we need two?

var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var router = express.Router();

var config = require('./config.json')[app.get('env')];//square
var unirest = require('unirest');//square
var base_url = "https://connect.squareup.com/v2";//square
var request_params = null;
var product_cost = {"Student": 2500, "Senior": 2500, "Individual": 3500,"Family":5000,"Sustaining":10000,"Patron":50000,"Life":100000,"Test":101,"donate":101} 

// global variables
var transaction_success = false;      
var amount = 0;
var really_charging = true;

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var os = require('os');

var the_member = '';
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
var charge_queue = [];
var charge_responder_queue = [];
var timer_function = "";
var timer_reponder = null;
var timer_email = "";
var timer_registrations = [];
var timer_my_registrations = [];
var timer_other_registrations = [];
var timer_client_secrets = null;
var timer_file_contents = "";
var members_file_id = "0B4mhjBrP36gyVFlXa0FWSEVZeGM";
var users_file_id = "0B4mhjBrP36gyclRyS2RhSjFWVTA";
var registrations_file_id = "0B4mhjBrP36gyOHV3enZtUFJjaUk";
var trips_file_id = "0B4mhjBrP36gyTU80NUlVVkxTQTQ";
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
var members_responder=null;
var backup_responder=null;
var download_responder=null;
var restore_responder=null;
var the_file_id = "";
var the_file_contents = '';
var the_users_file_contents = '';
var download_file_contents = '';
var backup_file_contents = '';
var restore_registrations_content = '';
var restore_users_content = '';
var restore_trips_content = '';
var service = null;
var auth = null;
var the_content = "";
var the_members_content = "";
var the_users_content = "";
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

app.set('port', (process.env.PORT || 80));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);

console.log ('env: '+ app.get ('env'));
  
// catch 404 and forward to error handler
// How does this work?
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
//}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//console.log('defining POST /charges/charge_card');
router.post('/charges/charge_card', function(req,res,next){
//console.log('executing POST /charges/charge_card');
  transaction_success = false;      
  var charge_responder=(function(){
      return function(){return res}
  })();
	var location;
	request_params = req.body;
  if (really_charging) {
	unirest.get(base_url + '/locations')
	.headers({
		'Authorization': 'Bearer ' + config.squareAccessToken,
		'Accept': 'application/json'
	})
	.end(function (response) {

		for (var i = response.body.locations.length - 1; i >= 0; i--) {
			if(response.body.locations[i].capabilities.indexOf("CREDIT_CARD_PROCESSING")>-1){
				location = response.body.locations[i];
				break;
			}
			if(i==0){
				return res.json({status: 400, errors: [{"detail": "No locations have credit card processing available."}] });
			}
		}

		var token = require('crypto').randomBytes(64).toString('hex');

		//Check if product exists
		if (!product_cost.hasOwnProperty(request_params.product_id)) {
			return res.json({status: 400, errors: [{"detail": "Product Unavailable"}] })
		}

		//Make sure amount is a valid integer
    if (request_params.product_id === "donate"){
      amount = parseInt(request_params.amount);
    } else {
		  amount = product_cost[request_params.product_id];
    }

		request_body = {
			card_nonce: request_params.nonce,
			amount_money: {
				amount: amount,
				currency: 'USD'
			},
			idempotency_key: token
		}
		unirest.post(base_url + '/locations/' + location.id + "/transactions")
		.headers({
			'Authorization': 'Bearer ' + config.squareAccessToken,
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		})
		.send(request_body)
		.end(function(response){
			if (response.body.errors){
        console.log('response has errors');
        console.log(JSON.stringify(response.body.errors));
				return res.json({status: 400, errors: response.body.errors})
        console.log('!! cannot happen !! continuing after errors');
			}else{
        transaction_success = true;      
				// res.json({status: 200});
        //! append to members.csv here
        console.log ('product_id: '+request_params.product_id);
        console.log ('name: '+request_params.name);
        console.log('transaction successful '+ amount);
        f_transaction_complete(charge_responder);
			}
		})

	});
 } else {
				// res.json({status: 200});
 } // really_charging else
// here after launching trasaction, but before it completes  
 console.log('end of transaction launch'); 
}); // router post

function f_transaction_complete(charge_responder) {
 if (transaction_success){ 
 var memrec= request_params.name + ','; 
 memrec += request_params.street_address_1 + ',';
 memrec += request_params.street_address_2 + ',';
 memrec += request_params.city + ',';
 memrec += request_params.state + ',';
 memrec += request_params.zip + ',' + request_params.email + ',';
 memrec += request_params.mobile + ',';
 memrec += request_params.home + ',';
 if (really_charging) {
   memrec += request_params.product_id + ',online';
 } else {
   memrec += request_params.product_id + ',not_charging';
 }
 if (request_params.product_id === 'donate') {
   memrec += ","+request_params.amount;
 }else
   memrec += ","+product_cost[request_params.product_id];      
 var now=new Date();
 var now_yyyy = now.getFullYear();
 var now_mm = now.getMonth()+1;
     now_mm = "0"+now_mm;
     now_mm = now_mm.substring(now_mm.length -2);
 var now_dd = now.getDate();
     now_dd = "0"+now_dd;
     now_dd = now_dd.substring(now_dd.length - 2);
 var now_hr = now.getHours();   
 var now_min = now.getMinutes();
 now_str = now_yyyy+'.'+now_mm+'.'+now_dd+' '+now_hr+':'+now_min;
 memrec += ","+now_str;
 memrec += "\n";
 fs.appendFile("public/data/members.csv",memrec,(err,data) => {
  if (err) throw err;
  //charge_responder().send('appended successfully');
  charge_responder().json({status: 200});
 })
// write_to_members (memrec, charge_responder);
 console.log ('new member: ' + memrec); 
 }
}
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

router.get('/', function(req, res) {
    the_date = new Date();
    console.log('/home ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/index.ejs');
});
router.get('/hostname',function (req,res) {
  console.log('hostname='+os.hostname());      
  console.log(req.get('host'));
  res.send(req.get('host'));
})

router.get('/mission', function(req, res) {
    the_date = new Date();
    console.log('/mission ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/Mission.ejs');
});

router.get('/membership', function(req, res) {
    the_date = new Date();
    console.log('/membership ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/membership.ejs');
});

router.get('/contact-us', function(req, res) {
    the_date = new Date();
    console.log('/contact-us ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/Contact-Us.ejs');
});

router.get('/trip-registration', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration.ejs');
});

router.get('/trip-registration-1', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration-1 ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration-1.ejs');
});

router.get('/trip-registration-2', function(req, res) {
    the_date = new Date();
    console.log('/trip-registration-2 ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/trip-registration-2.ejs');
});

router.get('/calendar', function(req, res) {
    the_date = new Date();
    console.log('/calendar ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/calendar.ejs');
});

router.get('/charter', function(req, res) {
    the_date = new Date();
    console.log('/charter ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/charter.ejs');
});

router.get('/oysterroast', function(req, res) {
    the_date = new Date();
    console.log('/charter ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/oysterroast.ejs');
});

router.get('/newsletter', function(req, res) {
    the_date = new Date();
    console.log('/newsletter ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/newsletter.ejs');
});

router.get('/new-member-application', function(req, res) {
    the_date = new Date();
    console.log('/new-member-application ip ' + req.ip + ' date '+ the_date.toString());
    res.render('pages/new_member_application.ejs');
});

router.get('/drive-add-member',
	function (req, res){
    the_date = new Date();
    console.log('/drive-add-member ip ' + req.ip + ' date '+ the_date.toString());
	  the_member=req.query.member;
    fs.appendFile("public/data/members.csv",the_member,(err,data) => {
      if (err) throw err;
      res.send('member appended successfully');
    })
}) // end of drive-add-member anonymous function

router.get('/verify-email', 
  function(req, res) {
    the_date = new Date();
    console.log('/verify-email ip ' + req.ip + ' date '+ the_date.toString());
    selected_email = req.query.email;
    responder=(function(){
      return function(){return res}
    })();
    verifyReadUsers();        
  }
);

function verifyReadUsers() {
  fs.readFile("public/data/users.json",(err,data) => {
    if (err) throw err;
    the_file_contents = data;
    the_file_contents = JSON.parse(the_file_contents);
    users = the_file_contents;
    users.forEach(function(item,index){
      user = item.slice(0); // make a copy
      [email,name,mobile,home,verified] = user;
      if (email === selected_email) {
        verified = "yes";
        user = [email, name, mobile, home, verified];
        users[index] = user;
      }
    })
  })
  verifyUploadUsers();
}

function verifyUploadUsers (auth) {
  the_file_contents = JSON.stringify(users);
  fs.writeFile("public/data/users.json",the_file_contents, 
  (err)=>{
    if (err) throw err;
    responder().render('pages/verify-email.ejs',{response:'update successful'});
  })
}

// registration-1.ejs still reads all users, change to read specific user
router.get('/drive-read-users', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-read-users ip ' + req.ip + ' date '+ the_date.toString());
    fs.readFile("public/data/users.json",(err,data)=> {
      if (err) throw err;
      the_file_contents = data;
      res.send('fileContents='+the_file_contents);
    })
  } // end of drive-read-users anonymous function
) // end of router.get

// invoked from trip-registration-2.ejs
router.get('/drive-read-trips', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-read-trips ip ' + req.ip + ' date '+ the_date.toString());
    fs.readFile("public/data/trips.json",
      (err,data)=>{
        if (err) throw err;
        // drop old trips
        the_file_contents = data;
        trips = JSON.parse(the_file_contents);
        my_trips = [];
        trips.forEach(function(item,index){
          trip = item.slice(0); // make a copy
          if ((f_date_is_future(trip))) {
            my_trips.push(trip);
          }
        })
        the_file_contents = JSON.stringify(my_trips);
        res.send('fileContents='+the_file_contents);
      }
    )
  }
)

router.get('/drive-read-registrations', 
	function (req, res){
    fs.readFile("public/data/registrations.json",
      (err,data)=>{
        if (err) throw err;
        // drop old registationss
        selected_email = req.query.email;
        the_file_contents = data;
        registrations = JSON.parse(the_file_contents);
        my_registrations = [];
        registrations.forEach(function(item,index){
          registration = item.slice(0); // make a copy
          [email,trip,adults,children] = registration;
          if ((email === selected_email) && (f_date_is_future(trip))) {
            my_registrations.push(registration);
          }
        })
        the_file_contents = JSON.stringify(my_registrations);
        res.send('fileContents='+the_file_contents);
      }
    )
  }
)

// run as first step away from google drive, then delete this code
router.get('/drive-backup', 
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
    backup_fileName="public/data/registrations.json";
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
    backup_fileName="public/data/users.json";
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
    backup_fileName="public/data/trips.json";
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
          backupGetMembers(auth);
        });
      }
    });
    //
  })
}

function backupGetMembers(auth) {
  service = google.drive('v3');
  service.files.get({
    auth: auth,
    fileId: members_file_id,
    alt: 'media' 	  
  }, function(err, response, therest) {
    if (err) {
      console.log('backupGetMembers The API returned an error: ' + err);
      return;
    }
    //console.log("get :  "+response);
    response=response.replace(/\r/g,'');
    backup_file_contents = response;
    //backup_file_contents = JSON.parse(response);
    //console.log("parsed: "+backup_file_contents);
    // write members.csv
    backup_fileName="public/data/members.csv";
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

// download.html        
router.get('/drive-download-registrations', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-download-registrations ip ' + req.ip + ' date '+ the_date.toString());
	// preserve res as a global resource using a closure
	download_responder=(function(){
		return function(){return res}
	})();
  downloadGetRegistrations();
}) // end of drive-download-registrations function

function downloadGetRegistrations() {
  console.log('downloadGetRegistrations entered');
  fs.readFile("public/data/registrations.json",
  (err,data) => {
    if (err) throw err;      
    download_file_contents = data;
    console.log('registrations have been read');
    downloadParseAndWrite();
  });
}

function downloadParseAndWrite() {
  registrations = JSON.parse(download_file_contents);
  download_contents = '"email","trip","adults","children"\n';
  registrations.forEach(function(item,index){
    [email,trip,adults,children] = item;
    if (f_date_is_future(trip)) {
      download_contents += '"'+email+'","'+trip+'","'+adults+'","'+children+'"'+"\n";      
    }
  });
  // write registations.csv
  console.log('registrations will be written');
  fs.writeFile("public/data/registrations.csv", download_contents, 
  (err,data) => {
    if (err) throw err;
    console.log('registration download responding');
    download_responder().send('written successfully');
  })
}

// for trip-registration-1       
router.get('/drive-update-users', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-update-users ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_contents = req.query.fileContents;
    fs.writeFile("public/data/users.json",the_file_contents,
    (err, data) => {
      if (err) throw err;
      res.send('update successful');
    })
  }
)  

router.get('/drive-update-registrations', 
	function (req, res){
    the_date = new Date();
    console.log('/drive-update-registrations ip ' + req.ip + ' date '+ the_date.toString());
	  the_file_id = req.query.fileId;
	  the_file_contents = req.query.fileContents;
	  // preserve res as a global resource using a closure
	  timer_responder=(function(){
		  return function(){return res}
	  })();
    timer_queue_length = timer_queue.length;
    timer_function = "upload_registrations";
    timer_email = req.query.email;
    timer_my_registrations = JSON.parse (req.query.fileContents);
    timer_queue.push ([timer_function, timer_email,timer_my_registrations, timer_responder]);
    f_run_timer();
}) // end of drive-update-registrations anonymous function

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
  f_get_other_registrations();
} 

function f_get_other_registrations () {
  fs.readFile("public/data/registrations.json",
  (err, data) => {
    if (err) throw err;
    timer_file_contents = data;
    timer_registrations = JSON.parse(timer_file_contents);
    timer_other_registrations = [];
    timer_registrations.forEach(function(item,index){
      timer_registration = item.slice(0); // make a copy
      [timer_email,timer_trip,timer_adults,timer_children] = timer_registration;
      if ((timer_email !== selected_email) && (f_date_is_future(timer_trip))) {
        timer_other_registrations.push(timer_registration);
      }
    })
    f_upload_merged_registrations ();    
  })
}

function f_upload_merged_registrations () {
  timer_registrations = [];
  if (timer_other_registrations.length > 0) {
    timer_registrations = timer_other_registrations.slice(0);
    timer_registrations = timer_registrations.concat(timer_my_registrations);
  } else {
    timer_registrations = timer_my_registrations;
  }
  timer_registrations = timer_registrations.sort();
  //console.log('writing timer_registrations='+timer_registrations);
  timer_file_contents = JSON.stringify(timer_registrations);
  fs.writeFile("public/data/registrations.json",timer_file_contents, 
  (err)=>{
    if (err) throw err;
    timer_responder().send('update successful');
    timer_queue_length = timer_queue.length;
    if (timer_queue_length > 0) {
      f_timer_tick();
    }
  })
}

router.get('/log', function(req, res) {
  console.log(req.query.s);
  res.send("ok");
})

router.get('/gmail-send',
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
    console.log("get :  "+response);
    the_file_contents = response;
    //the_file_contents = JSON.parse(response);
    //console.log("parsed: "+the_file_contents);
    the_file_contents = the_file_contents.replace('%5b','[')
		                                     .replace('%5d', ']')
					                               .replace('%22','"');
    if (processing_url === "drive-read-registrations") {
      console.log('the_file_contents: '+the_file_contents);
      registrations = JSON.parse(the_file_contents);
      console.log(registrations);
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

https_server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);
