<template>
  <md-dialog :md-active="info.isOpen" @md-clicked-outside="onClose">
    <md-dialog-title>{{ info.title }}</md-dialog-title>
    <md-dialog-content v-if="loading" class="spinner">
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
      <div v-if="teamKey" class="flag-field">
        <md-field>
          <md-input
            v-model="flag"
            :placeholder="$t('submitFlagField')"
          ></md-input>
        </md-field>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button
        v-if="!loading"
        class="md-raised md-accent"
        @click="submitFlag"
        >{{ $t("submit") }}</md-button
      >
      <md-button class="md-primary" @click="onClose">{{
        $t("close")
      }}</md-button>
    </md-dialog-actions>
    <md-snackbar
      md-position="center"
      :md-duration="4000"
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

export default {
  name: "ChallengeInfoDialog",
  props: ["info", "onClose"],
  data: () => ({
    flag: "",
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
      const self = this;
      self.loading = true;
      const worker = new Worker("worker.js");

      worker.onmessage = function(ev) {
        switch (ev.data.message) {
          case "submit-flag":
            worker.postMessage({
              cmd: "start-work",
              value: {
                password: self.flag,
                salt: self.info
              }
            });
            break;

          case "worker-completed":
            worker.terminate();
            self.showMessage(ev.data.result);
            self.loading = false;
            break;

          default:
            console.log(ev.data);
        }
      };
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
      }
    }
  }
};
</script>

<style type="sass" scoped>
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
