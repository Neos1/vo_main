const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

module.exports = (env) => {
    const common = require('./webpack.' + (env && env.project ? env.project : 'ballot' ) +  '.js');
    return merge(common, {
        devtool: 'eval',
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                TARGET: JSON.stringify('hive')
            })
        ],
    });
}