<template>
  <md-content>
    <md-content v-if="loading" class="spinner">
      <md-progress-spinner md-mode="indeterminate" />
    </md-content>
    <md-content v-else-if="encodedTeam">
      <md-dialog-alert
        v-if="team.option == 'create'"
        :md-active.sync="createdTeam"
        :md-title="$t('backupTeamPrivateKey')"
        :md-content="$t('saveYourTeamSecret')"
      />
      <p>{{ $t("encodedTeam") }}</p>
      <md-field>
        <md-textarea
          v-model="encodedTeam"
          md-autogrow
          id="team-secret"
          readonly
        ></md-textarea>
      </md-field>
      <div class="center">
        <md-button class="md-raised md-primary" @click="copyTeamSecret">
          {{ $t("copyToClipboard") }}
        </md-button>
      </div>
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
        <form @submit="submit">
          <p v-if="errors.team.length">
            <b>{{ $t("fixErrors") }}</b>
          </p>
          <ul>
            <li v-for="(error, idx) in errors.team" :key="idx">{{ error }}</li>
          </ul>
          <div>
            <md-radio
              v-model="team.option"
              value="create"
              :disabled="isRegistered"
              >{{ $t("createTeam") }}</md-radio
            >
            <md-radio
              v-model="team.option"
              value="join"
              :disabled="isRegistered"
              >{{ $t("joinTeam") }}</md-radio
            >
          </div>
          <div v-if="team.option === 'create'">
            <md-field>
              <label>{{ $t("teamName") }}</label>
              <md-input
                v-model="team.name"
                :maxlength="maxTeamNameLength"
                required
              ></md-input>
            </md-field>
            <md-content class="md-scrollbar">
              <h2 class="md-title">{{ $t("teamCountries") }}</h2>
              <div class="flags-container">
                <country-flag
                  v-for="(item, index) in team.countries"
                  :key="index"
                  :country="item"
                  size="normal"
                />
              </div>
              <md-field>
                <md-icon>search</md-icon>
                <md-input
                  v-model="countryFilter"
                  placeholder="ex. Japan"
                ></md-input>
              </md-field>
              <md-list style="height:300px; overflow:scroll">
                <md-list-item v-for="item in filteredCountries" :key="item.key">
                  <md-checkbox v-model="team.countries" :value="item.key">{{
                    item.name
                  }}</md-checkbox>
                  <country-flag :country="item.key" size="normal" />
                </md-list-item>
              </md-list>
            </md-content>
            <div style="display:flex; justify-content:center;">
              <md-button class="md-raised md-primary" type="submit">
                {{ $t("submit") }}
              </md-button>
            </div>
          </div>
          <div v-else>
            <md-field>
              <label>{{ $t("teamPrivateKey") }}</label>
              <md-input v-model="encodedTeamInput" required></md-input>
            </md-field>
            <div style="display:flex; justify-content:center;">
              <md-button class="md-raised md-primary" type="submit">{{
                $t("submit")
              }}</md-button>
            </div>
          </div>
        </form>
      </md-step>
    </md-steppers>
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
import { mapGetters, mapState, mapActions } from "vuex";
import CountryFlag from "vue-country-flag";
import countries from "i18n-iso-countries";

import { API } from "@/services/api";
import { validCountries } from "@/utils";

import NIZKCTF, { GitHub } from "@/services/nizkctf";
import GitLab from "@/services/nizkctf/gitlab";
import { repoNameHandler } from "@/services/nizkctf/github";

import config from "@/config.json";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/pt.json"));

