<template>
  <md-content class="md-layout md-gutter">
    <News class="md-layout-item md-xsmall-size-100 md-size-50 " />
    <SolvedChallenges class="md-layout-item md-xsmall-size-100 md-size-50 " />
  </md-content>
</template>

<script>
import News from "@/components/News.vue";
import SolvedChallenges from "@/components/SolvedChallenges.vue";

export default {
  name: "Home",
  components: { News, SolvedChallenges }
};
</script>
