const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	output: {
		filename: 'index.js',
		library: {
			name: 'Tempus',
			type: 'umd',
			umdNamedDefine: true,
			export: 'default'
		},
		uniqueName: '@taw/tempus'
	}
});
