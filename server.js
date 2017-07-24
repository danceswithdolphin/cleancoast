// server.js
// load the things we need
var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');


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
    console.log('rendering');	
    res.render('pages/index.ejs');
});

app.get('/cool', function(request, response) {
  response.send(cool());
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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

