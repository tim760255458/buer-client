import Vue from 'vue';

export default {
  state: {
    // notes <array>; notes-item <object>： id 时间戳；note 描述文本；isrelease 是否审核通过；
    notes: [],
    // noteFileLists <array>; noteFileLists-item <object>: id 时间戳；label 文件名；
    noteFileLists: [],
  },
  mutations: {
    batchProcessingNote(state, obj) {
      state.notes = [...state.notes, ...obj.notes];
    },
    addNote(state, obj) {
      state.notes.push({ ...obj, isrelease: false, id: new Date().getTime() });
    },
    delNote(state, dId) {
      state.notes = [...state.notes.filter(({ id }) => id !== dId)];
    },
    allowNote(state, dId) {
      state.notes = [...state.notes.map((el) => {
        if (el.id === dId) {
          return { ...el, isrelease: true };
        }
        return el;
      })];
    },

    addNoteFile(state, obj) {
      state.noteFileLists.push({ ...obj, id: new Date().getTime() });
    },

    clearNote(state) {
      state.notes = [];
      state.noteFileLists = [];
    },
  },
  actions: {
    syncNotes({ state }) {
      Vue.prototype.$local.setItem('notes', state.notes);
    },
  },
  getters: {
    releasedsNote: state => state.notes.filter(el => el.isrelease),
    notes: state => state.notes,
    // noReleasedsNote: state => state.notes.filter(el => !el.isrelease),
    uploadNoteFiles: state => state.noteFileLists,
  },
};
