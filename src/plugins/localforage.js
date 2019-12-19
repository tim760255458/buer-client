import Vue from 'vue';
import localForage from 'localforage';

localForage.config({
  name: 'buer',
  version: '0.1',
  description: 'buer 的本地数据库',
});

Vue.prototype.$local = localForage;
