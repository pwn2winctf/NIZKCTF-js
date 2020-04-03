<template>
  <md-dialog :md-active="info.isOpen" @md-clicked-outside="onClose">
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
      <div v-if="teamKey && !info.solved" class="flag-field">
        <md-field>
          <md-input v-model="flag" :placeholder="flagFormat"></md-input>
        </md-field>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button
        v-if="!loading && teamKey && !info.solved"
        class="md-raised md-accent"
        @click="submitFlag"
        >{{ $t("submit") }}</md-button
      >
      <md-button class="md-primary" @click="onClose">
        {{ $t("close") }}
      </md-button>
    </md-dialog-actions>
    <md-snackbar
      md-position="center"
      :md-duration="5000"
      :md-active.sync="showSnackbar"
    >
      <span>{{ message }}</span>
    </md-snackbar>
  </md-dialog>
</template>

<script>
import { mapState } from "vuex";
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
    message: ""
  }),
  computed: mapState({
    language: state => state.language,
    teamKey: state => state.team,
    token: state => state.token,
    user: state => state.user,
    repository: state => state.repository
  }),
  methods: {
    loadDescription(challenge) {
      API.getChallengeDescription(challenge, this.language).then(({ data }) => {
        this.description = this.converter.makeHtml(data);
        this.loading = false;
      });
    },
    submitFlag() {
      const local = { owner: this.user.login, repository: this.repository };
      const upstream = {
        owner: config.owner,
        repository: config.submissionsRepo
      };
      this.loading = true;
      this.sendingFlag = true;
      const nizkctf = new NIZKCTF(this.token, local, upstream, this.teamKey);
      nizkctf
        .submitFlag(this.flag, this.info)
        .then(() => this.showMessage(this.$t("flagFound")))
        .catch(err => this.showMessage(err))
        .finally(() => {
          this.loading = false;
          this.sendingFlag = false;
        });
    },
    showMessage(message) {
      this.message = message;
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
