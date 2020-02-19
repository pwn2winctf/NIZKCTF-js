<template>
  <md-content>
    <md-toolbar :md-elevation="1">
      <span class="md-title">News</span>
    </md-toolbar>
    <md-content v-if="loading" class="spinner">
      <md-progress-spinner
        v-if="loading"
        md-mode="indeterminate"
      ></md-progress-spinner>
    </md-content>
    <md-content v-if="!loading" class="container md-scrollbar">
      <p v-for="(item, index) in news" v-bind:key="index">
        <span class="item-date">[{{ item.datetime }}]</span> {{ item.text }}
      </p>
    </md-content>
  </md-content>
</template>

<script>
import { API } from "@/services/api";
import fromUnixTime from "date-fns/fromUnixTime";

export default {
  name: "News",
  data: () => ({
    news: [],
    loading: true
  }),
  created() {
    API.listNews()
      .then(response => {
        const datas = response.data
          .sort((a, b) => b.time - a.time)
          .map(item => ({
            datetime: fromUnixTime(item.time).toLocaleString(),
            text: item.msg
          }));
        this.news = datas;
      })
      .finally(() => (this.loading = false));
  },
  methods: {},
  mounted: () => {},
  beforeDestroy: () => {}
};
</script>

<style type="sass" scoped>
.container {
  overflow: scroll;
  height: 70vh;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 16px;
}
.md-list-item-text p {
  white-space: normal;
}
.item-date {
  font-weight: bold;
}
</style>
