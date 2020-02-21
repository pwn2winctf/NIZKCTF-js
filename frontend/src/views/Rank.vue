<template>
  <md-content>
    <md-content v-if="firstLoad" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else>
      <div class="small">
        <LineChart :data="this.data" :options="chartOptions" :height="300" />
      </div>
      <md-table v-model="standings" md-sort="pos" md-sort-order="asc">
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="POS" md-sort-by="pos" md-numeric>{{
            item.pos
          }}</md-table-cell>
          <md-table-cell md-label="Team" md-sort-by="team">{{
            item.team
          }}</md-table-cell>
          <md-table-cell md-label="Country">
            <img
              v-if="countries[item.team]"
              v-bind:src="countries[item.team]"
              class="small-flag"
            />
          </md-table-cell>
          <md-table-cell md-label="Score" md-sort-by="score">{{
            item.score
          }}</md-table-cell>
        </md-table-row>
      </md-table>
    </md-content>
  </md-content>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";
import { mapState } from "vuex";

import { API } from "@/services/api";
import { createPolling, computeScore, colors } from "@/utils";

import LineChart from "@/components/LineChart.vue";

const topN = 10;

export default {
  name: "Rank",
  components: { LineChart },
  data: () => ({
    firstLoad: true,
    timeAxis: [],
    scoreAxis: {},
    topStandings: [],
    standings: [],
    countries: {},
    data: {
      labels: [],
      datasets: []
    }
  }),
  computed: {
    ...mapState({
      theme: state => state.theme
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
          text: "General"
        }
      };
    }
  },
  created() {
    this.rankPolling = createPolling(this.loadSolvedChallenges);
    this.rankPolling.start();
  },
  methods: {
    calculateScore(data) {
      const standings = data.standings;
      standings.sort((a, b) => a.pos - b.pos);

      this.standings = standings;

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
    loadSolvedChallenges() {
      API.listSolvedChallenges().then(response => {
        const data = response.data;
        if (!data.standings || data.standings.length === 0) {
          this.firstLoad = false;
          return;
        }

        this.calculateScore(data);
        Promise.all(this.standings.map(({ team }) => API.getTeam(team))).then(
          requests => {
            this.countries = requests
              .map(({ data }) => ({
                name: data.name,
                countries: data.countries
              }))
              .filter(({ countries }) => countries.length > 0)
              .map(({ name, countries }) => ({
                name,
                country: `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.8.0/flags/4x3/${countries[0]}.svg`
              }))
              .reduce((obj, { name, country }) => {
                obj[name] = country;
                return obj;
              }, []);
          }
        );

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

        this.data.labels = this.timeAxis;

        this.data.datasets = datasets;

        this.firstLoad = false;
      });
    }
  },
  beforeDestroy() {
    this.rankPolling.stop();
  }
};
</script>

<style type="sass" scoped>
.small {
  align-items: center;
}
.small-flag {
  width: 32px;
  height: 32px;
}
</style>
