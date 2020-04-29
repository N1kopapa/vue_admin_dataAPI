var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
const webpack = require("webpack");


module.exports = (env, argv) => {
    argv.mode = 'development'

    commonConfig = commonConfig(env, argv)


    return webpackMerge(commonConfig, {
        mode: argv.mode,
        devServer: {
            hot: false, 
            contentBase: false,
            compress: false,
            port: 8000,
            stats: "minimal",
            host: "0.0.0.0",
            disableHostCheck: true
        },
        plugins: [
            //new webpack.HotModuleReplacementPlugin()
        ],
    })
};