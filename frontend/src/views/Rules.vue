<template>
  <md-content class="md-layout container md-alignment-center-center">
    <md-content v-if="loading" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else>
      <p v-html="rules"></p>
    </md-content>
  </md-content>
</template>

<script>
import { mapState } from "vuex";
import showdown from "showdown";

import { API } from "@/services/api";

export default {
  name: "Rules",
  data: () => ({
    rules: undefined,
    loading: true
  }),
  computed: mapState({
    language: state => state.language
  }),
  mounted() {
    const converter = new showdown.Converter();
    API.getRule(this.language)
      .then(data => (this.rules = converter.makeHtml(data)))
      .finally((this.loading = false));
  }
};
</script>

<style type="sass" scoped>
.container {
  height: 100%;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
