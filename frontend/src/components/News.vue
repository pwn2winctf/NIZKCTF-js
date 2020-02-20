<template>
  <md-content>
    <md-toolbar :md-elevation="1">
      <span class="md-title">News</span>
    </md-toolbar>
    <md-content v-if="firstLoad" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else class="container md-scrollbar">
      <p v-for="(item, index) in news" v-bind:key="index">
        <span class="item-date">[{{ item.datetime }}]</span> {{ item.text }}
      </p>
    </md-content>
  </md-content>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";

import { API } from "@/services/api";
import { createPooling } from "@/utils";

export default {
  name: "News",
  data: () => ({
    news: [],
    firstLoad: true
  }),
  created() {
    this.newsPolling = createPooling(this.loadNews);
    this.newsPolling.start();
  },
  methods: {
    loadNews() {
      API.listNews().then(response => {
        this.firstLoad = false;
        const datas = response.data
          .sort((a, b) => b.time - a.time)
          .map(item => ({
            datetime: fromUnixTime(item.time).toLocaleString(),
            text: item.msg
          }));
        this.news = datas;
      });
    }
  },
  beforeDestroy: function() {
    this.newsPolling.stop();
  }
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
