const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './src/index.js',
  ],
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Voter',
      template: './public/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin([
      { from: './src/assets', to: './build/assets' },
    ]),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '',
  },
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, './public'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
        }, {
          loader: 'eslint-loader',
          options: {
            failOnError: true,
            failOnWarning: true,
          },
        }],
      }, {
        test: /\.worker\.js$/,
        exclude: [/node_modules/],
        use: ['worker-loader', 'babel-loader'],
      }, {
        test: /\.s?css$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            modules: {
              mode: 'local',
              localIdentName: '[local]',
              context: path.resolve(__dirname, 'src'),
            },
          },
        }, {
          loader: 'sass-loader',
        }],
      }, {
        test: /\.(eot|ttf|woff|woff2)$/,
        exclude: [/img/],
        use: [{
          loader: 'file-loader',
          options: {
            name(file) {
              return '[name].[ext]';
            },
            outputPath: 'fonts/',
          },
        }],
      }, {
        test: /\.(jpeg|jpg|png|svg)$/,
        exclude: [/fonts/, /downloads/],
        use: [{
          loader: 'file-loader',
          options: {
            name(file) {
              return '[name].[ext]';
            },
            outputPath: 'img/',
          },
        }],
      }, {
        test: /\.(png|zip|pdf)$/,
        include: [/downloads/],
        use: [{
          loader: 'file-loader',
          options: {
            name(file) {
              return '[name].[ext]';
            },
            outputPath: 'downloads/',
          },
        }],
      }],
  },
};