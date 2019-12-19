<template>
  <div class="app-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="今日任务" name="list">
        <el-card class="home-card" shadow="hover">
          <div slot="header" class="list-header-title">
            <span>任务</span>
          </div>
          <el-row tag="ul" class="card-main">
            <el-col :span="24" v-for="item of todayTodo" tag="li" :key="item.id">
              <el-button type="info" icon="el-icon-check" circle
                v-if="!item.isCompleted" plain
                @click="completeItem(item.id)" size="mini"></el-button>
              <el-button v-else type="success" icon="el-icon-check" circle
                size="mini"></el-button>
              <span :class="{ 'todo-completed': item.isCompleted }">{{item.content}}</span>
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="发布任务" name="add">
        <el-card class="home-card" shadow="hover">
          <div slot="header">发布任务</div>
          <el-form ref="todoform" label-position="right" :model="todoform"
            :rules="todoRules" label-width="80px" :validate-on-rule-change="false">
            <el-form-item label="任务内容" prop="content">
              <el-input v-model="todoform.content" type="textarea" :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="是否重复">
              <el-switch v-model="todoform.repeat" @change="repeatChange"></el-switch>
            </el-form-item>
            <el-form-item label="重复类型" prop="repeatType">
              <el-radio-group v-model="todoform.repeatType" @change="repeatTypeChange">
                <el-radio v-for="item of todoRepeatType" :key="item.id"
                  :label="item.value" :disabled="!todoform.repeat">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="重复日期" prop="repeatVal">
              <el-select v-model="todoform.repeatVal" placeholder="请选择"
                :disabled="todoform.repeatType === 'd' || !todoform.repeatType">
                <el-option
                  v-for="i in todoRepeatDay"
                  :key="i"
                  :label="i | todoRepeatDayFilter(todoform.repeatType)"
                  :value="i">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('todoform')">创建</el-button>
              <el-button @click="resetForm('todoform')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="管理任务" name="management">
        <el-table :data="todos" border style="width: 100%">
          <el-table-column show-overflow-tooltip prop="content" label="任务">
          </el-table-column>
          <el-table-column show-overflow-tooltip prop="repeatType" label="重复类型">
            <template slot-scope="scope">
              {{ scope.row.repeatType | repeatTypeFilter(todoRepeatType) }}</template>
          </el-table-column>
          <el-table-column show-overflow-tooltip prop="repeatVal" label="重复日期">
            <template slot-scope="scope">
              {{ scope.row.repeatVal | todoRepeatDayFilter(scope.row.repeatType) }}</template>
          </el-table-column>
          <el-table-column show-overflow-tooltip label="发布时间" min-width="180">
            <template slot-scope="scope">
              {{ scope.row.id | dateformatNow(scope.row.id, 'hour') }}</template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button v-if="!scope.row.isrelease" type="primary"
                @click="allow(scope.row.id)" size="small">通过</el-button>
              <el-button @click="del(scope.row.id)" type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="datasource">
        <el-card class="home-card" shadow="hover">
          <div slot="header">数据源</div>
          <div>
            <el-button type="primary" size="small" @click="uploadOptions">导入任务数据</el-button>
            <el-tooltip effect="dark" content="会导出当前所有数据" placement="top"
              :open-delay="1000">
              <el-button type="success" size="small" @click="outloadOptions">导出任务数据</el-button>
            </el-tooltip>
            <input ref="fileUpload" style="display: none;"
              type="file" @change="fileChange" accept=".json" />
            <transition-group tag="ul" class="file-upload-info">
              <li v-for="item of uploadTodos" :key="item.id">
                <span>文件名：{{ item.label }}</span>
                <span>导入时间：{{ item.id | dateformatNow(item.id, 'hour') }}</span>
              </li>
            </transition-group>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';
import { createTodayTodos } from '@/common/js/util';

