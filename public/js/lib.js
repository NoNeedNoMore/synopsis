var lib = lib || {};
// ****************************************************************************
lib.initByClass = function($div) { // $div - jquery объект в котором ищем классы для инициализации
	$div
		.find('.game').each(function(e, el) {new lib.Goban($(el)); }).end()
		.find('.games').each(function(i, el) {new lib.Table($(el)); }).end()
		.find('.remoteSelect').select2(config.select2Opts).end()
		.find('.remoteMultiSelect').select2($.extend({}, config.select2Opts, {multiple: true} ));
	return lib;
};