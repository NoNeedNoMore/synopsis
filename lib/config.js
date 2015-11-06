var config = {};

config.homePage = '/index.html';
config.maxAge = 31557600000; // One year
config.conString = 'postgres://anihjfzmmjegeb:dC4khGQQ_fgtOck7s70F6mkcnc@ec2-79-125-27-0.eu-west-1.compute.amazonaws.com:5432/d7nf5bhdfrk24t?ssl=true';
config.sessionSecret = 'hZ9QaSs6tYMXZzN6MOWbX1dOGWFY2ftj41hjg9fTOPs';
config.session = {
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true
};
config.port = process.env.PORT || 1337;
config.maxRows = 100;
config.jadePretty = true;
config.dateFormat = 'dd.mm.yyyy hh24:mi:ss';
config.selfUrl = {
	hostname: 'mysynopsis.herokuapp.com',
	port: '80',
	path: config.homePage,
	method: 'GET'
};

module.exports = config;