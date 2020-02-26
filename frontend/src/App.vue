<template>
  <md-app md-mode="fixed" class="container" :md-theme="this.theme">
    <md-app-toolbar class="md-primary" md-elevation="0">
      <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">{{ $t(`router.${this.$route.name}`) }}</span>
      <div class="md-toolbar-section-end">
        <md-menu
          md-size="big"
          md-direction="top-start"
          :md-active.sync="cardVisible"
        >
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon>person</md-icon>
          </md-button>

          <md-menu-content>
            <md-list>
              <md-list-item :href="authLink" target="_blank"
                >Logar com GitHub</md-list-item
              >
            </md-list>
          </md-menu-content>
        </md-menu>
      </div>
    </md-app-toolbar>
    <md-app-drawer :md-active="menuVisible" md-persistent="mini">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">{{ $t("navigation") }}</span>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-dense" @click="toggleMenu">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </md-toolbar>
      <md-list>
        <md-list-item to="/">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">{{ $t("router.Home") }}</span>
        </md-list-item>
        <md-list-item to="/challenges">
          <md-icon>flag</md-icon>
          <span class="md-list-item-text">{{ $t("router.Challenges") }}</span>
        </md-list-item>
        <md-list-item to="/rank">
          <md-icon>emoji_events</md-icon>
          <span class="md-list-item-text">{{ $t("router.Rank") }}</span>
        </md-list-item>

        <md-list-item to="/rules">
          <md-icon>assignment</md-icon>
          <span class="md-list-item-text">{{ $t("router.Rules") }}</span>
        </md-list-item>

        <md-list-item to="/settings">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">{{ $t("router.Settings") }}</span>
        </md-list-item>
      </md-list>
    </md-app-drawer>
    <md-app-content>
      <router-view />
    </md-app-content>
  </md-app>
</template>

<script>
import { mapState } from "vuex";

import config from "@/config.json";

export default {
  name: "App",
  data: () => ({
    menuVisible: false,
    cardVisible: false,
    authLink: config.authLink
  }),
  computed: mapState({
    theme: state => state.theme
  }),
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    toggleCard() {
      this.cardVisible = !this.cardVisible;
    }
  }
};
</script>

<style type="sass" scoped>
.container {
  width: 100%;
}
</style>
