var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
 

// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

// const smp = new SpeedMeasurePlugin();//smp.wrap(
module.exports = (env, argv) => {
    argv.mode = 'production'
    const devMode = argv.mode !== 'production'
 
    commonConfig = commonConfig(env, argv)
    return webpackMerge(commonConfig, {
        mode: argv.mode,
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ],
            runtimeChunk: 'single',
            namedModules: true,

            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                maxSize: 0, 
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // commons: {
                    //     test: /[\\/]node_modules[\\/]/,
                    //     // cacheGroupKey here is `commons` as the key of the cacheGroup
                    //     name(module, chunks, cacheGroupKey) {
                    //         debugger;
                    //         const moduleFileName = module.resource().split('/').reduceRight(item => item);
                    //         const allChunksNames = chunks.map((item) => item.name).join('~');
                    //        // return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
                    //         return `npm.${moduleFileName.replace('@', '')}`;
                    //     } 
                    // },
                    vendor: { 
                        test: /[\\/]node_modules[\\/]/,
                        name(module, chunks, cacheGroupKey) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            // return `npm`;
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `npm.${packageName.replace('@', '')}`;
                        },
                        priority: 1000,
                        reuseExistingChunk: true
                    },

                    constants: {
                        enforce: true,
                        test: /src[\\/]constants\.ts/,
                        name(module, chunks, cacheGroupKey) {
                            return `constants`;
                        },
                        priority: 900,
                        reuseExistingChunk: true
                    },

                    //common chunk
                    // common: {
                    //     name: 'common',
                    //     minChunks: 2,
                    //     chunks: 'async',
                    //     priority: 850,
                    //     reuseExistingChunk: true,
                    //     enforce: true
                    // },
                    lib: {
                        chunks: 'all',
                        enforce: true,
                        test: /src[\\/](lib|components)/,
                        name(module, chunks, cacheGroupKey) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName


                            const identifier = module.identifier()

                            // if (identifier.startsWith("css") || identifier.endsWith("css"))
                            //     return "css.default"

                            let resource = (module.resource || module.context)
                            if ((resource || "").indexOf("lib") > -1)
                                return `lib`;
                            if ((resource || "").indexOf("components") > -1)
                                return `lib.components`;
                            const matches = resource && resource.match(/src[\\/](lib|components)[\\/]([\w-]+)([\\/\.]|$)/);
                            if (!matches || !matches.length) {
                                return `lib.default`;
                            }
                            packageName = matches[1] + "_" + matches[2]
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `lib.${packageName.replace('@', '')}`;
                        },
                        priority: 800,
                        reuseExistingChunk: true
                        ,
                    },
                    app: {
                        chunks: 'all', 
                        enforce: true,
                        priority: 500,
                        reuseExistingChunk: true,
                        test: /src[\\/](app|assets)/,
                        name(module, chunks, cacheGroupKey) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName

                            const identifier = module.identifier()
                            if (identifier.startsWith("css") || identifier.endsWith("css") ||
                                identifier.startsWith("png") || identifier.endsWith("png")
                            ) {
                                // if (identifier.indexOf("node_modules"))
                                //     return "npm.assets"
                                return `app.app_home`;//"assets"
                            }
                            let resource = (module.resource || module.context)

                            const matches = resource && resource.match(/src[\\/](app|assets)[\\/]([\w-]+)([\\/\.]|$)/);
                            if (!matches || !matches.length) {
                                return `app.default`;
                            }
                            //
                            let m2 = matches[2]
                            if (m2 == `layout`) {
                                m2 = `home`;
                            }
                            packageName = matches[1] + "_" + m2
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `app.${packageName.replace('@', '')}`;
                        },
                    },

                }
            }
        },
        plugins: [
            new CleanWebpackPlugin() 
        ]
    })//)
};