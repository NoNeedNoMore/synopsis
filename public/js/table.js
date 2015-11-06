var lib = lib || {};

lib.Table = function($wrapper) {
	var self = this;
	$.ajax({
		url: $wrapper.data('table') + '.json/services/getTable',
		type: 'post',
		dataType: 'json'
	}).done(function(data) {
		self.$wrapper = $wrapper;
		self.table = $.extend({}, data);
		self.buildTable();
		self.addEventListeners();
	});
	return this;
};
lib.Table.prototype.buildTable = function() {
	var str = '',
		self = this;
	str +=
		'<div class = "clearfix"><p class = "pull-left">' + 
		this.getPager() + 
		'</p><p class = "pull-right">' +
		this.getSettings() + '</p></div>' + 
		this.getTable() + 
		'<div class = "clearfix"><p class = "pull-left">' + 
		this.getPager() + 
		'</p><p class = "pull-right">' +
		this.getSettings() + '</p></div>' + 			
		'';
	this.$wrapper.append(this.$table = $(str) );
	this.loadTable();
	this.$wrapper.find('.table-rows')
		.select2({
			data: this.table.rowList,
			dropdownAutoWidth : true
		})
		.select2('val', this.table.rows);
	this.$wrapper.find('.table-page').select2({
		data: function() {
			return {results: (function(){
				var data = [];
				for (var i = 1; i <= self.table.pages; i++) {
					data.push({id: i, text: i + ''});
				};
				return data;
			})()};
		},
		dropdownAutoWidth : true
	});
	this.$wrapper.find('.games').select2({dropdownAutoWidth : true});
	this.$wrapper.find('.table-columns-add').select2({
		placeholder: 'Добавить колонку',
		dropdownAutoWidth : true,
		data: function() {
			return {results: (function(){
				var data = [];
				for (var i = 1; i < self.table.columns.length; i++) {
					if (self.table.columns[i].hidden && !self.table.columns[i].hide) {data.push({id: i, text: self.table.columns[i].title || ''}); };
				};
				return data;
			})()};
		}
	});
	this.$wrapper.find('.table-columns-del').select2({
		placeholder: 'Удалить колонку',
		dropdownAutoWidth : true,
		data: function() {
			return {results: (function(){
				var data = [];
				for (var i = 1; i < self.table.columns.length; i++) {
					if (!self.table.columns[i].hidden) {data.push({id: i, text: self.table.columns[i].title || ''}); };
				};
				return data;
			})()};
		}
	});
	this.$wrapper.find('.table-sgf-fileupload').fileupload({
		url: '/games.sgf/create',
		dataType: 'json',
		done: function (e, data) {
			if (data.result.id) {self.loadTable(); };
		}
	});
	return this;
};

lib.Table.prototype.rebuildTable = function() {
	this.$wrapper.find('.table').html(this.getTable());
	this.loadTable();
};

lib.Table.prototype.getTable = function() {
	var str = '';
	str += '<div style = "overflow: auto; "><table class="table table-bordered table-striped table-hover table-condensed"><thead><tr>';
	for (var i = 0; i < this.table.columns.length; i++) {
		if (this.table.columns[i].hidden) {continue; };
		str += 
			'<th><button class = "btn btn-default btn-block bold table-head" data-name = "' +
			this.table.columns[i].name +'">' + 
			this.table.columns[i].title + 
			'</button></th>';
	};
	str += '</tr><tr>';
	for (var i = 0; i < this.table.columns.length; i++) {
		if (this.table.columns[i].hidden) {continue; };
		str += 
			'<th><input class = "form-control table-filter" data-name = "' +
			this.table.columns[i].name +'">' + 
			'</input></th>';
	};
	str += '</tr></thead><tbody>';
	/*for (var row = 0; row < this.table.rows; row++) {
		str += '<tr>';
		for (var i = 0; i < this.table.columns.length; i++) {
			if (this.table.columns[i].hidden) {continue; };
			str += i == 0 ? '<td><button class = "btn btn-default btn-sm">&nbsp;</button></td>' : '<td></td>' ;
		};
		str += '</tr>';
	};*/
	str += '</tbody></table></div>';
	return str;
};

