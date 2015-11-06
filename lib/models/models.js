var models = {
		index: require('./models/index'),
		various: require('./models/various'),
		boat: require('./models/boat'),
		labirint: require('./models/labirint'),
		games: require('./models/games'),
		snake: require('./models/snake')
	};
models.read = function(req, res, next) {
	models[req.params.model] ? models[req.params.model].read(req, res, next) : next();
};
models.create = function(req, res, next) {
	models[req.params.model] ? models[req.params.model].create(req, res, next) : next();
};
models.update = function(req, res, next) {
	return next();
};
models.del = function(req, res, next) {
	return next();
};
models.services = function(req, res, next) {
	models[req.params.model] ? models[req.params.model].services(req, res, next) : next();
};
models.error = function(err, req, res, next) {
	console.log(err);
	res.status(404).render('404');
};
module.exports = models;