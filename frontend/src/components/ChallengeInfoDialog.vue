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
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="onClose">
        {{ $t("close") }}
      </md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { mapState } from "vuex";
import showdown from "showdown";
// import fromUnixTime from "date-fns/fromUnixTime";
// import format from "date-fns/format";
import { API } from "@/services/api";

export default {
  name: "ChallengeInfoDialog",
  props: ["info", "onClose"],
  data: () => ({
    loading: true,
    description: "",
    converter: new showdown.Converter()
  }),
  computed: mapState({
    language: state => state.language
  }),
  methods: {
    loadDescription(challenge) {
      API.getChallengeDescription(challenge, this.language).then(({ data }) => {
        this.description = this.converter.makeHtml(data);
        this.loading = false;
      });
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
