console.log('* [example2] sending test email without checking the result');
 
var send = require('gmail-send');
send({
  user: 'danceswithdolphin@gmail.com',    // Your GMail account used to send emails 
  pass: 'Hotstuff1',           // Application-specific password 
  to:   'danceswithdolphin@gmail.com',           // Send to yourself 
  subject: 'ping',
  text:    'gmail-send example 3',  // Plain text 
},function (err, res) {
  console.log('* [example] send() callback returned: err:', err, '; res:', res);
});                             // Send email without any check 
