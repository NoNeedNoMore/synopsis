var config = require('../../config'),
	pg = require('pg'),
	utils = require('../../utils'),
	opts = {},
	games;

opts.render = './views/games';
opts.viewOpts = {view: 'various', title: 'Игры'};
opts.sql = {
	scheme: 'baduk',
	table: 'games',
	columns: {
		id: {
			field: 'id',
			read:
				' \'<nobr><a href = "games.html/\' || id || \'"><button class = "btn btn-default btn-sm table-row-id">\' || id || \' <span class = "glyphicon glyphicon-eye-open"></span></button></a> ' + 
				' <a href = "games.sgf/\' || id || \'"><button class = "btn btn-default btn-sm table-row-id"><span class = "glyphicon glyphicon-cloud-download"></span></button></a></nobr>\' ',
			search: ' id::text Like {$num} ',
			order: 'id::int'
		},
		dateCreate: {
			field: ' dateCreate ',
			read: ' to_char(dateCreate ,\'' + config.dateFormat + '\') ',
			create: ' to_date({$num}, \'' + config.dateFormat + '\') ',
			update: ' to_date({$num}, \'' + config.dateFormat + '\') ',			
			search: ' to_char(dateCreate ,\'' + config.dateFormat + '\') Like \'%\' || {$num} || \'%\' ',
			order: ' dateCreate '
		},
		whitePlayer: {
			read: ' Coalesce(pw, \'\') ',
			search: ' Lower(pw) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' pw '
		},
		whiteRank: {
			read: ' Coalesce(wr, \'\') ',
			search: ' Lower(wr) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' wr '
		},
		whiteTeam: {
			read: ' Coalesce(wt, \'\') ',
			search: ' Lower(wt) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' wt '
		},
		blackPlayer: {
			read: ' Coalesce(pb, \'\') ',
			search: ' Lower(pb) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' pb '
		},
		blackRank: {
			read: ' Coalesce(br, \'\') ',
			search: ' Lower(br) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' br '
		},
		blackTeam: {
			read: ' Coalesce(bt, \'\') ',
			search: ' Lower(bt) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' bt '
		},
		date: {
			read: ' Coalesce(dt, \'\') ',
			search: ' Lower(dt) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' dt '
		},
		handicap: {
			read: ' Coalesce(ha, \'\') ',
			search: ' Lower(ha) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ha '
		},
		komi: {
			read: ' Coalesce(km, \'\') ',
			search: ' Lower(km) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' km '
		},
		result: {
			read: ' Coalesce(re, \'\') ',
			search: ' Lower(re) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' re '
		},
		size: {
			read: ' Coalesce(sz, \'\') ',
			search: ' Lower(sz) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' sz '
		},
		rules: {
			read: ' Coalesce(ru, \'\') ',
			search: ' Lower(ru) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ru '
		},
		time: {
			read: ' Coalesce(tm, \'\') ',
			search: ' Lower(tm) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' tm '
		},
		overtime: {
			read: ' Coalesce(ot, \'\') ',
			search: ' Lower(ot) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ot '
		},
		event: {
			read: ' Coalesce(ev, \'\') ',
			search: ' Lower(ev) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ev '
		},
		place: {
			read: ' Coalesce(pc, \'\') ',
			search: ' Lower(pc) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' pc '
		},
		round: {
			read: ' Coalesce(ro, \'\') ',
			search: ' Lower(ro) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ro '
		},
		gameName: {
			read: ' Coalesce(gn, \'\') ',
			search: ' Lower(gn) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' gn '
		},
		gameComment: {
			read: ' Coalesce(gc, \'\') ',
			search: ' Lower(gc) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' gc '
		},
		copyright: {
			read: ' Coalesce(cp, \'\') ',
			search: ' Lower(cp) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' cp '
		},
		annotations: {
			read: ' Coalesce(an, \'\') ',
			search: ' Lower(an) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' an '
		},
		application: {
			read: ' Coalesce(ap, \'\') ',
			search: ' Lower(ap) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' ap '
		},
		author: {
			read: ' Coalesce(us, \'\') ',
			search: ' Lower(us) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' us '
		},
		json: {
			read: ' json::text '
		},
		filename: {
			read: ' filename ',
			search: ' Lower(filename) Like \'%\' || Lower({$num}) || \'%\' ',
			order: ' filename '
		},
		info: {
			read: 
				' \'Annotations: \' || Coalesce( an, \' \') || \'<br>\' || ' +
				' \'Application: \' || Coalesce( ap, \' \') || \'<br>\' || ' +
				' \'White name: \' || Coalesce( pw, \' \') || ' +
				' \' rank: \' || Coalesce( wr, \' \') || ' +
				' \' team: \' || Coalesce( wt, \' \') || \'<br>\' || ' +
				' \'Black name: \' || Coalesce( pb, \' \') || ' +
				' \' rank: \' || Coalesce( br, \' \') || ' +
				' \' team: \' || Coalesce( bt, \' \') || \'<br>\' || ' +
				' \'Game comment: \' || Coalesce( gc, \' \') || \'<br>\' || ' +
				' \'Copyright: \' || Coalesce( cp, \' \') || \'<br>\' || ' +
				' \'Date: \' || Coalesce( dt, \' \') || \'<br>\' || ' +
				' \'Event: \' || Coalesce( ev, \' \') || \'<br>\' || ' +
				' \'Game name: \' || Coalesce( gn, \' \') || \'<br>\' || ' +
				' \'Handicap: \' || Coalesce( ha, \' \') || \'<br>\' || ' +
				' \'Komi: \' || Coalesce( km, \' \') || \'<br>\' || ' +
				' \'Overtime: \' || Coalesce( ot, \' \') || \'<br>\' || ' +
				' \'Place: \' || Coalesce( pc, \' \') || \'<br>\' || ' +
				' \'Result: \' || Coalesce( re, \' \') || \'<br>\' || ' +
				' \'Round: \' || Coalesce( ro, \' \') || \'<br>\' || ' +
				' \'Rules: \' || Coalesce( ru, \' \') || \'<br>\' || ' +
				' \'Size: \' || Coalesce( sz, \' \') || \'<br>\' || ' +
				' \'Time: \' || Coalesce( tm, \' \') || \'<br>\' || ' +
				' \'User: \' || Coalesce( us, \' \') || \'<br>\' ',
			search: 
				' Lower(' +
					'Coalesce( an , \'\') || ' +
					'Coalesce( ap , \'\') || ' +
					'Coalesce( pw , \'\') || ' +
					'Coalesce( wr , \'\') || ' +
					'Coalesce( wt , \'\') || ' +
					'Coalesce( pb , \'\') || ' +
					'Coalesce( br , \'\') || ' +
					'Coalesce( bt , \'\') || ' +
					'Coalesce( gc , \'\') || ' +
					'Coalesce( cp , \'\') || ' +
					'Coalesce( dt , \'\') || ' +
					'Coalesce( ev , \'\') || ' +
					'Coalesce( gn , \'\') || ' +
					'Coalesce( ha , \'\') || ' +
					'Coalesce( km , \'\') || ' +
					'Coalesce( ot , \'\') || ' +
					'Coalesce( pc , \'\') || ' +
					'Coalesce( re , \'\') || ' +
					'Coalesce( ro , \'\') || ' +
					'Coalesce( ru , \'\') || ' +
					'Coalesce( sz , \'\') || ' +
					'Coalesce( tm , \'\') || ' +
					'Coalesce( us , \'\') ' +
				') ' + 
				' Like \'%\' || Lower({$num}) || \'%\' ',
		},
		tags: {
			search: ' id In( Select game From baduk.tagsToGames Where tag::text In(Select * From unnest(string_to_array({$num}, \',\'))) ) '
		}
	}
};

