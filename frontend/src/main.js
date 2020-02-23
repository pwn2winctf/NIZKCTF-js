import Vue from "vue";
import VueMaterial from "vue-material";
import VueI18n from "vue-i18n";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import messages from "@/internationalization";

import "vue-material/dist/vue-material.min.css";
import "@/themes.scss";

Vue.config.productionTip = false;

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
