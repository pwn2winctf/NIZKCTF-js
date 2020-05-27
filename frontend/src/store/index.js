import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import VuexPersist from "vuex-persist";

import { acceptedSubmissions, news } from "@/services/firebase";

const plugins = [];

const DEV = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: "pw2winctf-2020",
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
    theme: "default",
    language: "en",
    token: null,
    user: null,
    team: null,
    repository: null,
    solvedChallenges: [],
    solvedChallengesFromFirebase: [],
    solvedChallengesFromPolling: [],
    news: [],
    newsFromFirebase: [],
    newsFromPolling: []
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme;
    },
    setLanguage(state, language) {
      state.language = language;
    },
    setToken(state, token) {
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    setTeam(state, team) {
      state.team = team;
    },
    setRepository(state, repository) {
      state.repository = repository;
    },
    setSolvedChallengesFromFirebase(state, solvedChallenges) {
      state.solvedChallengesFromFirebase = solvedChallenges;
    },
    setSolvedChallengesFromPolling(state, solvedChallenges) {
      state.solvedChallengesFromPolling = solvedChallenges;
    },
    mergeSolvedChallenges(state) {
      const lastAcceptedFromPolling = Math.max(
        state.solvedChallengesFromPolling.map(({ lastAccept }) => lastAccept)
      );

      const mostRecent = state.solvedChallengesFromFirebase.filter(
        ({ lastAccept }) => lastAccept > lastAcceptedFromPolling
      );

      const list = state.solvedChallengesFromPolling.filter(
        ({ team }) => !mostRecent.some(item => item.team === team)
      );

      state.solvedChallenges = [...list, ...mostRecent];
    },
    setNewsFromFirebase(state, news) {
      state.newsFromFirebase = news;
    },
    setNewsFromPolling(state, news) {
      state.newsFromPolling = news;
    },
    mergeNews(state) {
      const lastNewsFromPolling = Math.max(
        state.newsFromPolling.map(({ time }) => time)
      );

      const mostRecent = state.newsFromFirebase.filter(
        ({ time }) => time > lastNewsFromPolling
      );

      state.news = [...state.newsFromPolling, ...mostRecent];
    }
  },
  actions: {
    setTheme(context, theme) {
      context.commit("setTheme", theme);
    },
    setSolvedChallengesFromPolling(context, acceptedSubmissions) {
      context.commit("setSolvedChallengesFromPolling", acceptedSubmissions);
      context.commit("mergeSolvedChallenges");
    },
    setLanguage(context, language) {
      context.commit("setLanguage", language);
    },
    setToken(context, token) {
      context.commit("setToken", token);
    },
    setUser(context, user) {
      context.commit("setUser", user);
    },
    setTeam(context, team) {
      context.commit("setTeam", team);
    },
    setRepository(context, repository) {
      context.commit("setRepository", repository);
    },
    setNewsFromPolling(context, news) {
      context.commit("setNewsFromPolling", news);
      context.commit("mergeNews");
    },
    startFirebaseConnection(context) {
      acceptedSubmissions.on("value", snapshot => {
        const value = snapshot.val() || [];

        context.commit("setSolvedChallengesFromFirebase", value);
        context.commit("mergeSolvedChallenges");
      });

      news.on("value", snapshot => {
        const value = snapshot.val() || [];

        context.commit("setNewsFromFirebase", value);
        context.commit("mergeNews");
      });
    }
  },
  getters: {
    language: state => state.language,
    token: state => state.token,
    team: state => state.team,
    user: state => state.user,
    solvedChallenges: state => state.solvedChallenges
  },
  modules: {},
  plugins
});
