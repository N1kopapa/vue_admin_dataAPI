const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const myloader = path.resolve('./config/myloader.js');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

let loaderBabel =
{
    loader: 'babel-loader',
    options: {
        "presets": [
            [
                "@babel/env",
                {
                    // "corejs": 3,y
                    "targets": {
                        "chrome": "58", "firefox": "58", "safari": "11"                       //, "ie": "11"
                    },
                    "modules": false,
                    "debug": false

                    // "useBuiltIns": false
                },

            ]//, "@babel/typescript"
        ],
        "plugins": [
            // '@babel/plugin-transform-runtime'
            // "@babel/proposal-class-properties",
            // "@babel/proposal-object-rest-spread"
        ],
        cacheDirectory: true
    }
}
module.exports = (env, argv) => {

    const devMode = argv.mode !== 'production'
    const extractSass = new MiniCssExtractPlugin({
        filename: devMode ? '[name].css' : '[contenthash].css',
        chunkFilename: devMode ? '[name].css' : '[contenthash].chunk.css',
    });

    return {

        entry: {
            //polyfills: './src/lib/polyfill.ts', 
            home: './src/index.ts'
        },
        node: false,
        devtool: devMode ? 'cheap-module-eval-source-map' : 'cheap-source-map', //cheap-source-map
        stats: {
            entrypoints: false,
            children: false ,
            excludeModules: false
        },
        performance: {
            maxEntrypointSize: 100000
        },
        output: {
            pathinfo: false,
            path: path.resolve(__dirname, '../wwwroot'),
            publicPath: '',
            filename: devMode ? '[name].js' : '[name].[contenthash].js',
            chunkFilename: devMode ? '[id].chunk.js' : '[name].[contenthash].chunk.js'
        },
        resolve: {
            symlinks: false,
            alias: {
                // page: 'page-js'
                svelte: path.resolve('node_modules', 'svelte'),
                pell: path.resolve('src', 'lib',"pell")
            },
            extensions: ['.mjs', '.ts', '.js','.svelte'], 
            mainFields: ['svelte','browser', 'module', 'main']
        },
        externals: {
            //jquery: 'jQuery',
            knockout: 'ko',
            "process": 'process'
        },
        module: {
            rules: [

                {
                    test: /\.svelte$/,
                    use: [
                        loaderBabel,
                        {
                            loader: 'svelte-loader',
                            options: {
                                emitCss: true,
                                hotReload: false
                            }
                        }]
                },
                {
                    test: /\.html$/,
                    use: [{
                        loader: "html-loader",
                        options: {
                            minimize: true,
                            removeComments: false
                        }
                    }]
                },
                {
                    test: /\.(svg|woff|woff2|ttf|eot)$/,
                    use: 'file-loader?name=assets/[name].[ext]'
                },
                {
                    test: /\.(png|jpe?g|gif|ico)$/,
                    use: [{
                        loader: 'file-loader?name=assets/[name].[hash:7].[ext]'
                        // options: {
                        //     limit: 10000,
                        //     outputPath: 'assets/',          //打包目录
                        //     name: '[name].[hash:7].[ext]'
                        // }
                    }]
                },

                {
                    test: /\.m?jsx?$/,
                    exclude: /node_modules\/(?!svelte)/,
                    loader: [
                        "cache-loader",
                        loaderBabel
                    ],
                },
                {
                    test: /\.ts(x?)$/,
                    exclude: /node_modules/,
                    use: [
                        "cache-loader",
                        loaderBabel,
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true,

                            }
                        }
                    ]
                },
                {
                    test: /\.(scss|sass|css)$/,
                    use: [
                        {
                            //loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: devMode,
                            }
                        },
                        "cache-loader",
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: false
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass"),
                                sourceMap: false
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.IgnorePlugin(/weakmap$/, /knockout-es5/),

            new webpack.ProvidePlugin({
                ko: "knockout"
            }),
            // new webpack.PrefetchPlugin(path.join(__dirname, '../src/app/dynamicapp/list.ts')),
            // new webpack.PrefetchPlugin(path.join(__dirname, '../src/app/dynamicapp/index.ts')),
            // new webpack.PrefetchPlugin(path.join(__dirname, '../src/app/dynamicapp/create.ts')),
            // new webpack.PrefetchPlugin(path.join(__dirname, '../node_modules/date-fns/format/index.js')),
            extractSass,
            new MonacoWebpackPlugin({
                languages: ["html", "css", "javascript", "typescript", "python"],
                features: ['accessibilityHelp', 'bracketMatching', 'caretOperations', 'clipboard', 'codeAction', 'codelens', 'colorDetector', 'comment', 'contextmenu', 'coreCommands', 'cursorUndo', 'dnd', 'find', 'folding', 'fontZoom', 'format', 'goToDefinitionCommands', 'goToDefinitionMouse', 'gotoError', 'gotoLine', 'hover', 'inPlaceReplace', 'inspectTokens', 'iPadShowKeyboard', 'linesOperations', 'links', 'multicursor', 'parameterHints', 'quickCommand', 'quickOutline', 'referenceSearch', 'rename', 'smartSelect', 'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode', 'transpose', 'wordHighlighter', 'wordOperations', 'wordPartOperations']
            })
        ]
    }
};