export default {
  name: "AfterLogin",
  components: { CountryFlag },
  data: () => ({
    loading: false,
    createdTeam: false,
    users: [],
    isRegistered: false,
    active: "token",
    errors: {
      token: undefined,
      user: undefined,
      team: []
    },
    team: {
      option: "create",
      name: "",
      countries: [],
      privateKey: ""
    },
    encodedTeamInput: null,
    encodedTeam: null,
    countries: undefined,
    countryFilter: "",
    filteredCountries: [],
    showSnackbar: false,
    message: "",
    maxTeamNameLength: config.maxTeamNameLength
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
    if (this.token) {
      this.alreadyRegistered().then(alreadyRegistered => {
        if (alreadyRegistered) {
          this.team.option = "join";
          this.isRegistered = alreadyRegistered;
        }
      });
    }
  },
  methods: {
    ...mapActions(["setToken", "setUser", "setRepository", "setTeam"]),
    copyTeamSecret() {
      navigator.clipboard
        .writeText(this.encodedTeam)
        .then(() => this.showMessage(this.$t("teamKeysCopied")))
        .catch(() => this.showMessage("Oops, unable to copy"));
    },
    setNextStepper(index) {
      if (index) {
        this.active = index;
      }
    },
    showMessage(message) {
      this.message = message;
      this.showSnackbar = true;
    },
    submit(event) {
      event.preventDefault();

      if (!this.isValid()) {
        return;
      }
      if (this.team.option === "create") {
        this.createTeam();
      } else {
        this.joinTeam();
      }
    },
    isValid() {
      this.errors.team = [];
      if (this.team.option === "create") {
        const { name, countries } = this.team;
        const teams = Object.values(this.users);

        if (!name || name.length > config.maxTeamNameLength) {
          this.showMessage(this.$t("errors.teamName"));
          this.errors.team.push(this.$t("errors.teamName"));
          return false;
        }

        if (teams.includes(name)) {
          this.showMessage(this.$t("errors.teamNameAlreadyExists"));
          this.errors.team.push(this.$t("errors.teamNameAlreadyExists"));
          return false;
        }

        if (countries.length > config.maxMembers) {
          this.showMessage(
            this.$t("errors.maxMembers", { max: config.maxMembers })
          );
          this.errors.team.push(
            this.$t("errors.maxMembers", { max: config.maxMembers })
          );
          return false;
        }
        return true;
      } else {
        try {
          JSON.parse(Buffer(this.encodedTeamInput, "base64").toString());
          return true;
        } catch (err) {
          this.showMessage(this.$t("errors.privateKey"));
          this.errors.team.push(this.$t("errors.privateKey"));
          return false;
        }
      }
    },
    async createTeam() {
      const nizkctf = new NIZKCTF(
        this.token,
        this.repository,
        config.submissionsRepo,
        config.repohost
      );

      this.loading = true;
      nizkctf
        .createTeam(this.team)
        .then(keys => {
          const { name, countries } = this.team;
          const team = { name, countries, ...keys };
          this.setTeam(team);
          this.encodedTeam = Buffer.from(JSON.stringify(team)).toString(
            "base64"
          );
          this.showMessage(this.$t("teamCreated"));
          this.createdTeam = true;
        })
        .catch(err => {
          this.showMessage(err);
          console.error(err);
        })
        .finally(() => (this.loading = false));
    },
    joinTeam() {
      const team = JSON.parse(
        Buffer(this.encodedTeamInput, "base64").toString()
      );
      this.setTeam(team);
      this.showMessage("Joined the team");
      this.encodedTeam = this.encodedTeamInput;
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
        this.verifyFork(this.token)
          .then(repoForked => {
            this.alreadyRegistered()
              .then(alreadyRegistered => {
                if (alreadyRegistered) {
                  this.isRegistered = alreadyRegistered;
                  this.team.option = "join";
                }
              })
              .catch(err => console.error(err))
              .finally(() => {
                if (!repoForked) {
                  this.createFork(this.token).then(repo => {
                    this.setRepository(repo);
                    this.setNextStepper("team");
                  });
                } else {
                  this.setRepository(repoForked);
                  this.setNextStepper("team");
                }
              });
          })
          .catch(() => (this.errors.fork = "Try again later"));
      } else if (!this.encodedTeam && this.teamKey) {
        this.encodedTeam = Buffer.from(JSON.stringify(this.teamKey)).toString(
          "base64"
        );
      }
    },
    async githubGetToken() {
      const { data } = await API.getAccessToken(this.$route.query.code);
      if (data.error) {
        throw Error(data.error);
      }
      return data.token;
    },
    async gitlabGetToken() {
      const query = this.$route.hash.substring(1);
      const data = JSON.parse(
        '{"' +
          decodeURI(query)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
          '"}'
      );
      return data.access_token;
    },
    async getToken() {
      if (config.repohost === "github") {
        return this.githubGetToken();
      } else if (config.repohost === "gitlab") {
        return this.gitlabGetToken();
      } else {
        throw new TypeError(`Invalid repohost: ${config.repohost}`);
      }
    },
    async getUser(token) {
      if (config.repohost === "github") {
        const github = new GitHub(token);
        const data = await github.getUser();
        return data;
      } else if (config.repohost === "gitlab") {
        const gitlab = new GitLab(token);
        return await gitlab.getUser();
      } else {
        throw new TypeError(`Invalid repohost: ${config.repohost}`);
      }
    },
    async createFork(token) {
      if (config.repohost === "github") {
        const github = new GitHub(token);
        const { path } = await github.createFork(config.submissionsRepo);

        const branches = await github.listBranches(path);
        if (!branches.find(item => item.name === "upstream")) {
          const shaOfMaster = branches.find(item => item.name === "master").sha;

          await github.createBranch(
            config.submissionsRepo,
            "upstream",
            shaOfMaster
          );
        }
        return path;
      } else if (config.repohost === "gitlab") {
        const gitlab = new GitLab(token);

        const { path } = await gitlab.createFork(config.submissionsRepo);
        const branches = await gitlab.listBranches(path);
        if (!branches.find(item => item.name === "upstream")) {
          const shaOfMaster = branches.find(item => item.name === "master").sha;

          await gitlab.createBranch(
            config.submissionsRepo,
            "upstream",
            shaOfMaster
          );
        }
        return path;
      } else {
        throw new TypeError(`Invalid repohost: ${config.repohost}`);
      }
    },
    async verifyFork(token) {
      if (config.repohost === "github") {
        const github = new GitHub(token);
        const { repo } = repoNameHandler(config.submissionsRepo);
        try {
          const content = await github.getContents(
            `${this.user.username}/${repo}`
          );
          return !!content && `${this.user.username}/${repo}`;
        } catch (err) {
          return false;
        }
      } else if (config.repohost === "gitlab") {
        const gitlab = new GitLab(token);
        try {
          const response = await gitlab.verifyFork(config.submissionsRepo);
          return response;
        } catch (err) {
          return false;
        }
      } else {
        throw new TypeError(`Invalid repohost: ${config.repohost}`);
      }
    },
    async alreadyRegistered() {
      if (!this.user || !this.user.id) {
        return false;
      }
      try {
        const { data } = await API.getRegisteredUsers();
        this.users = data[config.repohost];
        return !!data[config.repohost][this.user.id];
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          this.showMessage(err.message);
          console.error(err);
        }
        throw err;
      }
    }
  },
  watch: {
    countryFilter(value) {
      this.filteredCountries = this.countries.filter(
        item => item.name.toUpperCase().indexOf(value.toUpperCase()) > -1
      );
    },
    active() {
      this.getInfo();
    }
  }
};
</script>

<style type="sass" scoped>
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flags-container {
  display: flex;
  flex-direction: row;
}
.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
