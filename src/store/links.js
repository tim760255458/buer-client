import Vue from 'vue';

export default {
  state: {
    // links <array>; links-item <object>： id 时间戳；label 描述文本；url 链接；isrelease 是否审核通过；
    links: [],
    // optionsFileLists <array>; optionsFileLists-item <object>: id 时间戳；label 文件名；
    optionsFileLists: [],
  },
  mutations: {
    batchProcessingLink(state, obj) {
      state.links = [...state.links, ...obj.links];
    },
    addLink(state, obj) {
      state.links.push({ ...obj, isrelease: false, id: new Date().getTime() });
    },
    delLink(state, dId) {
      state.links = [...state.links.filter(({ id }) => id !== dId)];
    },
    allowLink(state, dId) {
      state.links = [...state.links.map((el) => {
        if (el.id === dId) {
          return { ...el, isrelease: true };
        }
        return el;
      })];
    },

    addFile(state, obj) {
      state.optionsFileLists.push({ ...obj, id: new Date().getTime() });
    },

    clearLink(state) {
      state.links = [];
      state.optionsFileLists = [];
    },
  },
  actions: {
    syncLinks({ state }) {
      Vue.prototype.$local.setItem('links', state.links);
    },
  },
  getters: {
    releaseds: state => state.links.filter(el => el.isrelease),
    links: state => state.links,
    // noReleaseds: state => state.links.filter(el => !el.isrelease),
    uploadFiles: state => state.optionsFileLists,
  },
};
