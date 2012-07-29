/* Capture MongoDB service credentials, or use local MongoDB install */
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
  var mongo = {"hostname":"localhost","port":27017,"username":"",
    "password":"","name":"","db":"db"}
}


// Set up a basic web server on local port localhost:3000, or assigned host/port at Cloud Foundry
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');

http.createServer(function (req, res) {
 	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(port, host);
