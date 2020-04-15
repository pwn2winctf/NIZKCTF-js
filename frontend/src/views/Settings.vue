<template>
  <md-content>
    <md-dialog :md-active="showDialog">
      <md-dialog-title>{{ $t("deleteAllPrivateData") }}?</md-dialog-title>
      <md-dialog-content>
        <p v-html="$t('deleteAllPrivateDataDescription')" />
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">{{
          $t("cancel")
        }}</md-button>
        <md-button class="md-raised md-accent" @click="deleteData">
          {{ $t("delete") }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>
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
        <md-textarea v-model="encodedTeam" readonly rows="4"></md-textarea>
      </md-field>
      <div class="center">
        <div class="fit">
          <div class="width100">
            <md-button
              class="md-raised md-primary width100"
              @click="copyTeamSecret"
              >{{ $t("copyToClipboard") }}</md-button
            >
          </div>
          <div class="width100">
            <md-button
              class="md-raised md-accent width100"
              @click="showDialog = true"
            >
              {{ $t("deleteAllPrivateData") }}
            </md-button>
          </div>
        </div>
      </div>
    </div>
    <md-snackbar
      md-position="center"
      :md-duration="4000"
      :md-active.sync="showSnackbar"
    >
      <span>{{ message }}</span>
    </md-snackbar>
  </md-content>
</template>

<script>
import { mapState, mapActions } from "vuex";

import messages from "@/internationalization";

export default {
  name: "Settings",
  data: () => ({
    showSnackbar: false,
    message: "",
    showDialog: false,
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
    ...mapActions([
      "setTheme",
      "setLanguage",
      "setTeam",
      "setUser",
      "setToken",
      "setRepository"
    ]),
    showMessage(message) {
      this.message = message;
      this.showSnackbar = true;
    },
    copyTeamSecret() {
      navigator.clipboard
        .writeText(this.encodedTeam)
        .then(() => this.showMessage(this.$t("teamKeysCopied")))
        .catch(() => this.showMessage("Oops, unable to copy"));
    },
    toggleTheme(value) {
      const theme = value ? "dark" : "default";
      this.setTheme(theme);
    },
    changeLanguage(language) {
      this.$i18n.locale = language;
      this.setLanguage(language);
    },
    deleteData() {
      this.showDialog = false;
      this.setTeam(null);
      this.setToken(null);
      this.setUser(null);
      this.setRepository(null);
    }
  }
};
</script>

<style type="sass" scoped>
.width100 {
  width: 100%;
}
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fit {
  width: fit-content;
}
</style>
