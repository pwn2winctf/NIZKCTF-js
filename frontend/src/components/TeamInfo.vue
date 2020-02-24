<template>
  <md-dialog :md-active="info.isOpen" @md-clicked-outside="onClose">
    <md-dialog-title>{{ info.pos }} - {{ info.name }}</md-dialog-title>
    <md-dialog-content>
      <p>{{ $t("score") }}: {{ info.score }}</p>
      <p>Crypt PK: {{ info.crypt_pk }}</p>
      <p>Sign PK: {{ info.sign_pk }}</p>
      <md-table v-model="info.members">
        <md-table-toolbar>
          <h3>{{ $t("members") }}</h3>
        </md-table-toolbar>
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell :md-label="$t('username')">{{
            item.username
          }}</md-table-cell>
          <md-table-cell md-label="ID">{{ item.id }}</md-table-cell>
        </md-table-row>
      </md-table>

      <md-table
        v-model="info.solvedChallenges"
        md-sort="time"
        md-sort-order="asc"
      >
        <md-table-toolbar>
          <h3>{{ $t("solves") }}</h3>
        </md-table-toolbar>
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell :md-label="$t('challenge')">{{
            item.name
          }}</md-table-cell>
          <md-table-cell :md-label="$t('time')" md-sort-by="time">{{
            formatDate(item.time)
          }}</md-table-cell>
        </md-table-row>
      </md-table>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="onClose">{{
        $t("close")
      }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import fromUnixTime from "date-fns/fromUnixTime";
import format from "date-fns/format";

export default {
  name: "TeamInfo",
  props: ["info", "onClose"],
  methods: {
    formatDate(datetime) {
      return format(fromUnixTime(datetime), "MMM dd HH:mm");
    }
  }
};
</script>

<style type="sass" scoped></style>
