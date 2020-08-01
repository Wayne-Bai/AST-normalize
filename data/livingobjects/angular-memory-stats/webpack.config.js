var path = require('path'),
    testPath = path.join(__dirname, 'test'),
    wwwPath = path.join(__dirname, 'www'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    entry: path.join(testPath, 'test.module.coffee'),
    output: {
        path: wwwPath,
        filename: 'test.js'
    },
    module: {
        loaders: [{
            test: /[\/]angular\.js$/,
            loader: 'expose?angular!exports?window.angular'
        }, {
            test: /\.coffee$/,
            loader: "coffee"
        }]
    },
    resolve: {
        extensions: ['', '.js', '.json', '.scss', '.coffee', '.html']
    },
    plugins: [new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'wp-api-angularjs',
            template: path.join(testPath, 'index.html')
        }),
        new ngAnnotatePlugin({
            add: true
        })
    ]
};