const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: path.resolve(__dirname, 'dist'),
  configureWebpack: {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash].js'
    }
  },
  chainWebpack: config => {
    // Remove qualquer instância existente do HtmlWebpackPlugin
    config.plugins.delete('html')
    
    // Adiciona uma nova instância do HtmlWebpackPlugin
    config
      .plugin('html')
      .use(require('html-webpack-plugin'), [{
        template: path.resolve(__dirname, 'public/index.html'),
        filename: 'index.html',
        templateParameters: {
          BASE_URL: '/'
        }
      }])

    // Remove o plugin de cópia padrão
    config.plugins.delete('copy')

    // Adiciona um novo plugin de cópia apenas para favicon
    config
      .plugin('copy')
      .use(require('copy-webpack-plugin'), [{
        patterns: [
          {
            from: path.resolve(__dirname, 'public/favicon.ico'),
            to: path.resolve(__dirname, 'dist')
          }
        ]
      }])
  }
})
