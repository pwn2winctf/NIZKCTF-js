<template>
  <md-app class="page-container">
    <md-app-toolbar class="md-primary" md-elevation="0">
      <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">My Title</span>
    </md-app-toolbar>
    <md-app-drawer :md-active="menuVisible" md-persistent="mini">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">Navigation</span>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-dense" @click="toggleMenu">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </md-toolbar>
      <md-list>
        <md-list-item>
          <md-icon>flag</md-icon>
          <span class="md-list-item-text">Challenges</span>
        </md-list-item>

        <md-list-item>
          <md-icon>emoji_events</md-icon>
          <span class="md-list-item-text">Rank</span>
        </md-list-item>

        <md-list-item>
          <md-icon>assignment</md-icon>
          <span class="md-list-item-text">Rules</span>
        </md-list-item>

        <md-list-item>
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Settings</span>
        </md-list-item>
      </md-list>
    </md-app-drawer>
    <md-app-content>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam,
      non molestias et! Earum magnam, similique, quo recusandae placeat dicta
      asperiores modi sint ea.
    </md-app-content>
  </md-app>
</template>

<script>
export default {
  name: "PersistentMini",
  data: () => ({
    menuVisible: false
  }),
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    }
  }
};
</script>

<style type="sass" scoped>
.page-container {
  width: 100%;
}
</style>
