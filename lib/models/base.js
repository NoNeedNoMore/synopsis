var config = require('../config'),
	pg = require('pg');

function Base(opts) {
	opts = opts || {};
	opts.services = opts.services || {};	
	this.opts = opts;
	return this;
};

module.exports = Base;

Base.prototype.read = function(req, res, next ) {
	if (req.params.format == 'html' && this.opts.render) {
		this.readHtml(req, res, next );
	} else if (req.params.format == 'json'){
		this.readJson(req, res, next );
	} else if (req.params.format == 'sgf'){
		this.readSgf(req, res, next );
	} else {
		next();
	};
};

Base.prototype.create = function(req, res, next ) {
	if (req.params.format == 'json'){
		this.createJson(req, res, next );
	} else if (req.params.format == 'sgf'){
		this.createSgf(req, res, next );
	} else {
		next();
	};
};

Base.prototype.update = function(req, res, next ) {
	if (req.params.format == 'json'){
		this.updateJson(req, res, next );
	} else {
		next();
	};
};

Base.prototype.del = function(req, res, next ) {
	if (req.params.format == 'json'){
		this.delJson(req, res, next );
	} else {
		next();
	};
};

Base.prototype.services = function(req, res, next ) {
	this.opts.services[req.params.id] ? this.opts.services[req.params.id](req, res, next) : next();
};

Base.prototype.readHtml = function(req, res, next ) {
	var viewOpts = this.opts.viewOpts;
	viewOpts.id = req.params.id;
	viewOpts.session = req.session;
	viewOpts.pretty = config.jadePretty;
	res.render(this.opts.render, viewOpts );
};


Base.prototype.readJson = function(req, res) {
	if (this.opts.perks && this.opts.perks.readJson && (!req.session.perks || req.session.perks.indexOf(this.opts.perks.readJson) == -1 )) {
		return res.status(200).json({error: {text: 'Доступ запрещен'} });
	};
	var sql = this.getSqlRead(req);
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {return error.json(err, req, res ); };
			res.status(200).json({
				page: sql.page,
				pages: result.rows.length ? Math.ceil(result.rows[0].ct/sql.rows) : 0,
				total: result.rows.length ? Math.ceil(result.rows[0].ct/sql.rows) : 0,
				records: result.rows.length ? result.rows[0].ct : 0,
				rows: result.rows
			});
		})
	});
};

Base.prototype.createJson = function(req, res ) {
	if (this.opts.perks && this.opts.perks.createJson && (!req.session.perks || req.session.perks.indexOf(this.opts.perks.createJson) == -1 )) {
		return res.status(200).json({error: {text: 'Доступ запрещен'} });
	};
	var sql = this.getSqlCreate(req);
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {return error.json(err, req, res ); };
			res.status(200).json([true, 'Успешно добавлено', result.rows[0].id ]);
		})
	});
};

Base.prototype.updateJson = function(req, res ) {
	if (this.opts.perks && this.opts.perks.updateJson && (!req.session.perks || req.session.perks.indexOf(this.opts.perks.updateJson) == -1 )) {
		return res.status(200).json({error: {text: 'Доступ запрещен'} });
	};
	var sql = this.getSqlUpdate(req);
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {return error.json(err, req, res ); };
			res.status(200).json([true, 'Успешно отредактировано', result.rows.length && result.rows[0].id ]);
		})
	});
};

Base.prototype.delJson = function(req, res) {
	if (this.opts.perks && this.opts.perks.delJson && (!req.session.perks || req.session.perks.indexOf(this.opts.perks.delJson) == -1 )) {
		return res.status(200).json({error: {text: 'Доступ запрещен'} });
	};
	var sql = {
			text: 
				' Delete From ' + (this.opts.sql.scheme ? this.opts.sql.scheme + '.' : '') + this.opts.sql.table + 
				' Where id = $1 Returning id ',
			values: [req.params.id]
		};	
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {return error.json(err, req, res ); };
			res.status(200).json([true, 'Успешно удалено', result.rows[0].id ]);
		})
	});
};

Base.prototype.getSqlRead = function(req) {
	var id = req.params.id,
		data = req.body,
		where = this.getWhere(data, id ),
		rows = (+data.rows > 0) ? +data.rows : config.maxRows,
		page = (+data.page > 0) ? +data.page : 1,
		sql = {
			text: '',
			values: where.values.concat(rows, rows * (page - 1) ),
			page: page,
			rows: rows
		},
		sqlArray = (
			' With a As ( Select Count(1) Over() As ct, id ' +
			' From ' + (this.opts.sql.scheme ? this.opts.sql.scheme + '.' : '') + this.opts.sql.table + ' ' +
			(where.text ? (' Where ' + where.text) : ' ') +
			this.getOrder(data, 'order' ) +
			' Limit {$num} Offset {$num} ) ' +
			' Select ' + this.getSelect(data ) +
			' From ' + (this.opts.sql.scheme ? this.opts.sql.scheme + '.' : '') + this.opts.sql.table + ' ' + 
			' Where id In( Select id from a) ' + 
			this.getOrder(data, 'order' )
		).split('{$num}');
	for (var i = 0; i < sqlArray.length - 1 ; i++ ) {
		sql.text += sqlArray[i] + '$' + (i + 1); 
	};
	sql.text += sqlArray[i];
	return sql;
};

