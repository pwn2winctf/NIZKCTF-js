<template>
  <md-content v-if="encodedTeam && team.option == 'create'">
    <p>{{ $t("encodedTeam") }}</p>
    <md-field>
      <md-textarea v-model="encodedTeam" md-autogrow disabled></md-textarea>
    </md-field>
  </md-content>
  <md-steppers v-else :md-active-step.sync="active" md-vertical md-linear>
    <md-step
      id="token"
      :md-label="$t('gettingToken')"
      :md-editable="false"
      :md-done="!!this.token"
      :md-error="this.errors.token"
    >
      <p>{{ $t("gettingTokenInfo") }}</p>
    </md-step>
    <md-step
      id="user"
      :md-label="$t('gettingUser')"
      :md-editable="false"
      :md-done="!!this.user"
      :md-error="this.errors.user"
    >
      <p>{{ $t("gettingUserInfo") }}</p>
    </md-step>
    <md-step
      id="fork"
      :md-label="$t('creatingFork')"
      :md-editable="false"
      :md-done="!!this.repository"
    >
      <p>{{ $t("creatingFork") }}</p>
    </md-step>
    <md-step
      id="team"
      :md-label="$t('team')"
      :md-editable="false"
      :md-done="!!teamKey"
    >
      <div>
        <md-radio v-model="team.option" value="create">{{
          $t("createTeam")
        }}</md-radio>
        <md-radio v-model="team.option" value="join">{{
          $t("joinTeam")
        }}</md-radio>
      </div>
      <div v-if="team.option === 'create'">
        <md-field>
          <label>{{ $t("teamName") }}</label>
          <md-input v-model="team.name" maxlength="30"></md-input>
        </md-field>
        <md-content class="md-scrollbar">
          <h2 class="md-title">{{ $t("teamCountries") }}</h2>
          <md-field>
            <md-icon>search</md-icon>
            <md-input
              v-model="countryFilter"
              placeholder="ex. Japan"
            ></md-input>
          </md-field>
          <md-list style="height:300px; overflow:scroll">
            <md-list-item v-for="item in filteredCountries" :key="item.key">
              <md-checkbox v-model="team.countries" :value="item.key">
                {{ item.name }}
              </md-checkbox>
              <country-flag :country="item.key" size="normal" />
            </md-list-item>
          </md-list>
        </md-content>
        <div style="display:flex; justify-content:center;">
          <md-button class="md-raised md-primary" @click="createTeam">{{
            $t("submit")
          }}</md-button>
        </div>
      </div>
      <div v-else>
        <md-field>
          <label>{{ $t("teamPrivateKey") }}</label>
          <md-input v-model="encodedTeam"></md-input>
        </md-field>
        <div style="display:flex; justify-content:center;">
          <md-button class="md-raised md-primary" @click="joinTeam">
            {{ $t("submit") }}
          </md-button>
        </div>
      </div>
    </md-step>
    <md-snackbar
      md-position="center"
      :md-duration="4000"
      :md-active.sync="showSnackbar"
    >
      <span>{{ message }}</span>
    </md-snackbar>
  </md-steppers>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import CountryFlag from "vue-country-flag";
import countries from "i18n-iso-countries";

import { API } from "@/services/api";
import { validCountries } from "@/utils";

import NIZKCTF, { GitHub } from "@/services/nizkctf";

import config from "@/config.json";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/pt.json"));

export default {
  name: "AfterLogin",
  components: { CountryFlag },
  data: () => ({
    active: "token",
    errors: {
      token: undefined,
      user: undefined
    },
    team: {
      option: "create",
      name: "",
      countries: [],
      privateKey: ""
    },
    encodedTeam: null,
    countries: undefined,
    countryFilter: "",
    filteredCountries: [],
    showSnackbar: false,
    message: ""
  }),
  computed: {
    ...mapGetters({
      token: "token"
    }),
    ...mapState({
      user: state => state.user,
      language: state => state.language,
      repository: state => state.repository,
      teamKey: state => state.team
    })
  },
  created() {
    this.countries = Object.entries(countries.getNames(this.language))
      .map(item => ({ key: item[0].toLowerCase(), name: item[1] }))
      .filter(item => validCountries.includes(item.key));
    this.filteredCountries = this.countries;
  },
  mounted() {
    this.getInfo();
  },
  updated() {
    this.getInfo();
  },
  methods: {
    ...mapActions(["setToken", "setUser", "setRepository", "setTeam"]),
    setNextStepper(index) {
      if (index) {
        this.active = index;
      }
    },
    showMessage(message) {
      this.message = message;
      this.showSnackbar = true;
    },
    async createTeam() {
      const local = { owner: this.user.login, repository: this.repository };
      const upstream = {
        owner: config.owner,
        repository: config.submissionsRepo
      };

      const nizkctf = new NIZKCTF(this.token, local, upstream);
      nizkctf
        .createTeam(this.team)
        .then(keys => {
          const { name, countries } = this.team;
          const team = { name, countries, ...keys };
          this.setTeam(team);
          this.encodedTeam = Buffer.from(JSON.stringify(team)).toString(
            "base64"
          );
          this.showMessage("Created team");
        })
        .catch(err => {
          this.showMessage(err);
          console.error(err);
        });
    },
    joinTeam() {
      const team = JSON.parse(Buffer(this.encodedTeam, "base64").toString());
      this.setTeam(team);
      this.showMessage("Joined the team");
    },
    getInfo() {
      if (!this.token) {
        this.getToken()
          .then(token => {
            this.setToken(token);
            this.setNextStepper("user");
          })
          .catch(() => (this.errors.token = "Try login again"));
      } else if (!this.user) {
        this.getUser(this.token)
          .then(user => {
            this.setUser(user);
            this.setNextStepper("fork");
          })
          .catch(() => (this.errors.avatar = "Try refresh page"));
      } else if (!this.repository) {
        this.createFork(this.token)
          .then(repo => {
            this.setRepository(repo);
            this.setNextStepper("team");
          })
          .catch(() => (this.errors.fork = "Try again later"));
      } else if (!this.encodedTeam && this.teamKey) {
        this.encodedTeam = Buffer.from(JSON.stringify(this.teamKey)).toString(
          "base64"
        );
      }
    },
    async getToken() {
      const { data } = await API.getAccessToken(this.$route.query.code);
      if (data.error) {
        throw Error(data.error);
      }
      return data.token;
    },
    async getUser(token) {
      const github = new GitHub(token);
      const data = await github.getUser();
      return data;
    },
    async createFork(token) {
      const github = new GitHub(token);
      const { name } = await github.createFork(
        config.owner,
        config.submissionsRepo
      );
      return name;
    }
  },
  watch: {
    countryFilter(value) {
      this.filteredCountries = this.countries.filter(
        item => item.name.toUpperCase().indexOf(value.toUpperCase()) > -1
      );
    }
  }
};
</script>
