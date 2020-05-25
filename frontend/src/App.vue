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
      <md-dialog :md-active.sync="alertClosedPullRequests.visible">
        <md-dialog-title>{{ $t("warning") }}</md-dialog-title>
        <md-dialog-content>
          <p>{{ alertClosedPullRequests.content }}</p>
          <ul>
            <li
              v-for="item in alertClosedPullRequests.challenges"
              :key="item.id"
            >
              <a target="_blank" rel="noopener noreferrer" :href="item.url">
                {{ item.id }}
              </a>
            </li>
          </ul>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button
            class="md-primary"
            @click="alertClosedPullRequests.visible = false"
            >{{ $t("close") }}</md-button
          >
        </md-dialog-actions>
      </md-dialog>
      <router-view />
    </md-app-content>
  </md-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { createPolling } from "@/utils";
import { GitHub, GitLab } from "@/services/nizkctf";
import * as Sentry from "@sentry/browser";
import { API } from "@/services/api";

import config from "@/config.json";

export default {
  name: "App",
  data: () => ({
    owner: config.owner,
    submissionsRepo: config.submissionsRepo,
    poolingPullRequests: undefined,
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
    teamName: state => state.team && state.team.name,
    pendingPullRequests: state => state.pendingPullRequests
  }),
  methods: {
    ...mapActions([
      "setUser",
      "setToken",
      "setRepository",
      "setPendingPullRequests",
      "setSolvedChallengesFromPolling",
      "removePullRequestFromPending",
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
    setListOfPendingPullRequests(repohost) {
      repohost
        .listPullRequests(config.submissionsRepo, this.user.username, "opened")
        .then(data => {
          const list = data.map(item => item.number);
          list.length > 0 && this.setPendingPullRequests(list);
        });
    },
    updateListOfPendingPullRequests(repohost) {
      this.checkPullRequestsState(repohost, this.pendingPullRequests)
        .then(list => {
          this.toastMergeds.content = null;
          this.toastMergeds.challenges = [];
          this.alertClosedPullRequests.challenges = [];
          list.forEach(item => {
            const challenge = item.title.replace("Proof: found flag for", "");
            if (item.state === "merged") {
              this.toastMergeds.challenges.push(challenge);
              this.removePullRequestFromPending(item.number);
            } else if (item.state === "closed") {
              this.alertClosedPullRequests.challenges.push({
                id: challenge,
                number: item.number,
                url: item.url
              });
              this.removePullRequestFromPending(item.number);
            }
          });
        })
        .finally(() => {
          if (this.toastMergeds.challenges.length > 0) {
            this.toastMergeds.content = this.$t("acceptedChallenges", {
              challenges: this.toastMergeds.challenges
            });
            this.toastMergeds.visible = true;
          }

          if (this.alertClosedPullRequests.challenges.length > 0) {
            this.alertClosedPullRequests.content = this.$t(
              "notAcceptedChallenges"
            );
            this.alertClosedPullRequests.visible = true;
          }
        });
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
    createPullRequestsPooling() {
      if (config.repohost === "github") {
        const github = new GitHub(this.token);
        const callback = () =>
          this.pendingPullRequests.length > 0
            ? this.updateListOfPendingPullRequests(github)
            : this.setListOfPendingPullRequests(github);

        this.poolingPullRequests = createPolling(callback, 15000); // 15s
      } else if (config.repohost === "gitlab") {
        const gitlab = new GitLab(this.token);
        const callback = () =>
          this.pendingPullRequests.length > 0
            ? this.updateListOfPendingPullRequests(gitlab)
            : this.setListOfPendingPullRequests(gitlab);

        this.poolingPullRequests = createPolling(callback, 15000); // 15s
      } else {
        throw new TypeError(`Invalid repohost: ${config.repohost}`);
      }
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
    if (this.user && this.user.username) {
      this.createPullRequestsPooling();
      this.poolingPullRequests.start();
    }
  },
  beforeDestroy() {
    if (this.poolingPullRequests) {
      this.poolingPullRequests.stop();
    }
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

      if (
        value &&
        (!this.poolingPullRequests || !this.poolingPullRequests.running)
      ) {
        this.createPullRequestsPooling();
        this.poolingPullRequests.start();
      } else {
        if (this.poolingPullRequests.running) {
          this.poolingPullRequests.stop();
        }
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
