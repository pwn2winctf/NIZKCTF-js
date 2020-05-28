<template>
  <md-app md-mode="fixed" class="container" :md-theme="this.theme">
    <md-app-toolbar class="md-primary" md-elevation="0">
      <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">{{ $t(`router.${this.$route.name}`) }}</span>
      <div class="md-toolbar-section-end">
        <div class="teamName" v-if="this.user">{{ teamName }}</div>
        <md-menu
          md-size="big"
          md-direction="top-start"
          :md-active.sync="cardVisible"
        >
          <md-button class="md-icon-button" md-menu-trigger>
            <md-avatar v-if="this.user" class="md-avatar-icon">
              <img :src="this.user.avatar_url" alt="Avatar" />
            </md-avatar>
            <md-icon v-else>person</md-icon>
          </md-button>
          <md-menu-content v-if="this.token">
            <md-list>
              <md-list-item @click="logout">{{ $t("logout") }}</md-list-item>
            </md-list>
          </md-menu-content>
          <md-menu-content v-else>
            <md-list>
              <md-list-item :href="authLink">{{ $t("login") }}</md-list-item>
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
        <md-list-item to="/" exact>
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

        <md-list-item to="/faq">
          <md-icon>help</md-icon>
          <span class="md-list-item-text">{{ $t("router.Faq") }}</span>
        </md-list-item>
      </md-list>
    </md-app-drawer>
    <md-app-content>
      <md-dialog-alert
        :md-active.sync="popupLogoutVisible"
        :md-title="$t('warning')"
        :md-content="$t('warningLogout')"
      />
      <md-snackbar
        md-position="center"
        :md-duration="10000"
        :md-active.sync="toastMergeds.visible"
        md-persistent
      >
        <span>{{ toastMergeds.content }}</span>
      </md-snackbar>
      <router-view />
    </md-app-content>
  </md-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { createPolling } from "@/utils";
import * as Sentry from "@sentry/browser";
import { API } from "@/services/api";

import config from "@/config.json";

export default {
  name: "App",
  data: () => ({
    owner: config.owner,
    submissionsRepo: config.submissionsRepo,
    poolingAcceptedSubmissions: undefined,
    popupLogoutVisible: false,
    menuVisible: false,
    cardVisible: false,
    authLink: config.authLink,
    toastMergeds: {
      visible: false,
      content: null,
      challenges: ""
    },
    alertClosedPullRequests: {
      visible: false,
      content: null,
      challenges: []
    }
  }),
  computed: mapState({
    theme: state => state.theme,
    user: state => state.user,
    token: state => state.token,
    teamName: state => state.team && state.team.name
  }),
  methods: {
    ...mapActions([
      "setUser",
      "setToken",
      "setRepository",
      "setSolvedChallengesFromPolling",
      "startFirebaseConnection"
    ]),
    async checkPullRequestsState(repohost, list) {
      const states = await Promise.all(
        list.map(item =>
          repohost
            .checkState(config.submissionsRepo, item)
            .then(({ state, title, url }) => ({
              number: item,
              state,
              title,
              url
            }))
        )
      );
      return states;
    },
    createPollingAcceptedSubmissions() {
      const callback = () => {
        API.listSolvedChallenges()
          .then(({ data }) => {
            this.setSolvedChallengesFromPolling(data.standings);
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              this.setSolvedChallengesFromPolling([]);
            } else {
              console.error(err);
            }
          });
      };
      this.poolingAcceptedSubmissions = createPolling(callback);
    },
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    toggleCard() {
      this.cardVisible = !this.cardVisible;
    },
    logout() {
      this.popupLogoutVisible = !!this.teamName;
      this.setUser(null);
      this.setToken(null);
      this.setRepository(null);
    }
  },
  mounted() {
    this.startFirebaseConnection();
    this.createPollingAcceptedSubmissions();
    this.poolingAcceptedSubmissions.start();
  },
  beforeDestroy() {
    if (this.poolingAcceptedSubmissions) {
      this.poolingAcceptedSubmissions.stop();
    }
  },
  watch: {
    countryFilter(value) {
      this.filteredCountries = this.countries.filter(
        item => item.name.toUpperCase().indexOf(value.toUpperCase()) > -1
      );
    },
    user(value) {
      if (value) {
        Sentry.configureScope(scope => {
          scope.setUser({
            id: value.username,
            username: value.name
          });
        });
      }
    }
  }
};
</script>

<style type="sass" scoped>
.container {
  width: 100%;
}

.teamName {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
