import Vue from "vue";
import VueMaterial from "vue-material";
import VueI18n from "vue-i18n";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import messages from "@/internationalization";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

import "vue-material/dist/vue-material.min.css";
import "@/themes.scss";

console.info(`VERSION: ${process.env.VUE_APP_VERSION}`);

Vue.config.productionTip = false;

Sentry.init({
  dsn:
    "https://2140e0ab448b4b8a9d256b2fc0f0df30@o374062.ingest.sentry.io/5191556",
  environment: process.env.NODE_ENV || "staging",
  logLevel: Sentry.Severity.Debug,
  integrations: [new Integrations.Vue({ Vue, attachProps: true })],
  release: `web-client@${process.env.VUE_APP_VERSION}`,
  handlePromiseRejection: true,
  attachStacktrace: true
});

if (store.getters.user) {
  Sentry.configureScope(scope => {
    scope.setUser({
      id: store.getters.user.username,
      username: store.getters.user.name
    });
  });
}

Vue.use(VueMaterial);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: store.getters.language,
  fallbackLocale: "en",
  messages
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
