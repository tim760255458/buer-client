import Vue from 'vue';
import VueRouter from 'vue-router';
import PageHome from '@/views/PageHome.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: PageHome,
  },
  {
    path: '/note',
    name: 'note',
    component: () => import(/* webpackChunkName: "about" */ '@/views/PageNote.vue'),
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import(/* webpackChunkName: "about" */ '@/views/PageTodo.vue'),
  },
  {
    path: '/feature',
    name: 'feature',
    component: () => import(/* webpackChunkName: "about" */ '@/views/PageFeature.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
