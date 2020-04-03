const configJson = require("./src/config.json");

module.exports = {
  publicPath: configJson.deployPath,
  configureWebpack: {
    devtool: "source-map"
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = configJson.title
        return args
      })
  }
};
