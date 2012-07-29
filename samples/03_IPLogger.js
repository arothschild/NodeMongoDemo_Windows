/* Capture MongoDB service credentials, or use local MongoDB install */
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

/* HTTP Variables */
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');

// Set up a basic web server on local port localhost:3000, or assigned host/port at Cloud Foundry
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write(mongourl + '\n');
	// res.write(JSON.stringify(mongo) + '\n\n');
	// res.write(JSON.stringify(process.env.VCAP_SERVICES) + '\n');
	params = require('url').parse(req.url);
	if(params.pathname === '/history') {
		PrintVisits(req, res);
	} else {
		RecordVisit(req, res);
	}
}).listen(port, host);




// Record user visits
var RecordVisit = function(req, res){
	/* Connect to the DB and auth */
	require('mongodb').connect(mongourl, function(err, conn){
		conn.collection('ips', function(err, coll){
			/* Simple object to insert: ip address and date */
			objectToInsert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };
			/* Insert the object then print in response */
			/* Note the _id has been created */
			coll.insert( objectToInsert, {safe:true}, function(err){
				if(err) { console.log(err.stack); }
				// res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write(JSON.stringify(objectToInsert));
				res.end('\n');
			});
		});
	});
}

// Print last 10 visits
var PrintVisits = function(req, res){
	/* Connect to the DB and auth */
	require('mongodb').connect(mongourl, function(err, conn){
		conn.collection('ips', function(err, coll){
			/*find with limit:10 & sort */
			coll.find({}, {limit:10, sort:[['_id','desc']]}, function(err, cursor){
				cursor.toArray(function(err, items){
					// res.writeHead(200, {'Content-Type': 'text/plain'});
					res.write('about to start parsing '+items.length+' results\n');
					for(i=0; i < items.length; i++){
						res.write(JSON.stringify(items[i]) + "\n");
					}
					res.end();
				});
			});
		});
	});
}

		
