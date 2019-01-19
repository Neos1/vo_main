const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: [
        './ballot'
    ],
    plugins: [
        new CleanWebpackPlugin(['../build/ballot'], { allowExternal: true }),
        new HtmlWebpackPlugin({
            title: 'Ballot',
            template: 'index.html',
            filename: 'index.html',
            hash: true
        }),
        new CopyWebpackPlugin([
            { from: './assets', to: 'assets' }
        ]),
        new webpack.DefinePlugin({
            PROJECT: JSON.stringify('ballot')
        })
    ],
    output: {
        path: path.resolve(__dirname, '../build/ballot'),
        filename: 'bundle.js',
        publicPath: ''
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: [/node_modules/],
            use: ['babel-loader'],
        }, {
            test: /\.s?css$/,
            use: [{
                loader: "style-loader",
            }, {
                loader: "css-loader",
                options: {
                    modules: true,
                    localIdentName: '[local]'
                }
            }, {
                loader: "sass-loader",
                options: {
                    modules: true,
                    localIdentName: '[local]'
                }
            }]
        }, {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            exclude: [/img/],
            use: [{
                loader: 'file-loader',
                options: {
                    name (file) {
                        return '[name].[ext]';
                    },
                    outputPath: 'fonts/'
                }
            }]
        }, {
            test: /\.(jpeg|jpg|png|svg)$/,
            exclude: [/fonts/, /downloads/],
            use: [{
                loader: 'file-loader',
                options: {
                    name (file) {
                        return '[name].[ext]';
                    },
                    outputPath: 'img/'
                }
            }]
        }, {
            test: /\.(png|zip|pdf)$/,
            include: [/downloads/],
            use: [{
                loader: 'file-loader',
                options: {
                    name (file) {
                        return '[name].[ext]';
                    },
                    outputPath: 'downloads/'
                }
            }]
        }]
    }
};