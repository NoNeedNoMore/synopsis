var config = config || {};
config.select2Opts = {
	minimumInputLength: 0,
	width: '100%',
	ajax: {
		url: 'select2.json/services/all',
		dataType: 'json',
		type: 'post',
		quietMillis: 100,
		data: function (term, page) {
			return {
				q: term, 
				page_limit: 10, 
				page: page, 
				opts: $(this).data('opts')
			};
		},
		results: function (data, page) {
			var more = (page * 10) < data.total; 
			return {results: data.opts, more: more};
		}
	},
	formatResult: function(data) {return data.title;}, 
	formatSelection: function(data) {return data.text;}, 
	dropdownCssClass: 'remoteSelect'
};