<template>
  <div>
    <md-switch :value="this.theme === 'default'" @change="toggleTheme"
      >Dark mode</md-switch
    >
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Settings",
  computed: {
    ...mapState({
      theme: state => state.theme
    })
  },
  methods: {
    ...mapActions(["setTheme"]),
    toggleTheme(value) {
      const theme = value ? "dark" : "default";
      this.setTheme(theme);
    }
  }
};
</script>
