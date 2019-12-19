<template>
  <div class="app-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="便签列表" name="list">
        <el-card class="home-card" shadow="hover">
          <div slot="header">便签</div>
          <el-row tag="ul" class="card-main">
            <el-col :span="24" v-for="item of currentNotes" tag="li" :key="item.id">
              <p>{{item.note}}</p>
              <p class="card-others-info">{{ item.id | dateformatNow(item.id, 'hour') }}</p>
              <el-divider></el-divider>
            </el-col>
          </el-row>
          <el-pagination background layout="prev, pager, next" :total="releasedsNote.length"
            hide-on-single-page :page-size="pageSize" :current-page.sync="currentPage">
          </el-pagination>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="发布便签" name="add">
        <el-card class="home-card" shadow="hover">
          <div slot="header">发布便签</div>
          <el-form ref="noteform" label-position="left" :model="noteform"
            :rules="noteRules" label-width="80px">
            <el-form-item label="内容" prop="note">
              <el-input v-model="noteform.note" type="textarea" :rows="4"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('noteform')">创建</el-button>
              <el-button @click="resetForm('noteform')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="管理便签" name="management">
        <el-table :data="tableCurrentNotes" border style="width: 100%;margin-bottom: 20px;">
          <el-table-column show-overflow-tooltip prop="note" label="便签">
          </el-table-column>
          <el-table-column show-overflow-tooltip label="发布时间">
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
        <el-pagination background layout="prev, pager, next" :total="notes.length"
          hide-on-single-page :page-size="tablePageSize" :current-page.sync="tableCurrentPage">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="datasource">
        <el-card class="home-card" shadow="hover">
          <div slot="header">数据源</div>
          <div>
            <el-button type="primary" size="small" @click="uploadOptions">导入数据</el-button>
            <el-tooltip effect="dark" content="会导出当前所有数据" placement="top"
              :open-delay="1000">
              <el-button type="success" size="small" @click="outloadOptions">导出数据</el-button>
            </el-tooltip>
            <input ref="fileUpload" style="display: none;"
              type="file" @change="fileChange" accept=".json" />
            <transition-group tag="ul" class="file-upload-info">
              <li v-for="item of uploadNoteFiles" :key="item.id">
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

export default {
  name: 'PageNote',
  data: () => ({
    noteform: {
      note: '',
    },
    noteRules: {
      note: [
        { required: true, message: '请输入便签内容', trigger: 'blur' },
      ],
    },
    activeTab: 'list',
    currentPage: 1,
    pageSize: 5,
    tablePageSize: 10,
    tableCurrentPage: 1,
  }),
  computed: {
    ...mapGetters(['releasedsNote', 'notes', 'uploadNoteFiles']),
    currentNotes() {
      return this.releasedsNote
        .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    },
    tableCurrentNotes() {
      return this.notes
        .slice((this.tableCurrentPage - 1) * this.tablePageSize,
          this.tableCurrentPage * this.tablePageSize);
    },
  },
  mounted() {
    // this.queryTest();
  },
  methods: {
    ...mapMutations(['addNote', 'delNote', 'allowNote', 'batchProcessingNote', 'addNoteFile']),
    ...mapActions(['syncNotes']),
    queryTest() {
      this.$axios.get('/today');
    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addNote(this.noteform);
          this.syncNotes();
          this.resetForm(formName);
        }
        return false;
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    allow(id) {
      this.allowNote(id);
      this.syncNotes();
    },
    del(id) {
      this.delNote(id);
      this.syncNotes();
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
          this.batchProcessingNote(JSON.parse(a));
          this.syncNotes();
          this.addNoteFile({ label: newFile.name });
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
      eleLink.download = `${this.$moment().format('YYYY-MM-DD HH:mm:ss')}-notes.json`;
      eleLink.style.display = 'none';

      // 字符串内容转为 blob 地址
      const val = { notes: [...this.notes] };
      const blob = new Blob([JSON.stringify(val, null, 2)], { type: 'application/json' });

      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
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
</style>
