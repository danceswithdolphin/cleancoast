var first_line='';
var today_yyyy = '';
var today_mm = '';
var today_dd = '';
var x=0;
var y=0;

var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('> ');
var first=new Date();
today_yyyy = first.getFullYear();
today_mm = first.getMonth()+1;
today_mm = "0"+today_mm;
today_mm = today_mm.substring(today_mm.length -2);
today_dd = first.getDate();
today_dd = "0"+today_dd;
today_dd = today_dd.substring(today_dd.length - 2);
first_line = today_yyyy+'.'+today_mm+'.'+today_dd;
console.log('today is ' + first_line);
first=new Date(first_line);
x=first.getTime();

rl.prompt();
rl.on('line', 
  function(line) {
	  var d=new Date(line);
	  console.log('entered: '+d);
	  console.log('entered: '+d.toLocaleDateString());
	  console.log('entered: '+d.toLocaleTimeString());
	  console.log('entered: '+d.getTime());
	  y=d.getTime();
	  console.log('difference: '+(y-x)/(1000*60*60*24)+' days');
	  console.log('TZ offset: '+d.getTimezoneOffset()/60);
  	rl.prompt();
  }
).on('close', 
  function() {
    console.log('Have a great day!');
    process.exit(0);
  }
);
