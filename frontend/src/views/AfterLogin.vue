<template>
  <md-content>
    <md-content>
      <md-steppers :md-active-step.sync="active" md-vertical md-linear>
        <md-step
          id="token"
          md-label="Getting token"
          :md-editable="false"
          :md-done="!!this.token"
          :md-error="this.errors.token"
        >
          <p>
            This token will be used to create forks, make pull requests, make
            merge requests, make commits on your behalf.
          </p>
        </md-step>
        <md-step
          id="user"
          md-label="Getting user data"
          :md-editable="false"
          :md-done="!!this.user"
          :md-error="this.errors.user"
        >
          <p>
            Name and others info.
          </p>
        </md-step>
        <md-step
          id="fork"
          md-label="Creating fork"
          :md-editable="false"
          :md-done="!!this.fork"
        >
          <p>
            Name and avatar.
          </p>
        </md-step>
        <md-step
          id="team"
          md-label="Team"
          :md-editable="false"
          :md-done="!!this.teamPrivateKey"
        >
          <div>
            <md-radio v-model="team" value="create">Create team</md-radio>
            <md-radio v-model="team" value="join">Join team</md-radio>
          </div>
          <div v-if="team === 'create'">
            <md-field>
              <label>Team name</label>
              <md-input v-model="teamName" maxlength="30"></md-input>
            </md-field>
            <md-content class="md-scrollbar">
              <h2 class="md-title">Team coutries</h2>
              <md-list style="height:300px; overflow:scroll">
                <md-list-item v-for="item in countries" :key="item.key">
                  <md-checkbox v-model="teamCoutries" :value="item.key">
                    {{ item.name }}
                  </md-checkbox>
                  <country-flag :country="item.key" size="normal" />
                </md-list-item>
              </md-list>
            </md-content>
            <md-button class="md-raised md-primary">Submit</md-button>
          </div>
          <div v-else>
            <md-field>
              <label>Team private key</label>
              <md-input v-model="teamPrivateKey"></md-input>
            </md-field>
            <md-button class="md-raised md-primary">Submit</md-button>
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
    fork: undefined,
    teamPrivateKey: undefined,
    team: "create",
    teamName: "",
    teamCoutries: [],
    countries: undefined
  }),
  computed: {
    ...mapGetters({
      token: "token"
    }),
    ...mapState({
      user: state => state.user,
      language: state => state.language
    })
  },
  created() {
    this.countries = Object.entries(
      countries.getNames(this.language)
    ).map(item => ({ key: item[0], name: item[1] }));
  },
  mounted() {
    this.getInfo();
  },
  updated() {
    this.getInfo();
  },
  methods: {
    ...mapActions(["setToken", "setUser"]),
    setNextStepper(index) {
      if (index) {
        this.active = index;
      }
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
      } else if (!this.fork) {
        this.createFork(this.token)
          .then(repo => {
            this.fork = repo;
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
    }
  }
};
</script>