lib.Table.prototype.getButtons = function() {
	var str = '';
	str += 
		'<p>' +
			'<button class = "btn btn-default">' +
				'<span class = "glyphicon glyphicon-fire"></span>' +
				'<span>&nbsp;Играть</span></button> ' +
			'<button class = "btn btn-default">' +
				'<span class = "glyphicon glyphicon-plus"></span>' +
				'<span>&nbsp;Новая партия</span></button> ' +
			'<span class = "btn btn-default fileinput-button">' +
				'<span class = "glyphicon glyphicon-cloud-upload"></span>' +
				'<span>&nbsp;Загрузить партию на сервер</span>' + 
				'<input class = "table-sgf-fileupload" type = "file" name = "files[]" multiple/></span> ' +
		'</p>'
	return str;
};

lib.Table.prototype.getPager = function() {
	var str = 
		'<button class = "btn btn-default btn-sm btn-prev-page">' +
			'<span class = "glyphicon glyphicon-chevron-left"></span>' +
			'<span>&nbsp;Назад</span></button> ' +
		'<input type = "hidden" class = "table-page"></input>' +
		'<span>&nbsp;из&nbsp;</span> ' +
		'<span class = "table-pages"></span> ' +
		'<button class = "btn btn-default btn-sm btn-next-page">' +
			'<span>Вперед&nbsp;</span>' +
			'<span class = "glyphicon glyphicon-chevron-right"></span></button> ' +
		'<span>&nbsp;Строк:&nbsp;</span>' + 
		'<input type = "hidden" class = "table-rows"></input>' + 
		'<span>&nbsp;Всего записей:&nbsp;</span> ' +
		'<span class = "table-records"></span> ';
	return str;
};

lib.Table.prototype.getFilters = function() {
	var str = 
		'<p><span>&nbsp;Игры:&nbsp;</span>' + 
		'<select class = "games">' +
			'<option>Активные</option>' +
			'<option>Завершенные</option>' +
			'<option>Загруженные</option>' +
			'<option>Вызовы на партию</option>' +
			'<option>Все</option>' +
		'</select>' +
		'<label class = "normal">&nbsp;Мои&nbsp;' +
			'<input type="checkbox"></input></label>' + 
		'</p>';
	return str;
};

lib.Table.prototype.getSettings = function() {
	var str = 
		'<input type = "hidden" class = "table-columns-add"></input> ' +
		'<input type = "hidden" class = "table-columns-del"></input>';
	return str;
};

lib.Table.prototype.loadTable = function() {
	var self = this,
		data = {
			page: this.table.page,
			rows: this.table.rows,
			order: this.table.order,
			fields: (function(){
				var data = {id: true};
				for (var i = 1; i < self.table.columns.length; i++) {
					if (!self.table.columns[i].hidden) {
						data[self.table.columns[i].name] = true;
					};
				};
				return data;
			})()
			//tags: '2,3334,4,,5,5,,6,6'
		};
	self.$wrapper.find('.table .table-filter').each(function(e, el) {
		var $el = $(el);
		if ($el.val()) {data[$el.data('name')] = $el.val(); };
	});
	$.ajax({
		url: this.table.url,
		type: this.table.method,
		data: data,
		dataType: 'json'
	}).done(function(data) {
		var str = '';		
		if (data && data.error) {
			alert('Ошибка!');
			return console.log(data.error);
		};
		self.data = data;
		for (var row = 0; row < data.rows.length; row++) {
			str += '<tr>';
			for (var i = 0; i < self.table.columns.length; i++) {
				if (self.table.columns[i].hidden) {continue; };
				str += '<td>' + (i == 0 ? (self.table.page-1)*self.table.rows + row + 1 + '.&nbsp;' : '') + (data.rows[row][self.table.columns[i].name] || '') + '</td>';
			};
			str += '</tr>';
		};
		self.table.records = data.records;
		self.table.pages = data.pages;
		self.$wrapper
			.find('span.table-pages').html(self.table.pages).end()
			.find('span.table-records').html(self.table.records + '.').end()
			.find('input.table-page').select2('val', data.page).end()
			.find('tbody').html(str);
	});
	return this;
};

