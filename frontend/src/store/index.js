import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import VuexPersist from "vuex-persist";

const plugins = [];

const DEV = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: "pw2winctf",
  storage: window.localStorage
});
plugins.push(vuexLocalStorage.plugin);

if (DEV) {
  const logger = createLogger();
  plugins.push(logger);
}

export default new Vuex.Store({
  strict: DEV,
  state: {
    theme: "default"
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme;
    }
  },
  actions: {
    setTheme(context, theme) {
      context.commit("setTheme", theme);
    }
  },
  modules: {},
  plugins
});
