var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
// var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
//var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//    process.env.USERPROFILE) + '/.credentials/';
//var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';
var TOKEN_PATH = 'gmail-nodejs-send-quickstart.json';

console.log('starting')
var crlf = "\r\n";
var recipient = "danceswithdolphin@gmail.com"
var base64EncodedEmail ="";
var email = "";
email += "to: " + recipient;
email += crlf + crlf;
var html = 'Please click below to verify your email address' 
         +"\n"+'http://localhost:5000/verify.ejs?email=danceswithdolphin@gmail.com'
         + "\n\n" + 'If you email client does not display the above as a link, you may have to copy and paste it into a browser address bar.'
email += html;
console.log("email=" + email);
mybuffer = new Buffer(email);

var base64EncodedEmail = mybuffer.toString('base64');
// console.log('before:' + base64EncodedEmail);
base64EncodedEmail = base64EncodedEmail.replace(/\+/g,'-');
base64EncodedEmail = base64EncodedEmail.replace(/\//g,'_');
var indexof = base64EncodedEmail.indexOf('=');
if (indexof > 0){
  base64EncodedEmail=base64EncodedEmail.substr(0,indexof);
}
// console.log('after: ' + base64EncodedEmail);

// Load client secrets from a local file.
fs.readFile('client_secret_gmail.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  console.log(JSON.parse(content));
  authorize(JSON.parse(content), sendMessage);
});

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
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function sendMessage(auth) {
  var gmail = google.gmail('v1');
  gmail.users.messages.send({
    auth: auth,
//    userId: 'me',
    userId: 'joe@josephbonds.com',
    resource: {
      raw: base64EncodedEmail
    }
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
      // console.log ('Response:' + JSON.stringify(response));
      return;
    }
  });
}
