<template>
  <md-content>
    <md-toolbar md-elevation="1">
      <span class="md-title">{{ $t("solves") }}</span>
    </md-toolbar>
    <md-content v-if="solvedChallenges.length == 0" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else class="container md-scrollbar">
      <transition-group name="list">
        <p v-for="item in solvedChallenges" v-bind:key="item.datetime">
          <span class="item-date">[{{ item.date }}] {{ item.team }}</span>
          solved {{ item.challenge }}
        </p>
      </transition-group>
    </md-content>
  </md-content>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SolvedChallenges",
  computed: mapState(["solvedChallenges"])
};
</script>

<style lang="css" scoped>
.container {
  padding-left: 16px;
  padding-right: 16px;
  overflow: scroll;
  height: 70vh;
}
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

.list-enter-active,
.list-leave-active {
  transition: all 2s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  background-color: yellow;
  transform: translateY(30px);
}
</style>
