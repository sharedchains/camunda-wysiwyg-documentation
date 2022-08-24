const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CamundaModelerWebpackPlugin = require('camunda-modeler-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-react' ]
          }
        }
      },
      {
        test: /\.svg$/,
        use: 'react-svg-loader'
      },
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ],
      },
      { test: /\.(png|jpe?g|gif|woff2?|ttf|eot)$/, use: [ 'file-loader' ] }
    ]
  },
  resolve: {
    fallback: {
      'util': false,
      'assert': false
    }
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CamundaModelerWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './node_modules/@sh4red/bpmn-js-documentation-viewer/assets/css/docViewer.css'),
          to: path.resolve(__dirname, './dist/')
        },
        {
          from: path.resolve(__dirname, './index.prod.js'),
          to: path.resolve(__dirname, './dist/index.js')
        },
        {
          from: path.resolve(__dirname, './style/'),
          to: path.resolve(__dirname, './dist/')
        }
      ]
    }),
    new ZipPlugin({
      filename: process.env.npm_package_name + '-' + process.env.npm_package_version + '.zip',
      pathPrefix: 'camunda-wysiwyg-documentation/',
      pathMapper: function(assetPath) {
        if (assetPath.startsWith('client')) {
          return path.join(path.dirname(assetPath), 'client', path.basename(assetPath));
        } else if (assetPath.endsWith('.css')) {
          return path.join(path.dirname(assetPath), 'style', path.basename(assetPath));
        }
        return assetPath;
      }
    })
  ]
};