export default {
  name: 'PageTodo',
  data: () => ({
    todoform: {
      content: '',
      repeat: false,
      repeatType: '',
      repeatVal: null,
    },
    todoRules: {
      content: [
        { required: true, message: '请输入任务内容', trigger: 'blur' },
      ],
      repeatType: [],
      repeatVal: [],
    },
    activeTab: 'list',
    todoRepeatDay: 0,
  }),
  computed: {
    ...mapGetters(['releasedsTodo', 'todos', 'uploadTodos', 'todoRepeatType', 'todayTodo', 'todoDealHistory']),
  },
  filters: {
    todoRepeatDayFilter(val, type) {
      if (!val) {
        return val;
      }
      const weekArray = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      if (type === 'w') {
        return weekArray[val];
      } if (type === 'm') {
        return `${val} 号`;
      }
      return val;
    },
    repeatTypeFilter(val, arrs) {
      const filterItems = arrs.filter(el => el.value === val);
      return filterItems.length > 0 ? filterItems[0].label : val;
    },
  },
  mounted() {
    // this.createTodayTodo();
  },
  methods: {
    ...mapMutations(['addTodo', 'delTodo', 'allowTodo', 'batchProcessingTodo', 'addTodoFile', 'addTodayTodo', 'addTodoDealHistory', 'completeTodayTodoItem']),
    ...mapActions(['syncTodos', 'syncTodoDealHistory']),

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const todoformCopy = JSON.parse(JSON.stringify(this.todoform));
          if (!todoformCopy.repeat) {
            todoformCopy.repeatVal = this.$moment().format('YYYY-MM-DD');
          }
          this.addTodo(todoformCopy);
          this.syncTodos();
          this.resetForm(formName);
        }
        return false;
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.initForm();
    },

    allow(id) {
      this.allowTodo(id);
      this.syncTodos();
    },
    del(id) {
      this.delTodo(id);
      this.syncTodos();
    },

    uploadOptions() {
      this.$refs.fileUpload.click();
    },
    fileChange(event) {
      const newFile = event.target.files[0];
      if (newFile.name.indexOf('.json') >= 0 && newFile.name.slice(newFile.name.length - 5) === '.json') {
        const reader = new FileReader();
        reader.readAsText(event.target.files[0]);
        reader.onload = (val) => {
          const a = val.target.result;
          this.batchProcessingTodo(JSON.parse(a));
          this.syncTodos();
          this.addTodoFile({ label: newFile.name });
          this.$message.success('导入配置信息成功！');
        };
        reader.onerror = () => {
          this.$message.error('读取配置信息出错！');
        };
        return;
      }
      this.$message.error('上传文件的格式不符合规范！');
    },

    outloadOptions() {
      const eleLink = document.createElement('a');
      eleLink.download = `${this.$moment().format('YYYY-MM-DD HH:mm:ss')}-todos.json`;
      eleLink.style.display = 'none';

      // 字符串内容转为 blob 地址
      const val = { todos: [...this.todos] };
      const blob = new Blob([JSON.stringify(val, null, 2)], { type: 'application/json' });

      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
    },

    repeatTypeChange(val) {
      switch (val) {
        case 'm':
          this.todoRepeatDay = 31;
          break;
        case 'w':
          this.todoRepeatDay = 7;
          break;
        default:
          this.todoRepeatDay = 0;
          break;
      }
      if (val === 'm' || val === 'w') {
        this.todoRules = {
          ...this.todoRules,
          repeatVal: [
            { required: true, message: '请选择重复日期', trigger: 'blur' },
          ],
        };
      } else {
        this.todoRules = { ...this.todoRules, repeatVal: [] };
      }
    },
    repeatChange(val) {
      if (!val) {
        this.todoform = {
          ...this.todoform,
          repeatType: '',
          repeatVal: null,
        };
        this.todoRules = { ...this.todoRules, repeatType: [] };
        return;
      }
      this.todoRules = {
        ...this.todoRules,
        repeatType: [
          { required: true, message: '请选择重复类型', trigger: 'blur' },
        ],
      };
    },

    initForm() {
      this.todoform = {
        content: '',
        repeat: false,
        repeatType: '',
        repeatVal: null,
      };
      this.todoRules = {
        content: [
          { required: true, message: '请输入任务内容', trigger: 'blur' },
        ],
        repeatType: [],
        repeatVal: [],
      };
      this.todoRepeatDay = 0;
    },

    createTodayTodo() {
      const hasTodayTodo = this.todoDealHistory.filter(el => el.id === this.$moment().format('YYYY-MM-DD'));
      if (hasTodayTodo.length && hasTodayTodo[0].todoArray.length) {
        this.addTodayTodo(hasTodayTodo[0].todoArray);
        return;
      }
      const todayTodoArr = createTodayTodos(this.todos);
      this.addTodayTodo(todayTodoArr);
      this.addTodoDealHistory(todayTodoArr);
      // this.syncTodoDealHistory();
    },
    completeItem(id) {
      this.completeTodayTodoItem(id);
    },
  },
};
</script>
<style lang="stylus" scoped>
.app-page .home-card
  margin-bottom 20px

.card-main
  list-style none
  margin 0
  padding 0
  & li
    display flex
    align-items center
    margin-bottom 20px
    > span
      margin-left 20px
  & .card-others-info
    font-size 12px
    color #999

.link-single-line >>> .el-link--inner
  max-width 150px
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

.file-upload-info
  list-style none
  margin-bottom 0
  padding 0
  & li
    display flex
    justify-content space-between

.list-header-title
  display flex
  justify-content space-between
  align-items center

.todo-completed
  color #666
  text-decoration line-through
</style>
