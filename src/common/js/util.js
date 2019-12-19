import Vue from 'vue';

export const createTodayTodos = (todos) => {
  if (!(todos instanceof Array) || todos.length < 1) {
    return [];
  }
  let resoult = [];
  const nowDay = Vue.prototype.$moment().format('YYYY-MM-DD'); // 完整日期
  const nowM = new Date().getDate(); // 本月几号
  const nowW = new Date().getDay(); // 本周周几

  // 处理非重复任务
  resoult = [...resoult, ...todos
    .filter(el => el.isrelease && !el.repeat && el.repeatVal === nowDay)];

  // 处理重复任务
  resoult = [...resoult, ...todos.filter(el => el.isrelease && el.repeat && el.repeatType === 'd')];
  resoult = [...resoult, ...todos
    .filter(el => el.isrelease && el.repeat && el.repeatType === 'm' && el.repeatVal === nowM)];
  resoult = [...resoult, ...todos
    .filter(el => el.isrelease && el.repeat && el.repeatType === 'w' && el.repeatVal === nowW)];

  return resoult.map(el => ({ ...el, isCompleted: false }));
};

export default null;
