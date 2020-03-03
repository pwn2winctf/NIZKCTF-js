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
      <md-button class="md-raised md-accent" @click="submitFlag">
        {{ $t("submit") }}
      </md-button>
      <md-button class="md-primary" @click="onClose">{{
        $t("close")
      }}</md-button>
    </md-dialog-actions>
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
    flag: "",
    loading: true,
    description: "",
    converter: new showdown.Converter()
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

      const nizkctf = new NIZKCTF(this.token, local, upstream, this.teamKey);
      nizkctf.submitFlag(this.flag, this.info);
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
