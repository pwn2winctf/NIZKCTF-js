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
    "https://aeb7353929524e2fa3f5f6c345193cda@o398825.ingest.sentry.io/5255091",
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
