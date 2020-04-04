const { version } = require("./package.json");
const configJson = require("./src/config.json");

process.env.VUE_APP_VERSION = version;

module.exports = {
  publicPath: configJson.deployPath,
  configureWebpack: {
    devtool: "source-map"
  },
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = configJson.title;
      return args;
    });
  }
};
