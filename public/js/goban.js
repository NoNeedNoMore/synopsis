var lib = lib || {};

// ****************************************************************************
lib.Goban = function ($el) {
	var self = this;
	self.$wrapper = $el;
	self.$wrapper.html('Загрузка...');
	$.ajax({
		url: '/games.json/read/' + $el.data('id'),
		type: 'post',
		dataType: 'json',
		data: {fields: {json: true}}
	}).done(function(data) {
		//self.socket = opts.socket || '';
		self.sgf = JSON.parse(data.rows[0].json);
		self.root = self.sgf[0];
		self.move = self.sgf[0];
		self.moveNum = 0;
		self.nodeMoveNum = 0;
		self.nextMoveColor = 'B';
		self.path = [];
		self.rollback = [];
		self.$wrapper.html('');
		self
			.buildPlayer()
			//.buildVariantsTree()
			.doMove()
			.addEventListeners();
		self.$result.html((self.root.m[0].GN || '') + (self.root.m[0].RE || '&nbsp'));
		self.$whitePlayer.html('&nbsp;&nbsp;White: ' + (self.root.m[0].PW || '') + '[' + (self.root.m[0].WR || '?') + ']' );
		self.$blackPlayer.html('&nbsp;&nbsp;Black: ' + (self.root.m[0].PB || '') + '[' + (self.root.m[0].BR || '?') + ']' );
		
	});
	return self;
};
lib.Goban.prototype.buildPlayer = function() {
	this.$player = $('<table class = "player"></table>');
	this.$player.append(
		$('<tr></tr>').append(
			$('<td colspan = "2"></td>').append(
				this.$result = $('<div class = "result"></div>')
			)
		),
		$('<tr></tr>').append(
			$('<td></td>').append(
				this.$whitePlayer = $('<div class = "white-player"></div>')
			),
			$('<td rowspan = "2"></td>').append(
				this.$players = $('<div class = "players"></div>')
			)
		),
		$('<tr></tr>').append(
			$('<td></td>').append(
				this.$blackPlayer = $('<div class = "black-player"></div>')
			)
		),
		$('<tr></tr>').append(
			$('<td></td>').append(
				this.$goban = this.buildGoban()
			),
			$('<td rowspan = "2"></td>').append(
				this.$comments = $('<pre class = "comments"></pre>')
			)
		),
		$('<tr></tr>').append(
			$('<td></td>').append(
				this.$progressbar = $('<div class = "progressbar"></div>')
			)
		),
		$('<tr></tr>').append(
			$('<td></td>').append(
				this.$buttons = this.buildButtons()
			),
			$('<td></td>').append(
				this.$chatInput = $('<input type="text" class="form-control chat-input"></input>')
			)
		),
		$('<tr></tr>').append(
			this.$variantsTreeTd = $('<td colspan = "2"></td>')				
		)
	);
	this.$wrapper.append(this.$player);
	return this;
};
lib.Goban.prototype.buildButtons = function() {
	this.$buttons = $('<div></div>');
	this.$buttons.append(
		this.$begin = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-fast-backward"></span></button>').addClass('disabled'),
		this.$fastBackward = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-backward"></span></button>').addClass('disabled'),			
		this.$stepBackward = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-step-backward"></span></button>').addClass('disabled'),
		this.$play = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-play"></span></button>'),
		this.$pause = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-pause"></span></button>').hide(),
		this.$stepForward = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-step-forward"></span></button>'),
		this.$fastForward = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-forward"></span></button>'),
		this.$end = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-fast-forward"></span></button>'),
		this.$selectVariant = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-transfer"></span><span class = "goban-node-name">&nbsp;A</span></button>').addClass('disabled'),
		this.$remove = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-remove"></span></button>').addClass('disabled')
	);
	return this.$buttons;		
};
lib.Goban.prototype.buildGoban = function() {
	var size = this.root.m[0].SZ || 19,
		sizeX = sizeY = size,
		hoshi = {
			'19': '[coord=dd],[coord=pd],[coord=pp],[coord=dp],[coord=jj],[coord=dj],[coord=pj],[coord=jd],[coord=jp]',
			'13': '[coord=dd],[coord=gd],[coord=jd],[coord=dg],[coord=gg],[coord=jg],[coord=dj],[coord=gj],[coord=jj]',
			'9': '[coord=cc],[coord=gc],[coord=cg],[coord=gg],[coord=ee]',
		},
		table = '<table class = "goban">';
	for (var y = 0; y < sizeY; y ++ ) {
		table += '<tr>';
		for (var x = 0; x < sizeX; x++) {
			table += '<td class = "goban-cell cell-coord-' + x + '-' + y + '" data-x = "' + x + '" data-y = "' + y + '" coord = ' + String.fromCharCode(x + 97) + String.fromCharCode(y + 97) + '></td>';
		};
		table += '</tr>';
	};
	table += '</table>';
	table = $(table);
	table.find('td[data-x!=0][data-y!=0][data-x!=' + (sizeX-1) + '][data-y!=' + (sizeY-1) + ']').addClass('goban-cell-center');
	table.find('td[data-x=0][data-y!=0][data-y!=' + (sizeY-1) + ']').addClass('goban-cell-left');
	table.find('td[data-x=' + (sizeX-1) + '][data-y!=0][data-y!=' + (sizeY-1) + ']').addClass('goban-cell-right');
	table.find('td[data-y=0][data-x!=0][data-x!=' + (sizeX-1) + ']').addClass('goban-cell-top');
	table.find('td[data-y=' + (sizeY-1) + '][data-x!=0][data-x!=' + (sizeX-1) + ']').addClass('goban-cell-bottom');
	table.find('td[coord=aa]').addClass('goban-cell-top-left');
	table.find('td[data-x=0][data-y=' + (sizeY-1) + ']').addClass('goban-cell-bottom-left');
	table.find('td[data-x=' + (sizeX-1) + '][data-y=0]').addClass('goban-cell-top-right');
	table.find('td[data-x=' + (sizeX-1) + '][data-y=' + (sizeY-1) + ']').addClass('goban-cell-bottom-right');
	table.find(hoshi[size] || '').removeClass('goban-cell-center').addClass('goban-cell-hoshi');
	return table;		
};
lib.Goban.prototype.drawVariantsTree = function() {
	var str = '<div class = "variants-tree" data-nodes = "0">',
		data;
	for (var row = 0; row < this.variantsTree.length; row++) {
		str += '<div class = "node">';
		for (var cell = 0; cell < this.variantsTree[row].length; cell++) {
			data = this.variantsTree[row][cell];
			if (data== 'empty' || data== 'goban-cell-bottom-left' || data== 'goban-cell-left' || data== 'goban-cell-vertical') {
				str += '<div class = "variants-tree-stones ' + data + '"></div>';
			} else {
				str += '<div data-moveNum = "' + cell + '" class = "variants-tree-stones ' + data + '">' + cell + '</div>';
			};
		};
		str += '</div>';
	};
	str += '</div>';
	this.$variantsTree = $(str);
	this.$variantsTreeTd.append(this.$variantsTree);
	return this;
};
lib.Goban.prototype.buildVariantsTree = function() {
	var moveNum = 0,
		move = this.root,
		node = [];
	this.variantsTree = [];
	for (var i = 0; i < move.m.length; i++) {
		node.push('stone-' + (move.m[i].B ? 'black' : move.m[i].W ? 'white' : '' ) );
	};
	moveNum = i;
	this.variantsTree.push(node);
	if (!move.n) {return this.drawVariantsTree(); };
	for (var i = 0; i < move.n.length; i++) {
		this.addTreeNode(move.n[i], i, moveNum);
	};
	return this.drawVariantsTree();
};
lib.Goban.prototype.addTreeNode = function(move, nodeNum, moveNum) {
	var node = [],
		upperNode,
		cell;
	if (nodeNum) {			
		for (var i = 0; i < moveNum; i++) {
			node.push('empty');
		};
		cell = node.length - 1;
		node[cell] = 'goban-cell-bottom-left';
		this.variantsTree.push(node);
		upperNode = this.variantsTree.length - 2;
		while (this.variantsTree[upperNode][cell] == 'empty' || this.variantsTree[upperNode][cell] == 'goban-cell-bottom-left') {
			this.variantsTree[upperNode][cell] = this.variantsTree[upperNode][cell] == 'empty' ? 'goban-cell-vertical' : 'goban-cell-left';
			upperNode--;
		};
	};		
	for (var i = 0; i < move.m.length; i++) {
		this.variantsTree[this.variantsTree.length - 1].push('stone-' + (move.m[i].B ? 'black' : move.m[i].W ? 'white' : '' ) );			
	};
	moveNum += i;
	if (!move.n) {return this; };
	for (var i = 0; i < move.n.length; i++) {
		this.addTreeNode(move.n[i], i, moveNum);
	};
	return this;
};
lib.Goban.prototype.doMove = function() {
	var move = this.move.m[this.nodeMoveNum];
	for (var i in move) {
		this[i] ? this[i](move[i]) : null;
	};
	this.$comments.html(this.move.m[this.nodeMoveNum].C || '');
	this.checkAndShowVariants();
	return this;
};
lib.Goban.prototype.checkAndShowVariants = function() {
	var self = this;
	if (!!this.move.n && (this.nodeMoveNum == (this.move.m.length - 1))) {
		var max = this.move.n.length,
			coord = '';
		this.$goban.find('.goban-cell-variant').remove();
		this.$selectVariant.data('node', 0).data('max', max).removeClass('disabled').find('.goban-node-name').html('&nbsp;A');
		for (var i = 0; i < max; i++) {
			coord = this.move.n[i].m[0].B || this.move.n[i].m[0].W;
			this.$goban.find('[coord=' + coord + ']').append('<div class = "goban-cell-variant" data-node = "' + i + '">' + String.fromCharCode(i + 65) + '</div>');
		};
		this.$goban.find('[data-node=0]').addClass('goban-cell-variant-active');
	} else {
		this.$selectVariant.addClass('disabled');
		this.$goban.find('.goban-cell-variant').remove();
		if (this.nodeMoveNum == (this.move.m.length - 1)) {return; };
		this.$goban.find('[coord=' + (this.move.m[this.nodeMoveNum + 1].B || this.move.m[this.nodeMoveNum + 1].W ) + ']').append('<div class = "goban-cell-variant goban-cell-variant-nextmove" ></div>');
	};
	this.$goban.find('.goban-cell-variant').on('click', function(e) {
		if ($(this).hasClass('goban-cell-variant-nextmove')) {
			self.$stepForward.click();
		} else {
			self.$selectVariant.data('node', $(this).data('node'));
			self.$stepForward.click();
		};
	});
};
lib.Goban.prototype.addEventListeners = function() {
	var self = this;
	this.$stepForward.on('click', function(e) {
		if (!self.nextMove()) {
			self.$stepForward.addClass('disabled');
			self.$fastForward.addClass('disabled');
			self.$end.addClass('disabled');
			self.$pause.hide();
			self.$play.show().addClass('disabled');
		};
		self.$stepBackward.removeClass('disabled');
		self.$fastBackward.removeClass('disabled');
		self.$begin.removeClass('disabled');
	});
	this.$stepBackward.on('click', function(e) {
		if (!self.prevMove()) {
			self.$stepBackward.addClass('disabled');
			self.$fastBackward.addClass('disabled');
			self.$begin.addClass('disabled');
		};
		self.$stepForward.removeClass('disabled');
		self.$fastForward.removeClass('disabled');
		self.$end.removeClass('disabled');
		self.$play.removeClass('disabled');
	});
	this.$fastForward.on('click', function(e) {
		for (var i = 0; i < 10; i++ ) {
			self.$stepForward.click();
		};
	});
	this.$fastBackward.on('click', function(e) {
		for (var i = 0; i < 10; i++ ) {
			self.$stepBackward.click();
		};
	});
	this.$begin.on('click', function(e) {
		while (self.prevMove());
		self.$stepBackward.addClass('disabled');
		self.$fastBackward.addClass('disabled');
		self.$begin.addClass('disabled');
		
		self.$stepForward.removeClass('disabled');
		self.$fastForward.removeClass('disabled');
		self.$end.removeClass('disabled');
		self.$play.removeClass('disabled');
	});
	this.$end.on('click', function(e) {
		while (self.nextMove());
		self.$stepForward.addClass('disabled');
		self.$fastForward.addClass('disabled');
		self.$end.addClass('disabled');
		self.$pause.hide();
		self.$play.show().addClass('disabled');
		
		self.$stepBackward.removeClass('disabled');
		self.$fastBackward.removeClass('disabled');
		self.$begin.removeClass('disabled');
	});
	this.$play.on('click', function(e) {
		self.$play.hide();
		self.$pause.show();
		(function play(time) {				
			if (self.$play.is(':visible')) {
				return;
			};
			self.$stepForward.click();				
			setTimeout(function(){play(time); }, time );
		})(1000)
	});
	this.$pause.on('click', function(e) {
		self.$pause.hide();
		self.$play.show();
	});
	this.$selectVariant.on('click', function(e) {
		var node = self.$selectVariant.data('node') + 1,
			max = self.$selectVariant.data('max');
		node = (node == max) ? 0 : node;
		self.$selectVariant.data('node', node).find('.goban-node-name').html('&nbsp;' + String.fromCharCode(node + 65));
		self.$goban.find('.goban-cell-variant-active').removeClass('goban-cell-variant-active');			
		self.$goban.find('[data-node=' + node + ']').addClass('goban-cell-variant-active');
	});
	this.$goban.find('td.goban-cell').on('click', function(e) {
		var obj = {},
			node = 0;
		if ($(this).html() != '') {return; };
		obj[self.nextMoveColor] = $(this).attr('coord');
		if (self.nodeMoveNum == (self.move.m.length - 1) && !self.move.n) {				
			self.move.m.push(obj);
			self.nextMove();
			return;
		};
		if (self.nodeMoveNum == (self.move.m.length - 1) && !!self.move.n) {
			node = self.move.n.length;
			self.move.n[node] = {m: [obj] };				
			self.$selectVariant.data('node', node).find('.goban-node-name').html('&nbsp;' + String.fromCharCode(node + 65));
			self.nextMove();
			return;
		};
		self.move.n = [{m: self.move.m.slice(self.nodeMoveNum + 1), n: self.move.n},{m: [obj]}];
		self.move.m = self.move.m.slice(0, self.nodeMoveNum + 1);
		node = 1;
		self.$selectVariant.data('node', node).find('.goban-node-name').html('&nbsp;' + String.fromCharCode(node + 65));
		self.nextMove();
	});
	this.$remove.on('click', function(e) {
		return;			
	});
	/*this.socket.on('message', function(msg){
		self.$comments.append('<br>' + msg.text);
	});*/
};
lib.Goban.prototype.nextMove = function() {
	if (this.nodeMoveNum < (this.move.m.length - 1) ) {	
		this.nodeMoveNum++;
		this.doMove();
		return !(!this.move.n && (this.nodeMoveNum == (this.move.m.length - 1)));
	};
	if (!this.move.n) {return false;};
	this.move = this.move.n[this.$selectVariant.data('node')];
	this.path.push(this.$selectVariant.data('node'));
	this.nodeMoveNum = 0;		
	this.doMove();
	return !(!this.move.n && (this.nodeMoveNum == (this.move.m.length - 1)));;
};
lib.Goban.prototype.prevMove = function() {
	var rollback = this.rollback.pop();
	if (this.nodeMoveNum == 0) {
		if (this.path.length == 0) {return false; };
		this.path.pop();
		this.move = this.root;
		for (var i = 0; i < this.path.length; i++) {
			this.move = this.move.n[this.path[i]];
		};
		this.nodeMoveNum = this.move.m.length - 1;
	} else {
		this.nodeMoveNum--;
	};	
	for (var i in rollback) {
		this[i](rollback[i]);
	};
	this.checkAndShowVariants();
	return !(!this.path.length && (this.nodeMoveNum == 0));
};
lib.Goban.prototype.isGroupAlive = function ($cell, color) {
	var x = +$cell.data('x'),
		y = +$cell.data('y'),
		$nextcell;
	if ($cell.attr('status') =='checked') {return false; };
	$cell.attr('status', 'checked' );
	$nextcell = this.$goban.find('.cell-coord-' + (x + 1) + '-' + (y + 0) );
	if ($nextcell.length && !$nextcell.has('.goban-stone').length) {
		return true;
	} else {
		if ($nextcell.length && $nextcell.has('.' + color).length ) {
			if (this.isGroupAlive($nextcell, color)) {return true; };
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x - 1) + '-' + (y + 0) );
	if ($nextcell.length && !$nextcell.has('.goban-stone').length) {
		return true;
	} else {
		if ($nextcell.length && $nextcell.has('.' + color).length ) {
			if (this.isGroupAlive($nextcell, color)) {return true; };
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x + 0) + '-' + (y + 1) );
	if ($nextcell.length && !$nextcell.has('.goban-stone').length) {
		return true;
	} else {
		if ($nextcell.length && $nextcell.has('.' + color).length ) {
			if (this.isGroupAlive($nextcell, color)) {return true; };
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x + 0) + '-' + (y - 1) );
	if ($nextcell.length && !$nextcell.has('.goban-stone').length) {
		return true;
	} else {
		if ($nextcell.length && $nextcell.has('.' + color).length ) {
			if (this.isGroupAlive($nextcell, color)) {return true; };
		};
	};
	return false;
};
lib.Goban.prototype.isHeroAlive = function($cell, color ) {
	var x = +$cell.data('x'),
		y = +$cell.data('y'),
		isAlive = false,
		oppColor = (color == 'stone-black') ? 'stone-white' : 'stone-black',
		$nextcell;
	$nextcell = this.$goban.find('.cell-coord-' + (x + 1) + '-' + (y + 0) );
	if ($nextcell.length && $nextcell.has('.' + oppColor).length && !$nextcell.hasClass('group-alive') && !$nextcell.hasClass('group-dead')) {
		if (!this.isGroupAlive($nextcell, oppColor)) {
			this.$goban.find('td[status=checked]').attr('status', 'dead' );
			isAlive = true;
		} else {
			this.$goban.find('td[status=checked]').attr('status', 'alive' );
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x - 1) + '-' + (y + 0) );
	if ($nextcell.length && $nextcell.has('.' + oppColor).length && !$nextcell.hasClass('group-alive') && !$nextcell.hasClass('group-dead')) {
		if (!this.isGroupAlive($nextcell, oppColor)) {
			this.$goban.find('td[status=checked]').attr('status', 'dead' );
			isAlive = true;
		} else {
			this.$goban.find('td[status=checked]').attr('status', 'alive' );
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x + 0) + '-' + (y + 1) );
	if ($nextcell.length && $nextcell.has('.' + oppColor).length && !$nextcell.hasClass('group-alive') && !$nextcell.hasClass('group-dead')) {
		if (!this.isGroupAlive($nextcell, oppColor)) {
			this.$goban.find('td[status=checked]').attr('status', 'dead' );
			isAlive = true;
		} else {
			this.$goban.find('td[status=checked]').attr('status', 'alive' );
		};
	};
	$nextcell = this.$goban.find('.cell-coord-' + (x + 0) + '-' + (y - 1) );
	if ($nextcell.length && $nextcell.has('.' + oppColor).length && !$nextcell.hasClass('group-alive') && !$nextcell.hasClass('group-dead')) {
		if (!this.isGroupAlive($nextcell, oppColor)) {
			this.$goban.find('td[status=checked]').attr('status', 'dead' );
			isAlive = true;
		} else {
			this.$goban.find('td[status=checked]').attr('status', 'alive' );
		};
	};
	return isAlive || this.isGroupAlive($cell, color);
};
lib.Goban.prototype.blackMove = function(val) {
	var $cell = this.$goban.find('td[coord=' + val + ']'),
		coords = [];
	$cell.html('<div class = "goban-stone stone-black"></div>');
	if (!this.isHeroAlive($cell, 'stone-black' )) {
		this.$goban.find('td').attr('status', '');
		$cell.html('');
		return;
	};
	if (this.$goban.find('td[status=dead]').length) {
		this.$goban.find('td[status=dead]').html('').each(function(i, el){
			coords.push($(el).attr('coord'));
		});
	};
	this.$goban.find('td').attr('status', '');
	this.rollback.push({clearCell: val, addStones: {color: 'white', coords: coords}, setMoveColor: 'B' });
	this.nextMoveColor = 'W';
};
lib.Goban.prototype.whiteMove = function(val) {
	var $cell = this.$goban.find('td[coord=' + val + ']'),
		coords = [];
	$cell.html('<div class = "goban-stone stone-white"></div>');
	if (!this.isHeroAlive($cell, 'stone-white' )) {
		this.$goban.find('td').attr('status', '');
		$cell.html('');
		return;
	};		
	if (this.$goban.find('td[status=dead]').length) {
		this.$goban.find('td[status=dead]').html('').each(function(i, el){
			coords.push($(el).attr('coord'));
		});
	};
	this.$goban.find('td').attr('status', '');
	this.rollback.push({clearCell: val, addStones: {color: 'black', coords: coords}, setMoveColor: 'W' });
	this.nextMoveColor = 'B';
};
lib.Goban.prototype.setMoveColor = function(val) {
	this.nextMoveColor = val;
};
lib.Goban.prototype.addStones = function(val) {
	for (var i = 0; i < val.coords.length; i++) {
		this.$goban.find('td[coord=' + val.coords[i] + ']').html('<div class = "goban-stone stone-' + val.color + '"></div>')
	};
};
lib.Goban.prototype.clearCell = function(val) {
	this.$goban.find('td[coord=' + val + ']').html('');
};

