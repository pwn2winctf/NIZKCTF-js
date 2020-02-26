const config = require("./src/config.json");

module.exports = {
  publicPath: config.deployPath,
  configureWebpack: {
    devtool: "source-map"
  }
};