opts.table = {
	version: 1,
	url: 'games.json/read',
	method: 'post',
	page: 1,
	rows: 10,
	rowList: [{id:10, text: '10'},{id:20, text: '20'},{id:30, text: '30'},{id:40, text: '40'},{id:50, text: '50'},{id:1000, text: '1000'}],
	order: [{name: 'id', sort: 'asc'}],
	columns: [
		{ name: 'id', title: '#' },		
		{ name: 'whitePlayer', title: 'Белый игрок' },
		{ name: 'whiteRank', title: 'Разряд белого' },
		{ name: 'whiteTeam', title: 'Команда белого', hidden: true },
		{ name: 'blackPlayer', title: 'Черный игрок' },
		{ name: 'blackRank', title: 'Разряд черного' },
		{ name: 'blackTeam', title: 'Команда черного', hidden: true },
		{ name: 'handicap', title: 'Фора' },
		{ name: 'komi', title: 'Коми' },
		{ name: 'result', title: 'Результат' },
		{ name: 'size', title: 'Размер' },
		{ name: 'rules', title: 'Правила', hidden: true },
		{ name: 'time', title: 'Время', hidden: true },
		{ name: 'overtime', title: 'Дополнительное время', hidden: true },
		{ name: 'date', title: 'Дата', hidden: true },
		{ name: 'event', title: 'Событие', hidden: true },
		{ name: 'place', title: 'Место проведения', hidden: true },
		{ name: 'round', title: 'Раунд', hidden: true },
		{ name: 'gameName', title: 'Игра', hidden: true },		
		{ name: 'gameComment', title: 'Комментарий', hidden: true },
		{ name: 'copyright', title: 'Копирайт', hidden: true },
		{ name: 'annotations', title: 'Аннотация', hidden: true },
		{ name: 'application', title: 'Приложение', hidden: true },
		{ name: 'author', title: 'Автор', hidden: true },
		{ name: 'filename', title: 'Имя файла', hidden: true },
		{ name: 'info', title: 'Информация', hidden: true },
		{ name: 'json', title: 'json', hidden: true, hide: true }
	]
};

