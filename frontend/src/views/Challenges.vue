<template>
  <md-content class="container">
    <md-card
      v-for="challenge in challenges"
      v-bind:key="challenge.id"
      class="md-primary"
    >
      <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ challenge.title }}</div>
          <div class="md-subhead">
            {{ $t("solves") }}: {{ challenge.solves }}
          </div>
          <div class="md-subhead">
            {{ $t("score") }}: {{ challenge.points }}
          </div>
        </md-card-header-text>
      </md-card-header>

      <md-card-actions>
        <md-chip v-for="tag in challenge.tags" v-bind:key="tag">{{
          tag
        }}</md-chip>
      </md-card-actions>
    </md-card>
  </md-content>
</template>

<script>
import { API } from "@/services/api";
import { computeScore } from "@/utils";

export default {
  name: "Challenges",
  data: () => ({
    challenges: [],
    categories: []
  }),
  created() {
    API.getChallenges()
      .then(response => {
        const challenges = response.data;
        return Promise.all(challenges.map(item => API.getChallenge(item)));
      })
      .then(list => {
        const datas = list.map(({ data }) => data);
        const categories = datas.reduce((obj, item) => {
          item.tags.forEach(tag => {
            obj[tag] ? obj[tag].push(item.id) : (obj[tag] = [item.id]);
          });
          return obj;
        }, {});

        this.categories = categories;

        API.listSolvedChallenges()
          .then(({ data }) => {
            const solves = data.standings.reduce((reducer, { taskStats }) => {
              Object.keys(taskStats).forEach(chall => {
                reducer[chall]++ || (reducer[chall] = 1);
              });
              return reducer;
            }, {});
            const challenges = datas.map(item => ({
              ...item,
              solves: solves[item.id] || 0,
              points: computeScore(solves[item.id])
            }));
            this.challenges = challenges;
          })
          .catch(err => console.error(err));
      });
  }
};
</script>

<style type="sass" scoped>
.container {
  display: inline-grid;
  grid-row-gap: 32px;
  grid-template-columns: auto auto auto;
  padding-bottom: 16px;
}
</style>
