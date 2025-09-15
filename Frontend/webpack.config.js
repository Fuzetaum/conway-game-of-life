const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true,
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components/'),
        '@services': path.resolve(__dirname, 'src/services/'),
        '@hooks': path.resolve(__dirname, 'src/hooks/'),
        '@utils': path.resolve(__dirname, 'src/utils/'),
        '@types': path.resolve(__dirname, 'src/types/')
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      new Dotenv({
        path: env.production ? '.env.production' : '.env.development',
        safe: true,
        systemvars: true
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: 3000,
      hot: true,
      open: true
    },
    devtool: env.production ? 'source-map' : 'eval-source-map'
  }
};