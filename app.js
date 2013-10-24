
/*
 * Simple Realtime Paint App
 * Execute "node app.js" to run server
 * Run client from browser with either http://localhost:3000 or http://IPADDRESS:3000
 * Change IPADDRESS to your private ip address to access across a network.
 * public/ folder contains client code
 *
 */

var express = require('express');
var app = express();
var routes = require('./routes');
var PORT = process.env.PORT || 5000;
var IPADDRESS = "localhost";  // can set this to your private ip address to be used across a network
var server = require('http').createServer(app).listen(PORT);
var io = require('socket.io').listen(server);
var path = require('path');
var clientsConnected = 0;
var drawPoints = [];

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

io.sockets.on('connection', function(client) {
	
	clientsConnected++;
	io.sockets.emit('redraw', drawPoints); // send existing drawing to clients
	io.sockets.emit('clients', clientsConnected); // send number of connected clients

	client.on('draw', function(data) {
		drawPoints.push(data);
		client.broadcast.emit('drawing', data);
	});

	client.on('refresh', function() {
		io.sockets.emit('redraw', drawPoints);
	});

	client.on('reset', function() {
		drawPoints = [];
		io.sockets.emit('clearcanvas');
	});

	client.on('disconnect', function() {
		clientsConnected--;
		io.sockets.emit('clients', clientsConnected);
	});

});


