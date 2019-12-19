import Vue from 'vue';
import { createTodayTodos } from '@/common/js/util';

export default {
  state: {
    // todos <array>;
    // todos-item <object>： id 时间戳；content 任务内容；isrelease 是否审核通过；
    // repeat 是否重复；repeatType 重复类型（m 月，w 周，d 日）; repeatVal 重复值（重复类型为月周时用到，不设置重复时为当天）；
    todos: [],
    // todoFileLists <array>; todoFileLists-item <object>: id 时间戳；label 文件名；
    todoFileLists: [],
    // <array>; item <object>: id 时间戳；todoArray 任务数组；...各种指标；
    todoDealHistory: [],
    // 和 todos 类型一样, item 多了一个 isCompleted (是否完成) 参数；
    todayTodo: [],
    todoRepeatType: [
      { label: '每月', value: 'm', id: 1 },
      { label: '每周', value: 'w', id: 2 },
      { label: '每日', value: 'd', id: 3 },
    ],
  },
  mutations: {
    batchProcessingTodo(state, obj) {
      state.todos = [...state.todos, ...obj.todos];
      const resoult = createTodayTodos(obj.todos);
      state.todayTodo = [...state.todayTodo, ...resoult];
    },
    addTodo(state, obj) {
      state.todos.push({ ...obj, isrelease: true, id: new Date().getTime() });
      // 是否添加到今日任务逻辑
      let add = false;
      const nowM = new Date().getDate(); // 本月几号
      const nowW = new Date().getDay(); // 本周周几
      if (!obj.repeat || (obj.repeat && obj.repeatType === 'd')
        || (obj.repeat && obj.repeatType === 'm' && obj.repeatVal === nowM)
        || (obj.repeat && obj.repeatType === 'w' && obj.repeatVal === nowW)) {
        add = true;
      }
      if (add) {
        state.todayTodo.push({
          ...obj, isrelease: true, id: new Date().getTime(), isCompleted: false,
        });
      }
    },
    delTodo(state, dId) {
      state.todos = [...state.todos.filter(({ id }) => id !== dId)];
      state.todayTodo = [...state.todayTodo.filter(({ id }) => id !== dId)];
    },
    allowTodo(state, dId) {
      state.todos = [...state.todos.map((el) => {
        if (el.id === dId) {
          return { ...el, isrelease: true };
        }
        return el;
      })];
    },

    addTodoFile(state, obj) {
      state.todoFileLists.push({ ...obj, id: new Date().getTime() });
    },

    clearTodo(state) {
      state.todos = [];
      state.todoFileLists = [];
    },

    addTodayTodo(state, arr) {
      state.todayTodo = arr;
    },
    batchProcessingTodoHistory(state, obj) {
      state.todoDealHistory = [...obj.todoHistory];
    },
    addTodoDealHistory(state, arr) {
      const nowDay = Vue.prototype.$moment().format('YYYY-MM-DD');
      const noTodayArr = state.todoDealHistory.filter(el => el.id !== nowDay);
      state.todoDealHistory = [
        ...noTodayArr, { id: nowDay, todoArray: arr }];
    },

    completeTodayTodoItem(state, id) {
      const copyTodayTode = JSON.parse(JSON.stringify(state.todayTodo));
      state.todayTodo = copyTodayTode
        .map(el => (el.id === id ? { ...el, isCompleted: true } : el));
    },
  },
  actions: {
    syncTodos({ state }) {
      Vue.prototype.$local.setItem('todos', state.todos);
    },
    syncTodoDealHistory({ state }) {
      Vue.prototype.$local.setItem('todoHistory', state.todoDealHistory);
    },
    // syncCompleteTodayTodoItem({ state, commit }, id) {
    //   commit('completeTodayTodoItem', id);
    //   commit('addTodoDealHistory', state.todayTodo);
    // },
  },
  getters: {
    releasedsTodo: state => state.todos.filter(el => el.isrelease),
    todos: state => state.todos,
    // noReleaseds: state => state.todos.filter(el => !el.isrelease),
    uploadTodos: state => state.todoFileLists,
    todoRepeatType: state => state.todoRepeatType,
    todayTodo: state => state.todayTodo,
    todoDealHistory: state => state.todoDealHistory,
  },
};
