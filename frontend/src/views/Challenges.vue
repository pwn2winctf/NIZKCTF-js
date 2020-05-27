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
    <md-content v-if="!isLoadedChallenges" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else class="grid-cards">
      <md-card
        v-for="challenge in filteredChallenges"
        v-bind:key="challenge.id"
        :class="challenge.solved ? 'solved-challenge' : 'md-accent'"
        md-with-hover
      >
        <div @click="selectChallenge(challenge)" style="height:100%">
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
        </div>
      </md-card>
    </md-content>
    <challenge-info-dialog :info="{ ...popup }" :on-close="closePopup" />
  </md-content>
</template>

<script>
import { mapState } from "vuex";

import { API } from "@/services/api";
import { computeScore, createPolling } from "@/utils";

import ChallengeInfoDialog from "@/components/ChallengeInfoDialog.vue";

export default {
  name: "Challenges",
  components: { ChallengeInfoDialog },
  data: () => ({
    isLoadedChallenges: false,
    challenges: [],
    popup: {
      isOpen: false
    },
    filteredChallenges: [],
    categories: [],
    selectedCategory: undefined,
    challengesPolling: undefined
  }),
  computed: {
    ...mapState({
      teamKey: state => state.team,
      solvedChallenges: state => state.solvedChallenges
    })
  },
  created() {
    this.challengesPolling = createPolling(this.loadChallenges);
    this.challengesPolling.start();
  },
  methods: {
    fillList() {
      const solves = this.solvedChallenges.reduce((reducer, { taskStats }) => {
        Object.keys(taskStats).forEach(chall => {
          reducer[chall]++ || (reducer[chall] = 1);
        });
        return reducer;
      }, {});

      const solved =
        this.teamKey &&
        this.solvedChallenges.some(item => item.team === this.teamKey.name)
          ? this.solvedChallenges.find(item => item.team === this.teamKey.name)
              .taskStats
          : [];

      const challenges = this.challenges.map(item => ({
        ...item,
        solved: !!solved[item.id],
        solves: solves[item.id] || 0,
        points: computeScore((solves[item.id] || 0) + 1)
      }));
      challenges.sort((a, b) => a.title.localeCompare(b.title));
      this.challenges = challenges;
      this.filteredChallenges = this.challenges;

      if (this.$route.params.id && this.isLoadedChallenges) {
        const challenge = this.challenges.find(
          ({ id }) => id === this.$route.params.id
        );
        if (challenge) {
          this.selectChallenge(challenge);
        } else {
          this.$router.push({
            name: "Challenges"
          });
        }
      }

      this.filteredChallenges = this.challenges;
    },
    loadChallenges() {
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

          this.challenges = datas;
          this.categories = categories;
          this.isLoadedChallenges = true;
          this.fillList();
        })
        .catch(err => console.error(err));
    },
    filterChallenges(category) {
      if (this.selectedCategory == category) {
        this.selectedCategory = this.undefined;
        this.filteredChallenges = this.challenges;
        return;
      }

      this.selectedCategory = category;
      this.filteredChallenges = this.challenges.filter(item =>
        item.tags.includes(category)
      );
    },
    selectChallenge(challenge) {
      if (!this.$route.params.id) {
        this.$router.push({
          name: "ChallengesInfo",
          params: { id: challenge.id }
        });
      }
      this.popup.id = challenge.id;
      this.popup.title = challenge.title;
      this.popup.tags = challenge.tags;
      this.popup.solves = challenge.solves;
      this.popup.points = challenge.points;
      this.popup.solved = challenge.solved;
      this.popup.pk = challenge.pk;
      this.popup.salt = challenge.salt;
      this.popup.memlimit = challenge.memlimit;
      this.popup.opslimit = challenge.opslimit;
      this.popup.isOpen = true;
    },
    closePopup() {
      this.popup.isOpen = false;
    }
  },
  beforeDestroy() {
    this.challengesPolling.stop();
  },
  watch: {
    solvedChallenges() {
      this.fillList();
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

.solved-challenge {
  background-color: #77dd77 !important;
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
