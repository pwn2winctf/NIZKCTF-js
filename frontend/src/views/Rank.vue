<template>
  <md-content>
    <md-content v-if="firstLoad" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else>
      <team-info :info="popup" :on-close="closePopup" />
      <div class="small">
        <LineChart
          :chart-data="this.data"
          :options="chartOptions"
          :height="300"
        />
      </div>
      <md-table v-model="teams" md-sort="pos" md-sort-order="asc">
        <md-table-row
          slot="md-table-row"
          slot-scope="{ item }"
          @click="openPopup(item)"
        >
          <md-table-cell md-label="POS" md-sort-by="pos" md-numeric>{{
            item.pos
          }}</md-table-cell>
          <md-table-cell :md-label="$t('team')" md-sort-by="team">{{
            item.name
          }}</md-table-cell>
          <md-table-cell :md-label="$t('country')">
            <country-flag
              class="flags"
              v-for="(flag, index) in item.countries"
              v-bind:key="index"
              :country="flag"
              size="normal"
            />
          </md-table-cell>
          <md-table-cell :md-label="$t('score')" md-sort-by="score">{{
            item.score
          }}</md-table-cell>
        </md-table-row>
      </md-table>
    </md-content>
  </md-content>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";
import CountryFlag from "vue-country-flag";
import { mapState } from "vuex";

import { API } from "@/services/api";
import { createPolling, computeScore, colors } from "@/utils";

import LineChart from "@/components/LineChart.vue";
import TeamInfo from "@/components/TeamInfo.vue";

const topN = 10;

export default {
  name: "Rank",
  components: { LineChart, CountryFlag, TeamInfo },
  data: () => ({
    popup: {
      isOpen: false
    },
    firstLoad: true,
    timeAxis: [],
    scoreAxis: {},
    topStandings: [],
    teams: [],
    data: {
      labels: [],
      datasets: []
    }
  }),
  computed: {
    ...mapState({
      theme: state => state.theme,
      solvedChallenges: state => state.solvedChallenges
    }),
    chartOptions: function() {
      return {
        maintainAspectRatio: false,
        animation: false,
        responsive: true,
        legend: {
          labels: {
            fontColor: this.theme === "dark" ? "#fff" : "#666"
          }
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                color:
                  this.theme === "dark"
                    ? "rgba(255, 255, 255,0.5)"
                    : "rgba(0, 0, 0, 0.1)"
              },
              ticks: {
                fontColor: this.theme === "dark" ? "#fff" : "#666"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                color:
                  this.theme === "dark"
                    ? "rgba(255, 255, 255,0.5)"
                    : "rgba(0, 0, 0, 0.1)"
              },
              type: "time",
              distribution: "series",
              time: {
                unit: "milliseconds",
                displayFormats: {
                  milliseconds: "MMM	D H:mm"
                }
              },
              ticks: {
                fontColor: this.theme === "dark" ? "#fff" : "#666",
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          ]
        },
        title: {
          display: true,
          fontColor: this.theme === "dark" ? "#fff" : "#666",
          text: this.$t("general")
        }
      };
    }
  },
  created() {
    this.rankPolling = createPolling(() => this.loadTeamsInfo(), 30 * 60000); // 30 min
    this.rankPolling.start();
  },
  methods: {
    openPopup(item) {
      this.popup.pos = item.pos;
      this.popup.name = item.name;
      this.popup.crypt_pk = item.crypt_pk;
      this.popup.sign_pk = item.sign_pk;
      this.popup.members = item.members;
      this.popup.score = item.score;
      this.popup.solvedChallenges = item.solvedChallenges;
      this.popup.isOpen = true;
    },
    closePopup() {
      this.popup.isOpen = false;
    },
    calculateScore() {
      const standings = JSON.parse(JSON.stringify(this.solvedChallenges));
      standings.sort((a, b) => a.pos - b.pos);

      const allSolves = standings.reduce(
        (list, standing) =>
          list.concat(
            Object.entries(standing.taskStats).map(task => ({
              id: task[0],
              time: task[1].time
            }))
          ),
        []
      );
      allSolves.sort((a, b) => a.time - b.time);

      const topStandings = standings.slice(0, topN);

      const topSolves = topStandings.reduce((obj, item) => {
        const data = Object.entries(item.taskStats).map(task => ({
          id: task[0],
          time: task[1].time
        }));

        data.sort((a, b) => a.time - b.time);
        obj[item.team] = data;
        return obj;
      }, {});

      const challSolves = {};
      const timeAxis = [];
      const scoreAxis = {};

      allSolves.forEach(({ time, id }) => {
        timeAxis.push(fromUnixTime(time));
        challSolves[id] = (challSolves[id] || 0) + 1;

        Object.entries(topSolves).forEach(item => {
          const team = item[0];
          const challs = item[1];
          let score = 0;

          for (const chall of challs) {
            if (chall.time > time) {
              break;
            }
            score += computeScore(challSolves[chall.id]);
          }

          scoreAxis[team] = [...(scoreAxis[team] || []), score];
        });
      });

      this.scoreAxis = scoreAxis;
      this.topStandings = topStandings;
      this.timeAxis = timeAxis;
    },

    async mergeTeamInfo() {
      const teams = this.solvedChallenges.map(
        ({ team, score, pos, taskStats }) => {
          const teamData = this.teams.find(item => item.name === team);
          return {
            ...teamData,
            pos,
            score,
            solvedChallenges: Object.entries(taskStats).map(item => ({
              name: item[0],
              ...item[1]
            }))
          };
        }
      );

      this.teams = teams;
    },
    async loadTeamsInfo() {
      this.calculateScore();

      const teams = await Promise.all(
        this.solvedChallenges.map(async ({ team, score, pos, taskStats }) => {
          const teamResponse = await API.getTeam(team);
          const teamMembersResponse = await API.getTeamMembers(team);
          return {
            pos,
            score,
            ...teamResponse.data,
            members: teamMembersResponse.data,
            solvedChallenges: Object.entries(taskStats).map(item => ({
              name: item[0],
              ...item[1]
            }))
          };
        })
      );
      this.teams = teams;

      const defaultOptions = {
        fill: false,
        lineTension: 0,
        pointRadius: 0,
        borderWidth: 2
      };

      const datasets = this.topStandings.map((item, index) => ({
        label: item.team,
        borderColor: colors[index],
        ...defaultOptions,
        data: this.scoreAxis[item.team]
      }));

      this.data = { labels: this.timeAxis, datasets };
      this.firstLoad = false;
    }
  },
  beforeDestroy() {
    this.rankPolling.stop();
  },
  watch: {
    solvedChallenges() {
      this.calculateScore();
      this.mergeTeamInfo();
    }
  }
};
</script>

<style type="sass" scoped>
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.small {
  align-items: center;
}
.flags {
  display: inline-block;
}
.md-content {
  flex: 1;
  height: 100%;
}
.md-table-row {
  cursor: pointer;
}
</style>
