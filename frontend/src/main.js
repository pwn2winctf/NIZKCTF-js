import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  created: function () {
    // `this` aponta para a instância
    window.fetch('/README.md').then(r => console.log(r))
    console.log('a é: ')
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app')
