if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
  var mongo = {"hostname":"localhost","port":27017,"username":"",
    "password":"","name":"","db":"db"}
}

/* Set up MongoDB service */
var generate_mongo_url = function (obj) {
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'test');
	if (obj.username && obj.password) {
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
	} else {
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}
}
var mongourl = generate_mongo_url(mongo);


// Set up a basic web server on local port localhost:3000, or assigned host/port at Cloud Foundry
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');

http.createServer(function (req, res) {
 	res.writeHead(200, {'Content-Type': 'text/plain'});
 	//res.end('Hello World\n');
  	res.write(mongourl + '\n');
	res.write(JSON.stringify(mongo) + '\n\n');
	res.write(JSON.stringify(process.env.VCAP_SERVICES) + '\n');
	res.end('\n');
}).listen(port, host);
