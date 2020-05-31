<template>
  <md-content>
    <md-dialog :md-active="info.isOpen" @md-clicked-outside="close">
      <md-dialog-title>{{ info.title }}</md-dialog-title>
      <md-dialog-content v-if="loading" class="spinner">
        <p v-if="sendingFlag">{{ $t("verifyingFlag") }}</p>
        <md-progress-spinner md-mode="indeterminate" />
      </md-dialog-content>
      <md-dialog-content v-else>
        <p v-html="description"></p>
        <p>ID: {{ info.id }}</p>
        <p>{{ $t("score") }}: {{ info.points }}</p>
        <p>{{ $t("solves") }}: {{ info.solves }}</p>
        <md-chip
          v-for="tag in info.tags"
          v-bind:key="tag"
          class="md-primary md-layout-item card-tag"
          >{{ tag }}</md-chip
        >
        <div v-if="teamKey && token && !info.solved" class="flag-field">
          <md-field>
            <md-input v-model="flag" :placeholder="flagFormat"></md-input>
          </md-field>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button
          v-if="!loading && teamKey && token && !info.solved"
          class="md-raised md-accent"
          @click="submitFlag"
          >{{ $t("submit") }}</md-button
        >
        <md-button class="md-primary" @click="close">
          {{ $t("close") }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-snackbar
      md-position="center"
      :md-duration="5000"
      :md-active.sync="showSnackbar"
      class="md-primary"
    >
      <span>
        {{ message }}
        <md-button
          v-if="link"
          :href="link"
          target="_blank"
          :style="{ color: this.theme === 'dark' ? '#000' : '#fff' }"
          >here</md-button
        >
      </span>
    </md-snackbar>
  </md-content>
</template>

<script>
import { mapState, mapActions } from "vuex";
import showdown from "showdown";

import { API } from "@/services/api";
import NIZKCTF from "@/services/nizkctf";
import config from "@/config.json";

export default {
  name: "ChallengeInfoDialog",
  props: ["info", "onClose"],
  data: () => ({
    flagFormat: config.flagFormat,
    flag: "",
    sendingFlag: false,
    loading: true,
    description: "",
    converter: new showdown.Converter(),
    showSnackbar: false,
    link: undefined,
    message: ""
  }),
  computed: {
    ...mapState({
      theme: state => state.theme,
      language: state => state.language,
      teamKey: state => state.team,
      token: state => state.token,
      user: state => state.user,
      repository: state => state.repository
    })
  },
  methods: {
    ...mapActions(["setToken", "setUser", "setRepository"]),
    handleNeedAuthentication() {
      this.setToken(null);
      this.setUser(null);
      this.setRepository(null);
      this.showMessage(this.$t("invalidToken"));
    },
    close() {
      if (this.$route.params.id) {
        this.$router.push("/challenges");
      }
      this.onClose();
    },
    loadDescription(challenge) {
      API.getChallengeDescription(challenge, this.language).then(({ data }) => {
        this.description = this.converter.makeHtml(data);
        this.loading = false;
      });
    },
    submitFlag() {
      this.loading = true;
      this.sendingFlag = true;
      const nizkctf = new NIZKCTF(
        this.handleNeedAuthentication,
        this.token,
        this.repository,
        config.submissionsRepo,
        config.repohost,
        this.teamKey
      );
      nizkctf
        .submitFlag(this.flag, this.info)
        .then(data => {
          this.showMessage(this.$t("flagFound"), data.url);
        })
        .catch(err => {
          this.showMessage(err, null);
          console.error(err);
        })
        .finally(() => {
          this.loading = false;
          this.sendingFlag = false;
        });
    },
    showMessage(message, link = null) {
      this.message = message;
      this.link = link;
      this.showSnackbar = true;
    }
  },
  mounted() {
    if (this.info.id) {
      this.loadDescription(this.info.id);
    }
  },
  watch: {
    info: function(info) {
      if (info.isOpen) {
        this.loadDescription(this.info.id);
      } else {
        this.flag = "";
        this.showSnackbar = false;
      }
    }
  }
};
</script>

<style type="sass" scoped>
.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
