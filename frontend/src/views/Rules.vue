<template>
  <md-content class="md-layout container md-alignment-center-center">
    <md-button
      class="md-raised md-layout-item md-primary"
      href="https://pwn2win.party/rules"
      >{{ $t("rulesButton") }}</md-button
    >
  </md-content>
</template>

<script>
export default {
  name: "Rules"
};
</script>

<style type="sass" scoped>
.container {
  height: 100%;
}
</style>
