const { version } = require("./package.json");
const configJson = require("./src/config.json");
const SentryPlugin = require("@sentry/webpack-plugin");

process.env.VUE_APP_VERSION = version;

module.exports = {
  publicPath: configJson.deployPath,
  configureWebpack: {
    devtool: "source-map",
    plugins: [
      new SentryPlugin({
        release: `web-client@${process.env.VUE_APP_VERSION}`,
        include: "./dist",
        ignore: ["node_modules", "vue.config.js"]
      })
    ]
  },
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = configJson.title;
      return args;
    });
  }
};
