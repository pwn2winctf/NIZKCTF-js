<template>
  <md-content>
    <md-field>
      <label for="language">{{ $t("language") }}</label>
      <md-select
        :value="this.language"
        name="movie"
        id="language"
        @md-selected="this.changeLanguage"
      >
        <md-option
          v-for="item in languages"
          :key="item.language"
          :value="item.language"
          >{{ item.label }}</md-option
        >
      </md-select>
    </md-field>
    <md-switch :value="this.theme === 'default'" @change="toggleTheme">
      {{ $t("darkMode") }}
    </md-switch>
    <div v-if="teamKey">
      <p>{{ $t("encodedTeam") }}</p>
      <md-field>
        <label>{{ $t("teamPrivateKey") }}</label>
        <md-input v-model="encodedTeam" type="password" disabled></md-input>
      </md-field>
    </div>
  </md-content>
</template>

<script>
import { mapState, mapActions } from "vuex";

import messages from "@/internationalization";

export default {
  name: "Settings",
  data: () => ({
    languages: Object.keys(messages).map(item => ({
      language: item,
      label: messages[item].label
    })),
    encodedTeam: ""
  }),
  mounted() {
    this.encodedTeam = Buffer.from(JSON.stringify(this.teamKey)).toString(
      "base64"
    );
  },
  computed: {
    ...mapState({
      theme: state => state.theme,
      language: state => state.language,
      teamKey: state => state.team
    })
  },
  methods: {
    ...mapActions(["setTheme", "setLanguage"]),
    toggleTheme(value) {
      const theme = value ? "dark" : "default";
      this.setTheme(theme);
    },
    changeLanguage(language) {
      this.$i18n.locale = language;
      this.setLanguage(language);
    }
  }
};
</script>
