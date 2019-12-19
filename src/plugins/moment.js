import Vue from 'vue';
import moment from 'moment';

moment.locale('zh-cn');
Vue.filter('dateformat', (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') => moment(dataStr).format(pattern));
Vue.filter('dateformatNow', (dataStr, type = 'day') => moment(dataStr).startOf(type).fromNow());
Vue.prototype.$moment = moment;
