const dotenv = require('dotenv')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env, argv) => {
  const mode = argv.mode || 'development'
  const app_env = process.env.APP_ENV || 'development'
  dotenv.config({path: '.env'})
  const useSsl = (process.env.USE_SSL == 'true')

  return {
    mode: mode,
    entry: {
      app: __dirname + '/src/app.js',
      demo: __dirname + '/src/demo.js',
      worker: __dirname + '/src/worker.js'
    },
    output: {
      path: __dirname + '/public',
      filename: '[name].js'
    },
    devtool: mode == 'development' ? 'eval-source-map' : false,
    devServer: {
      static: {
        directory: __dirname + '/public',
      },
      compress: true,
      port: 4000,
      hot: false,
      headers: {
        'ACCESS-CONTROL-ALLOW-ORIGIN': 'https://dfk-paris.org'
      },
      client: {
        overlay : {
          warnings: false
        },
        webSocketURL: `${process.env.STATIC_URL}/ws`,
      },
    },
    module: {
      rules: [
        {
          test: /\.riot$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              },
            },{
              loader: '@riotjs/webpack-loader',
              options: {
                // hot: true, // set it to true if you are using hmr
                // add here all the other @riotjs/compiler options riot.js.org/compiler
                // template: 'pug' for example
            }
          }]
        }, {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {url: false}
            }
          ]
        }, {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {url: false}
            },
            'sass-loader',
          ]
        }, {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {from: 'frontend/.htaccess'},
          {from: 'frontend/src/print.css'},
          {from: 'frontend/src/email.tpl'}
        ]
      }),
      new webpack.DefinePlugin({
        staticUrl: JSON.stringify(process.env.STATIC_URL)
      }),
      new HtmlWebpackPlugin({
        template: 'frontend/src/index.ejs',
        filename: 'index.html',
        meta: {
          'viewport': 'width=device-width, initial-scale=1',
        },
        'hash': true,
        'chunks': ['demo']
      })
    ]
  }
}
