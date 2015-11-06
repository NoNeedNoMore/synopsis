var index = new (require('../base'))({
		render: './views/snake',
		viewOpts: {
			view: 'various',
			title: 'Змейка'
		}
	});

module.exports = index;