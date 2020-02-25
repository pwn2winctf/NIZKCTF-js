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
    <md-content class="grid-cards">
      <md-card
        v-for="challenge in selectedChallenges"
        v-bind:key="challenge.id"
        class="md-accent"
        md-with-hover
      >
        <md-ripple class="card">
          <md-card-content>
            <div class="md-title">{{ challenge.title }}</div>
            <div>{{ $t("solves") }}: {{ challenge.solves }}</div>
            <div>{{ $t("score") }}: {{ challenge.points }}</div>
          </md-card-content>
          <md-card-actions>
            <md-chip
              v-for="tag in challenge.tags"
              v-bind:key="tag"
              class="md-primary md-layout-item card-tag"
              >{{ tag }}</md-chip
            >
          </md-card-actions>
        </md-ripple>
      </md-card>
    </md-content>
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
              points: computeScore(solves[item.id] || 0)
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
.grid-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(auto, 1fr));
  grid-template-rows: auto;
  grid-gap: 12px;
}

@media (max-width: 740px) {
  .grid-cards {
    grid-template-columns: 1fr;
  }
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  top: 0;

  display: flex;

  flex: 1;
  justify-content: space-between;
}

.md-card-actions {
  display: inline;
}

.card-tag {
  margin-bottom: 2px;
}
</style>
