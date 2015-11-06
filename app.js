var config = require('./lib/config'),
	models = require('./lib/models/models'),
	express = require('express'),
	app = express(),
	compression = require('compression'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session')(config.session),
	multer = require('multer'),
	http = require('http'),
	server = http.createServer(app).listen(config.port, function(){console.log(new Date() + " Listening at " + config.port);}),
	io = require('socket.io').listen(server);
(function selfPing(){http.get(config.selfUrl, function(res) {}); setTimeout(selfPing,2000000); })();
app
	.use ( compression() )
	.set ( 'views', __dirname + '/lib/views')
	.set ( 'view engine', 'jade')
	.use ( bodyParser.urlencoded({extended: true }) )
	.use ( cookieParser() )
	.use ( expressSession )
	.use ( express.static(__dirname + '/public', { maxAge: config.maxAge }) )
	.use ( multer({dest: __dirname + '/temp/', inMemory: true }) )
	.get ( '/', function(req, res) {res.redirect(config.homePage); })
	.get ( '/:model.:format/:id?', models.read )
	.post( '/:model.:format/create', models.create )
	.post( '/:model.:format/read/:id?', models.read )	
	.post( '/:model.:format/update/:id', models.update )
	.post( '/:model.:format/del/:id', models.del )
	.all ( '/:model.:format/services/:id', models.services )
	.all ( '*', function(req, res) {res.status(404).render('404'); })
	.use ( models.error );

process.on('uncaughtException', function(err) {
	console.log(err);
});