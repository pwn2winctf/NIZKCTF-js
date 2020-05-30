<script>
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ["options"],
  mounted() {
    if (this.$data._chart) {
      this.$data._chart.destroy();
    }
    this.renderChart(this.chartData, this.options);
  }
};
</script>

<style></style>
