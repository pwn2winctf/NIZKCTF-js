<template>
  <md-content>
    <md-content class="chips-container">
      <md-chip
        v-for="item in categories"
        :key="item"
        :class="item === selectedCategory ? 'md-primary' : 'md-accent'"
        md-clickable
        @click="filterChallenges(item)"
        >{{ item }}</md-chip
      >
    </md-content>
    <div class="cards-container">
      <md-card
        v-for="challenge in selectedChallenges"
        v-bind:key="challenge.id"
        class="md-accent"
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
          <md-chip
            v-for="tag in challenge.tags"
            v-bind:key="tag"
            class="md-primary"
          >
            {{ tag }}
          </md-chip>
        </md-card-actions>
      </md-card>
    </div>
  </md-content>
</template>

<script>
import { API } from "@/services/api";
import { computeScore } from "@/utils";

export default {
  name: "Challenges",
  data: () => ({
    challenges: [],
    selectedChallenges: [],
    categories: [],
    selectedCategory: undefined
  }),
  created() {
    API.getChallenges()
      .then(response => {
        const challenges = response.data;
        return Promise.all(challenges.map(item => API.getChallenge(item)));
      })
      .then(list => {
        const datas = list.map(({ data }) => data);
        const categories = datas.reduce((list, item) => {
          item.tags.forEach(tag => {
            const category = list.find(item => item === tag);

            !category && list.push(tag);
          });
          return list;
        }, []);

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
            this.selectedChallenges = this.challenges;
          })
          .catch(err => console.error(err));
      });
  },
  methods: {
    filterChallenges(category) {
      if (this.selectedCategory == category) {
        this.selectedCategory = this.undefined;
        this.selectedChallenges = this.challenges;
        return;
      }

      this.selectedCategory = category;
      this.selectedChallenges = this.challenges.filter(item =>
        item.tags.includes(category)
      );
    }
  }
};
</script>

<style type="sass" scoped>
.chips-container {
  align-items: center;
  padding-bottom: 16px;
  padding-right: 16px;
  padding-left: 16px;
}
.cards-container {
  display: inline-grid;
  grid-row-gap: 32px;
  grid-template-columns: auto auto auto;
  padding-bottom: 16px;
}
</style>
