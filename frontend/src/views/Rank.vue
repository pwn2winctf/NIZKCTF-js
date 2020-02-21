<template>
  <md-content>
    <md-content v-if="firstLoad" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else>
      <div class="small">
        <LineChart
          :data="this.data"
          :options="{
            scales: {
              xAxes: [
                {
                  type: 'time',
                  distribution: 'series',
                  time: {
                    unit: 'milliseconds',
                    displayFormats: {
                      milliseconds: 'MMM	D H:mm'
                    }
                  },
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                  }
                }
              ]
            },
            title: {
              display: true,
              text: 'General'
            },
            responsive: true,
            animation: false,
            maintainAspectRatio: true
          }"
        />
      </div>
    </md-content>
  </md-content>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";

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
    data: {
      labels: [],
      datasets: []
    }
  }),
  created() {
    this.rankPolling = createPolling(this.loadSolvedChallenges);
    this.rankPolling.start();
  },
  methods: {
    calculateScore(data) {
      const standings = data.standings;
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
    loadSolvedChallenges() {
      API.listSolvedChallenges().then(response => {
        const data = response.data;
        if (!data.standings || data.standings.length === 0) {
          this.firstLoad = false;
          return;
        }

        this.calculateScore(data);

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
  max-width: 500px;
  max-height: 250px;
}
</style>
