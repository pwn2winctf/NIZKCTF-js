<template>
  <md-content>
    <md-content>
      <md-steppers :md-active-step.sync="active" md-vertical md-linear>
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
          :md-done="!!team.privateKey"
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
              <md-button class="md-raised md-primary" @click="onCreateTeam">{{
                $t("submit")
              }}</md-button>
            </div>
          </div>
          <div v-else>
            <md-field>
              <label>{{ $t("teamPrivateKey") }}</label>
              <md-input v-model="team.privateKey"></md-input>
            </md-field>
            <div style="display:flex; justify-content:center;">
              <md-button class="md-raised md-primary" @click="onJoinTeam">{{
                $t("submit")
              }}</md-button>
            </div>
          </div>
        </md-step>
      </md-steppers>
    </md-content>
  </md-content>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import CountryFlag from "vue-country-flag";
import countries from "i18n-iso-countries";

import { API } from "@/services/api";
import GitHub from "@/services/github";
import crypto from "@/services/crypto";
import { getTeamPath, validCountries } from "@/utils";

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
    countries: undefined,
    countryFilter: "",
    filteredCountries: []
  }),
  computed: {
    ...mapGetters({
      token: "token"
    }),
    ...mapState({
      user: state => state.user,
      language: state => state.language,
      repository: state => state.repository
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
    ...mapActions(["setToken", "setUser", "setRepository"]),
    setNextStepper(index) {
      if (index) {
        this.active = index;
      }
    },
    async onCreateTeam() {
      const { name, countries } = this.team;

      const message = `Regiter team ${name}`;

      const path = getTeamPath(name);

      crypto
        .createTeamKeys()
        .then(({ crypt_pk, sign_pk }) => {
          const team = { crypt_pk, sign_pk, name, countries };

          const content = new Buffer(JSON.stringify(team)).toString("base64");
          return this.createPullRequest(this.token, message, path, content);
        })
        .then(() => this.$router.push("/"))
        .catch(err => console.error(err));
    },
    onJoinTeam() {
      const { name, privateKey } = this.team;
      const team = { name, privateKey };
      console.log("Join team", team);
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
      const { data } = await github.getUser();
      return data;
    },
    async createFork(token) {
      const github = new GitHub(token);
      const { data } = await github.createFork(
        config.owner,
        config.submissionsRepo
      );
      return data.name;
    },
    async createPullRequest(token, message, path, content) {
      const github = new GitHub(token);

      const branch = await crypto.randomName();
      const ref = `refs/heads/${branch}`;

      const branches = await github.listBranches(
        this.user.login,
        this.repository
      );

      const shaOfMaster = branches.find(item => item.name === "master").commit
        .sha;

      await github.createBranch(
        this.user.login,
        this.repository,
        ref,
        shaOfMaster
      );

      await github.createOrUpdateFile(
        this.user.login,
        this.repository,
        `${path}/team.json`,
        message,
        content,
        branch
      );

      await github.createPullRequest(
        config.owner,
        config.submissionsRepo,
        message,
        `${this.user.login}:${branch}`
      );
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
