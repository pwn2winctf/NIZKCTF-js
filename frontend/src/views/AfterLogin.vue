<template>
  <div>
    <h1 class="md-title">{{ $t("gettingInformations") }}</h1>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import { API } from "@/services/api";
import GitHub from "@/services/github";

export default {
  name: "AfterLogin",
  computed: {
    ...mapGetters({
      token: "token"
    })
  },
  mounted() {
    if (this.token) {
      this.$router.push("/");
    } else {
      this.getInfo();
    }
  },
  methods: {
    ...mapActions(["setToken", "setAvatar"]),
    async getInfo() {
      const token = await this.getToken();
      const user = await this.getUser(token);

      this.setAvatar(user.avatar_url);
      this.setToken(token);
      this.$router.push("/");
    },
    async getToken() {
      const { data } = await API.getAccessToken(this.$route.query.code);
      return data.token;
    },
    async getUser(token) {
      const github = GitHub.getInstance(token);
      const { data } = await github.getUser();
      return data;
    }
  }
};
</script>
