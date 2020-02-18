<template>
  <md-content class="md-scrollbar">
    <md-toolbar :md-elevation="1">
      <span class="md-title">Solves</span>
    </md-toolbar>
    <md-content v-if="loading" class="spinner">
      <md-progress-spinner
        v-if="loading"
        md-mode="indeterminate"
      ></md-progress-spinner>
    </md-content>
    <md-list v-if="!loading">
      <md-list-item
        v-for="(item, index) in challenges"
        v-bind:key="index"
        class="md-list-item-text"
      >
        <p>
          <span class="item-date"
            >[{{ item.datetime.toLocaleString() }}] {{ item.team }}</span
          >
          solved {{ item.challenge }}
        </p>
      </md-list-item>
    </md-list>
  </md-content>
</template>

<script>
import { API } from "@/services/api";
import fromUnixTime from "date-fns/fromUnixTime";

export default {
  name: "SolvedChallenges",
  data: () => ({
    challenges: [],
    loading: true
  }),
  mounted() {
    API.listSolvedChallenges()
      .then(response => {
        const datas = response.data.standings
          .reduce((reducer, { taskStats, team }) => {
            Object.keys(taskStats).forEach(challenge => {
              reducer.push({
                team,
                challenge,
                datetime: fromUnixTime(taskStats[challenge].time)
              });
            });
            return reducer;
          }, [])
          .sort((a, b) => b.datetime - a.datetime);
        this.challenges = datas;
      })
      .finally(() => (this.loading = false));
  },
  methods: {},
  beforeDestroy: () => {}
};
</script>

<style type="sass" scoped>
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
