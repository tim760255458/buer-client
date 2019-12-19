import Vue from 'vue';
import Vuex from 'vuex';
import news from './news';
import links from './links';
import note from './note';
import todos from './todos';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    news,
    links,
    note,
    todos,
  },
});
