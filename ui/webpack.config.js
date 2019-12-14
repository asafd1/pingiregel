const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    devServer: {
        port: 3000,
        host: "0.0.0.0"
    },
    entry: './App.jsx',
    output: {
        filename: 'bundle.[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './App.html'
        })
    ],
    resolve: {
        modules: [__dirname, 'node_modules'],
        extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: require.resolve('babel-loader')
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    }
}
