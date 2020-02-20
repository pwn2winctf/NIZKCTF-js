<template>
  <md-content>
    <md-toolbar md-elevation="1">
      <span class="md-title">News</span>
    </md-toolbar>
    <md-content v-if="firstLoad" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else class="container md-scrollbar">
      <transition-group name="list">
        <p v-for="item in news" v-bind:key="item.datetime">
          <span class="item-date">[{{ item.date }}]</span>
          {{ item.text }}
        </p>
      </transition-group>
    </md-content>
  </md-content>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";

import { API } from "@/services/api";
import { createPolling } from "@/utils";

export default {
  name: "News",
  data: () => ({
    news: [],
    firstLoad: true
  }),
  created() {
    this.newsPolling = createPolling(this.loadNews);
    this.newsPolling.start();
  },
  methods: {
    loadNews() {
      API.listNews().then(response => {
        const datas = response.data
          .sort((a, b) => b.time - a.time)
          .map(item => ({
            datetime: item.time,
            date: fromUnixTime(item.time).toLocaleString(),
            text: item.msg
          }));

        this.news = datas;
        this.firstLoad = false;
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

.list-enter-active,
.list-leave-active {
  transition: all 2s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  background-color: yellow;
  transform: translateY(30px);
}
</style>
