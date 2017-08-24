var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
 
var app = express()
 
app.set('port', (process.env.PORT || 5000));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

function f_send(responder, msg) {
  responder().send(msg);
}
 
app.use(function (req, res, next) {
  req.session.responder = (function(){return function (){return res}})();

  if (!req.session.views) {
    req.session.views = {}
  }
 
  // get the url pathname 
  var pathname = parseurl(req).pathname
 
  // count the views 
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1
 
  next()
})
 
app.get('/foo', function (req, res, next) {
  console.log(req.session);
  f_send (req.session.responder, 'ID: '+req.sessionID+' you viewed this page ' + req.session.views['/foo'] + ' times');
})
 
app.get('/bar', function (req, res, next) {
  console.log(req.session);
  f_send (req.session.responder, 'ID: '+req.sessionID+' you viewed this page ' + req.session.views['/bar'] + ' times');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

