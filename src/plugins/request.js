import Vue from 'vue';
import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 添加请求拦截器
request.interceptors.request.use(config => config,
  error => Promise.reject(error));

// 添加响应拦截器
request.interceptors.response.use(response => response,
  error => Promise.reject(error));

Vue.prototype.$axios = request;