Base.prototype.getSelect = function(data) {
	var select = {alias: [], values: [] },
		oper = 'read',
		result = [];
	select.alias.push('"ct"');
	select.values.push(' ( Select ct From a Limit 1 ) ');
	for (var alias in this.opts.sql.columns) {
		if (!data.fields[alias]) {continue; };
		if (this.opts.sql.columns[alias][oper]) {
			select.alias.push('"' + alias + '"');
			select.values.push(this.opts.sql.columns[alias][oper]);
		};
	};
	for (var i = 0; i < select.alias.length; i++) {
		result.push(select.values[i] + ' As ' + select.alias[i]);
	};
	return result.join(',');
};

Base.prototype.getWhere = function(data, id ) {
	var where = {alias: [], values: [] },
		oper = 'search',
		result = {};
	for (var alias in data) {
		if (this.opts.sql.columns[alias] && this.opts.sql.columns[alias][oper]) {
			where.alias.push(this.opts.sql.columns[alias][oper]);
			where.values.push(data[alias]);
		}; 
	};
	if (id) {
		where.alias.push('id = {$num}');
		where.values.push(id);
	};
	return {
		text: where.alias.join(' And '),
		values: where.values
	};
};

Base.prototype.getOrder = function(data, oper ) {
	var arr = [];
	if (!data.order) {return ''; };
	for (var i = 0; i < data.order.length; i++ ) {
		if (this.opts.sql.columns[data.order[i].name] && this.opts.sql.columns[data.order[i].name][oper]) {
			arr.push(this.opts.sql.columns[data.order[i].name][oper] + (data.order[i].sort == 'asc' ? ' asc ' : ' desc '));
		};
	};
	return arr.length ? ' Order By ' + arr.join(',') : '' ;
	//return this.opts.sql.columns[data.sidx] ? ' Order By ' + this.opts.sql.columns[data.sidx].order + (data.sord == 'asc' ? ' asc ': ' desc ') : ''
};

Base.prototype.getCreate = function(data) {
	var result = {fields: [], create: [], values: [] },
		create = []
		oper = 'create';
	for (var alias in data) {
		if (this.opts.sql.columns[alias] && this.opts.sql.columns[alias][oper]) {
			result.fields.push(this.opts.sql.columns[alias].field);
			create.push(this.opts.sql.columns[alias][oper]);
			result.values.push(data[alias]);
		}; 
	};
	for (var i = 0; i < create.length ; i++ ) {
		result.create.push(create[i].replace('{$num}', '$' + (i + 1))); 
	};
	result.fields = result.fields.join(',');
	result.create = result.create.join(',');
	return result;
};

Base.prototype.getSqlCreate = function(req) {
	var data = req.body,
		create = this.getCreate(data),
		sql = {
			text:
				' Insert Into ' + (this.opts.sql.scheme ? this.opts.sql.scheme + '.' : '') + this.opts.sql.table +
				' ( ' + create.fields + ' ) ' +
				' Values (' + create.create + ' ) ' +
				' Returning id ',
			values: create.values
		};
	return sql;
};

Base.prototype.getUpdate = function(data, id) {
	var result = {update: [], values: [] },
		update = []
		oper = 'update';
	for (var alias in data) {
		if (this.opts.sql.columns[alias] && this.opts.sql.columns[alias][oper]) {
			result.update.push(this.opts.sql.columns[alias].field + ' = ' + this.opts.sql.columns[alias][oper]);
			result.values.push(data[alias]);
		}; 
	};
	result.update = result.update.join(',');
	return result;
};

Base.prototype.getSqlUpdate = function(req) {
	var id = req.params.id,
		data = req.body,
		update = this.getUpdate(data, id ),
		sql = {
			text: '',
			values: update.values
		},
		sqlArray = (
			' Update ' + (this.opts.sql.scheme ? this.opts.sql.scheme + '.' : '') + this.opts.sql.table +
			' Set ' + update.update +
			' Where id = {$num} '
			).split('{$num}');
	for (var i = 0; i < sqlArray.length - 1 ; i++ ) {
		sql.text += sqlArray[i] + '$' + (i + 1); 
	};
	sql.text += ' Returning id ';
	sql.values.push(id);
	return sql;
};

Base.prototype.rollback = function(err, client, done, res) {
	console.error(err);	
	err.text = 'Ошибка';
	res.status(200).json({error:err});
	client.query('RollBack', function(err) {
		done(err);		
	});
};