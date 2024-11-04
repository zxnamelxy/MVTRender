const { defineConfig } = require('@vue/cli-service')
// 配置webpack打包
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
  }
})
