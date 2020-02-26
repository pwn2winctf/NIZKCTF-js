<template>
  <div>
    <h1>{{ $route.query.code }}</h1>
    <md-button class="md-raised md-layout-item md-primary" @click="getToken">get token</md-button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import { API } from "@/services/api";

export default {
  name: "AfterLogin",
  computed: mapState({
    token: state => state.token
  }),
  mounted() {
    if (this.token) {
      this.$route.push("/");
    }
  },
  methods: {
    ...mapActions(["setToken"]),
    getToken() {
      API.postAccessToken(this.$route.query.code).then(response => {
        const { data } = response;
        console.log(data);
        this.setToken(data.access_token);
      });
    }
  }
};
</script>
