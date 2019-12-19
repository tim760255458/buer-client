<template>
  <div id="app">
    <el-container class="app-container">
      <el-header>
        <el-menu :default-active="activeIndex" mode="horizontal" router
          @select="handleSelect" background-color="#409EFF"
          text-color="#303133" active-text-color="white">
          <el-menu-item index="/">链接</el-menu-item>
          <el-menu-item index="/note">便签</el-menu-item>
          <el-menu-item index="/todo">任务清单</el-menu-item>
          <el-menu-item index="/feature">功能清单</el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="app-main">
        <transition mode="out-in" name="el-fade-in-linear">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </transition>
      </el-main>
      <el-footer>buer 2019</el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { createTodayTodos } from '@/common/js/util';

export default {
  name: 'app',
  components: {},
  data: () => ({
    activeIndex: '/',
  }),
  created() {
    this.clear();
    this.checkDate();
    window.onbeforeunload = () => this.saveDate();
  },
  watch: {
    $route(newVal) {
      this.activeIndex = newVal.path;
    },
  },
  computed: {
    ...mapGetters(['notes', 'links', 'todos', 'todoDealHistory', 'todayTodo']),
  },
  methods: {
    ...mapMutations(['batchProcessingLink', 'batchProcessingNote', 'batchProcessingTodo', 'batchProcessingTodoHistory', 'clearLink', 'clearNote', 'clearTodo', 'addTodayTodo']),
    handleSelect(key, keyPath) { // eslint-disable-line
      // console.log(key, keyPath);
    },

    clear() {
      this.clearLink();
      this.clearNote();
      this.clearTodo();
    },
    checkDate() {
      this.$local.length().then((keyLength) => {
        if (keyLength) {
          this.setDate();
        }
      });
    },
    setDate() {
      this.$local.getItem('notes').then((val) => {
        this.batchProcessingNote({ notes: val });
      });
      this.$local.getItem('links').then((val) => {
        this.batchProcessingLink({ links: val });
      });
      this.$local.getItem('todos').then((val) => {
        this.batchProcessingTodo({ todos: val });
      });
      this.$local.getItem('todoHistory').then((val) => {
        if (val && val.length) {
          this.batchProcessingTodoHistory({ todoHistory: val });
          // 同步每日任务
          const hasTodayTodo = val.filter(el => el.id === this.$moment().format('YYYY-MM-DD'));
          if (hasTodayTodo.length && hasTodayTodo[0].todoArray.length) {
            this.addTodayTodo(hasTodayTodo[0].todoArray);
          } else {
            const todayTodoArr = createTodayTodos(this.todos);
            this.addTodayTodo(todayTodoArr);
          }
        }
      });
    },
    saveDate() {
      this.$local.setItem('notes', this.notes);
      this.$local.setItem('links', this.links);
      this.$local.setItem('todos', this.todos);
      const noTodayArr = this.todoDealHistory.filter(el => el.id !== this.$moment().format('YYYY-MM-DD'));
      this.$local.setItem('todoHistory', [...noTodayArr, {
        id: this.$moment().format('YYYY-MM-DD'),
        todoArray: [...this.todayTodo],
      }]);
    },
  },
};
</script>

<style>
html {
  font-size: 16px;
}
html, body, #app {
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.app-main {
  flex: 1;
  width: 100%;
  overflow-y: scroll;
}

.el-header, .el-footer {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
}
.el-footer {
  text-align: center;
  font-size: 12px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
}
</style>
