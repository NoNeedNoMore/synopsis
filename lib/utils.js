var lib = {},
	pg = require('pg');

lib.sgfToJson = function(str) {
	var sgf = {},
		arr = [];
	str = str
		.replace(/\\\]/gm, '&#93;' )
		.replace(/\[[^\]]*?\]/gm, function(str) {return !arr.push(str.slice(1,-1)) || '[comment]'; } )
		.replace(/\]\[/gm, ',' )
		.replace(/[\n\r\t]/gm, '' )
		.replace(/\[(?!;)/g , '":"' )
		.replace(/\(;/g , '({"' )
		.replace(/\]\(/g , '"}(' )
		.replace(/\]\)/g , '"})' )
		.replace(/\](?!;)/g , '","' )
		.replace(/\)\(/g, ']},{"m":[')	
		.replace(/\(/, '[{"m":[' )
		.replace(/\(/g, '],"n":[{"m":[' )
		.replace(/\)/g, ']}' )
		.replace(/\];/g , '"},{"' ) + ']';
	arr.reverse();
	try {
		sgf.json = JSON.parse(str, function(key, val) {
			if ((val + '').indexOf('comment') < 0 ) {return val; };
			var len = val.split(',').length, result = [];
			for (var i = 0; i < len; i++ ) {result.push(arr.pop()); };
			return result.join(','); 
		});
		sgf.text = JSON.stringify(sgf.json);
	} catch(e) {
		console.log(e);
	};
	return sgf;
};

module.exports = lib;