import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../views/Home.vue";
import Settings from "../views/Settings.vue";
import Rank from "../views/Rank.vue";
import Rules from "../views/Rules.vue";
import Challenges from "../views/Challenges.vue";
import AfterLogin from "../views/AfterLogin.vue";
import Faq from "../views/Faq.vue";

import store from "../store";
import config from "@/config.json";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings
  },
  {
    path: "/rank",
    name: "Rank",
    component: Rank
  },
  {
    path: "/challenges",
    name: "Challenges",
    component: Challenges
  },
  {
    path: "/rules",
    name: "Rules",
    component: Rules
  },
  {
    path: "/after-login",
    name: "Logged",
    component: AfterLogin
  },
  {
    path: "/faq",
    name: "Faq",
    component: Faq
  }
  // {
  //   path: "/about",
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue")
  // }
];

const router = new VueRouter({
  base: config.deployPath,
  mode: "history",
  routes
});

router.beforeEach((to, from, next) => {
  if (store.getters.token && !store.getters.team && to.path !== '/after-login') {
    next('/after-login');
  } else {
    next();
  }
});

export default router;