lib.Table.prototype.addEventListeners = function() {
	var self = this;
	self.$wrapper
		.find('.btn-prev-page').on('click', function(e) {
			if (self.table.page > 1) {
				self.table.page--;
				self.loadTable();
			};
		}).end()
		.find('.btn-next-page').on('click', function(e) {
			if (self.table.page < self.table.pages) {
				self.table.page++;
				self.loadTable();
			};
		}).end()
		.find('.table-rows').on('change', function(e) {
			var rows = $(e.target).select2('val');
			self.$wrapper.find('.table-rows').select2('val', rows);
			self.$wrapper.find('.table-page').select2('val', 1);
			self.table.page = 1;
			self.table.rows = rows;
			self.loadTable();
		}).end()
		.find('.table-page').on('change', function(e) {
			var page = $(e.target).select2('val');
			self.table.page = page;
			self.loadTable();
		}).end()
		.find('.table-columns-del').on('select2-selecting', function(e) {
			$(e.target).select2('close')
			self.table.columns[e.val].hidden = true;
			self.rebuildTable();
			return false;
		}).end()
		.find('.table-columns-add').on('select2-selecting', function(e) {
			$(e.target).select2('close')
			self.table.columns[e.val].hidden = false;
			self.rebuildTable();
			return false;
		}).end()
		.find('.table').on('click', function(e) {
			var $el = $(e.target),
				name = $el.data('name'),
				index = -1;
			if (!$el.hasClass('table-head')) {return; };
			if (!$el.data('order')) {
				$el
					.append('&nbsp;<span class = "glyphicon glyphicon-sort-by-attributes-alt"><span>')
					.data('order', 'desc');
			};
			if ($el.data('order') == 'desc') {				
				$el.data('order', 'asc').find('span.glyphicon')
					.removeClass('glyphicon-sort-by-attributes-alt')
					.addClass('glyphicon-sort-by-attributes');
				for (var i = 0; i < self.table.order.length; i++ ) {
					if (self.table.order[i].name == name) {index = i; break; };
				};
				if (index != -1) {self.table.order.splice(index,1); };
				self.table.order = [{name: $el.data('name'), sort: 'asc'}].concat(self.table.order);
				self.loadTable();
			} else {
				$el.data('order', 'desc').find('span.glyphicon')
					.removeClass('glyphicon-sort-by-attributes')
					.addClass('glyphicon-sort-by-attributes-alt');
				for (var i = 0; i < self.table.order.length; i++ ) {
					if (self.table.order[i].name == name) {index = i; break; };
				};
				if (index != -1) {self.table.order.splice(index,1); };
				self.table.order = [{name: $el.data('name'), sort: 'desc'}].concat(self.table.order);
				self.loadTable();
			};
		}).end()
		.find('.table').on('keypress', function(e) {
			var $el = $(e.target);
			if (e.keyCode == 13 && $el.hasClass('table-filter')) {
				if ($el.val() != $el.data('val')) {
					$el.data('val', $el.val() );
					self.table.page = 1;
				};
				self.loadTable();
			};
		}).end()
		//.find('.table').on('click', function(e) {
			//var $el = $(e.target);
			//if (!$el.hasClass('table-row-id')) {return; };
			//document.location.href = 'games.sgf/' + $el.text();
			//self.$wrapper.hide().parent().append('<div class = "goban" data-id = "' + $el.text() + '">Goban</div>');
		//})
};