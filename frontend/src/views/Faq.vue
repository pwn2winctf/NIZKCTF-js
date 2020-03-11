<template>
  <md-dialog-content v-if="loading" class="spinner">
    <md-progress-spinner md-mode="indeterminate" />
  </md-dialog-content>
  <p v-else v-html="content"></p>
</template>

<script>
import showdown from "showdown";

import { API } from "@/services/api";

export default {
  name: "Faq",
  data: () => ({
    content: "",
    loading: true
  }),
  created() {
    API.getFaq()
      .then(content => {
        const converter = new showdown.Converter();
        this.content = converter.makeHtml(content);
      })
      .catch(err => console.error(err))
      .finally(() => (this.loading = false));
  }
};
</script>