opts.services = {
	getTable: function(req, res) {
		res.status(200).json(opts.table);
	}
};

games = new (require('../base'))(opts);

games.createSgf = function(req, res) {
	var sgfText = req.files['files[]'].buffer.toString('utf-8'),
		sgf = utils.sgfToJson(sgfText),
		info = sgf.json[0].m[0],
		sql = {
			text: 
				' Insert Into baduk.games ' +
				' (filename, sgf, json, ' + 
					' an, ap, pw, wr, wt, pb, br, bt, gc, cp, dt, ev, gn, ha, km, ot, pc, re, ro, ru, sz, tm, us) ' + 
				' Values ' + 
				' ($1, $2, $3, ' +
					' $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) ' +
				' Returning id ',
			values: [
				req.files['files[]'].originalname, sgfText, sgf.text, 
					info.AN, info.AP, info.PW, info.WR, info.WT, info.PB,
					info.BR, info.BT, info.GC, info.CP, info.DT, info.EV,
					info.GN, info.HA, info.KM, info.OT, info.PC, info.RE,
					info.RO, info.RU, info.SZ, info.TM, info.US
			]
		};
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {res.end(); return console.error('sql error', err);};
			res.set({'Content-type': 'text/html' }); // for IE
			res.status(200).json({
				id: result.rows[0].id
			});
		})
	});
};

games.readSgf = function(req, res) {
	var id = req.params.id,
		sql = {
			text: ' Select sgf, filename From baduk.games Where id = $1 ',
			values: [id]
		}
	pg.connect(config.conString, function(err, client, done) {
		if (err) {res.end(); return console.error('error fetching client from pool', err);};
		client.query(sql, function(err, result) {
			done();
			if (err) {res.end(); return console.error('sql error', err);};
			res.set({
				'Content-Disposition': 'attachment; filename="' + result.rows[0].filename + '"',
				'Content-type': 'application/x-go-sgf'
			});
			res.send(result.rows[0].sgf);
		})
	});
};

module.exports = games;