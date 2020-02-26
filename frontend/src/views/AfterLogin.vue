<template>
  <div>
    <h1>Getting access token</h1>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import { API } from "@/services/api";

export default {
  name: "AfterLogin",
  data: () => ({
    ...mapState({
      token: state => state.token
    })
  }),
  mounted() {
    if (this.token) {
      this.$router.push("/");
    } else {
      this.getToken();
    }
  },
  methods: {
    ...mapActions(["setToken"]),
    getToken() {
      API.getAccessToken(this.$route.query.code).then(response => {
        const { data } = response;
        this.setToken(data.token);
      });
    }
  }
};
</script>
