const { commonConfig, resolveApp } = require('./webpack.config.common')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const prodBaseUrl = 'migrations-flow/dist/'

const config = {
  ...commonConfig,
  mode: 'production',
}
config.plugins.unshift(new CopyWebpackPlugin([
  {
    from: resolveApp('public'),
    to: resolveApp('dist'),
  }
]))

config.output.publicPath = prodBaseUrl // added to script tags in html
const htmlWpPlugin = config.plugins.find(pl => pl.constructor === HtmlWebpackPlugin)
htmlWpPlugin.options.baseUrl = prodBaseUrl // accessed in html through <%= htmlWebpackPlugin.options.baseUrl %>
const definePlugin = config.plugins.find(pl => pl.constructor === webpack.DefinePlugin)
definePlugin.definitions['DATA_PATH'] = JSON.stringify('outputs/') // accessed in js

module.exports = config