// Move Properties KO, MN
lib.Goban.prototype.B = lib.Goban.prototype.blackMove;
lib.Goban.prototype.W = lib.Goban.prototype.whiteMove;
// Setup Properties	AE,PL	
lib.Goban.prototype.AB = function(val) {
	var $cell;
	val = val.split(',');
	for (var i = 0; i < val.length; i++ ) {
		$cell = this.$goban.find('td[coord=' + val[i] + ']'),
		$cell.html('<div class = "goban-stone stone-black"></div>');
	};
};
lib.Goban.prototype.AW = function(val) {
	var $cell;
	val = val.split(',');
	for (var i = 0; i < val.length; i++ ) {
		$cell = this.$goban.find('td[coord=' + val[i] + ']'),
		$cell.html('<div class = "goban-stone stone-white"></div>');
	};
};
// Node Annotation Properties 	C, DM, GB, GW, HO, N, UC, V
// Move Annotation Properties 	BM, DO, IT, TE	
// Markup Properties 	AR, CR, DD, LB, LN, MA, SL, SQ, TR	
// Root Properties 	AP, CA, FF, GM, ST, SZ	
// Game Info Properties 	AN, BR, BT, CP, DT, EV, GC, GN, ON, OT, PB, PC, PW, RE, RO, RU, SO, TM, US, WR, WT	
// Timing Properties 	BL, OB, OW, WL	
// Miscellaneous Properties 	FG, PM, VW

// ****************************************************************************