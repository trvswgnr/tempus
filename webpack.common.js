const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	devtool: 'source-map',
	plugins: [
		new webpack.BannerPlugin({
			raw: true,
			banner: `
/*!
 * Tempus v${process.env.npm_package_version} (https://trvswgnr.github.io/tempus/)
 * Copyright ${new Date().getFullYear()} Travis Aaron Wagner (https://github.com/trvswgnr/)
 * Licensed under MIT (https://github.com/trvswgnr/tempus/blob/main/LICENSE)
 */`
		})
	],
	output: {
		path: path.resolve(__dirname, './dist')
	}
};
