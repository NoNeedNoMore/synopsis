
var a = (function(a){
	a.map = a.map || {};
 	a.map.handler = function(o){
		o = o || {};
		$.extend({map:a.map},o);
		$(document).on('click',function(e){
			var key = e.keyCode,
				v = o.map.snake.vel;
			if (v.dir == 'up'){v.newDir = 'left'}; 
			if (v.dir == 'left'){v.newDir = 'down'}; 
			if (v.dir == 'down'){v.newDir = 'right'}; 
			if (v.dir == 'right'){v.newDir = 'up'}; 
		});
		$(document).on('contextmenu', function(e) {
			var key = e.keyCode,
				v = o.map.snake.vel;
			if (v.dir == 'up'){v.newDir = 'right'}; 
			if (v.dir == 'right'){v.newDir = 'down'}; 
			if (v.dir == 'down'){v.newDir = 'left'}; 
			if (v.dir == 'left'){v.newDir = 'up'};
			return false;
		});
		$(document).on('keydown',function(e){
			var key = e.keyCode;
			if (key == 37 || key == 65){o.map.snake.vel.newDir = 'left'}; // стрелка влево или A
			if (key == 38 || key == 87){o.map.snake.vel.newDir = 'up'}; // стрелка вверх или W
			if (key == 39 || key == 68){o.map.snake.vel.newDir = 'right'}; // стрелка вправо или D
			if (key == 40 || key == 83){o.map.snake.vel.newDir = 'down'}; // стрелка вниз или S
			if (key == 32){	// пробел
				if (o.map.interval == '') {
					o.map.interval = setInterval(function(){
						o.map.$.trigger('move');
					},o.map.period);}
				else {clearInterval(o.map.interval);o.map.interval = ''};
			}; 
		});
		o.map.$.on('move',function(){
			var m = o.map,
				s = m.snake,
				b = s.body;
				v = s.vel;
			if (v.newDir == 'left' && v.dir != 'right'){v.x = -1; v.y = 0; v.dir = 'left'};
			if (v.newDir == 'up' && v.dir != 'down'){v.x = 0; v.y = -1; v.dir = 'up'};
			if (v.newDir == 'right' && v.dir != 'left'){v.x = 1; v.y = 0; v.dir = 'right'};
			if (v.newDir == 'down' && v.dir != 'up'){v.x = 0; v.y = 1; v.dir = 'down'};
			var len = b.length - 1;
			b.push({
				x:b[len].x + v.x,
				y:b[len].y + v.y
			});
			len++;
			var head = m.add({x:b[len].x,y:b[len].y,val:'snake'});
			if (head == 'border' || head == 'snake'){
				alert('Game Over');
				location.reload();
			};
			if (head == 'food'){
				m.food.add({map:m,old:m.buildIndex({x:b[len].x,y:b[len].y,val:'snake'})});
				if (m.period > 100) {m.period -= 10;};
				clearInterval(m.interval);
				m.interval = setInterval(function(){
					m.$.trigger('move');
				},m.period);
				//m.$v.text('Скрость - ' + Math.floor((1000/m.period)*1000-1900));
				return;
			};			
			m.del({x:b[0].x,y:b[0].y,val:'snake'});
			b.splice(0,1);
		});
	}; 
	a.map.init = function(o){
		o = o || {};
		o = $.extend(true,{
				id:'GameDiv',
				maxX:25,
				maxY:25,
				scale:20,
				style:{
					border: '4px double black',
					background: 'grey'
				},
				food:a.food,
				snake:a.snake
		},o);
		$.extend(true,this,o);
		this.width = this.maxX * this.scale + 8;
		this.height = this.maxY * this.scale + 8;
		this.$ = $('#' + this.id);
		$.extend(this.style,{width:this.width + 'px',height:this.height + 'px'});
		this.$.css(this.style).html('<canvas id = "' + this.id + 'canvas" width = "' + this.width + '" height = "' + this.height + '">');
		this.canvas = $('#' + this.id + 'canvas')[0].getContext('2d');
		this.addBorder();
		this.food.add({map:this});
		this.snake.init({map:this});
		this.handler({map:this});
		this.period = this.snake.vel.v * 1000;
		this.interval = setInterval(function(){
			a.map.$.trigger('move');
		},this.period);
		//this.$.append('<div id = "' + this.id +'v">Скорость - ' + Math.floor((1000/this.period)*1000-1900) + '</div>');
		//this.$v = $('#' + this.id + 'v');
		return this;
	};
	a.map.buildIndex = function(o){
		o = o || {};
		return 'x' + o.x + 'y' + o.y;
	};
	a.map.add = function(o){
		o = o || {};
		var ind = this.buildIndex(o);
		if (this[ind] != undefined) {return this[ind];};
		this[ind] = o.val;
		this.draw(o);
		return this[ind] + 'New';
	};
	a.map.draw = function(o){
		o = o || {};
		if (o.val == 'food' || o.val == 'snake'){
			this.canvas.fillRect(o.x * this.scale,o.y * this.scale, this.scale, this.scale);
		};
	};
	a.map.del = function(o){
		o = o || {};
		delete this[this.buildIndex(o)];
		if (o.val == 'snake'){
			this.canvas.clearRect(o.x * this.scale, o.y * this.scale, this.scale, this.scale );
		};
		return this;
	};
	a.map.addBorder = function(){
		for (var i = 0;i < this.maxX;i++){
			this.add({x:i,y:-1,val:'border'});
			this.add({x:i,y:this.maxY,val:'border'});
		};
		for (var i = 0;i < this.maxY;i++){
			this.add({x:-1,y:i,val:'border'});
			this.add({x:this.maxX,y:i,val:'border'});
		};
		return this;
	};
	a.snake = a.snake || {};
	a.snake.body = [{x:10,y:20},{x:10,y:19},{x:10,y:18}];
	a.snake.vel = {x:0,y:-1,v:0.5,dir:'up',newDir:'up'};
	a.snake.init = function(o){
		o = o || {};
		for (var i = 0,len = this.body.length; i < len;i++){
			o.map.add({x:this.body[i].x,y:this.body[i].y,val:'snake'});
		};
	};
	a.food = a.food || {};
	a.food.add = function(o){
		o = o || {};
		o = $.extend(true,{
				map:a.map
			},o);
		delete o.map[o.old];
		while (o.map.add({x:Math.floor(Math.random() * o.map.maxX),y:Math.floor(Math.random() * o.map.maxY),val:'food'}) != 'foodNew') {};
	};	
	return a;
})(a || {});

// ******************************************* После загрузки ******************************************* 
$(function(){
	a.map.init();
});
















