<template>
  <div class="app-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="链接列表" name="list">
        <el-card class="home-card" shadow="hover">
          <div slot="header">链接</div>
          <div class="card-main">
            <el-link :href="item.url" v-for="item of releaseds" :key="item.id"
              :target="item.target || '_blank'">{{ item.label }}</el-link>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="发布链接" name="add">
        <el-card class="home-card" shadow="hover">
          <div slot="header">发布链接</div>
          <el-form ref="linkform" label-position="left" :model="linkForm"
            :rules="linkRules" label-width="80px">
            <el-form-item label="链接" prop="url">
              <el-input v-model="linkForm.url"></el-input>
            </el-form-item>
            <el-form-item label="描述文本" prop="label">
              <el-input v-model="linkForm.label"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('linkform')">创建</el-button>
              <el-button @click="resetForm('linkform')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="管理链接" name="management">
        <el-table :data="tableCurrentLinks" border style="width: 100%;margin-bottom: 20px;">
          <el-table-column show-overflow-tooltip prop="url" label="链接">
            <template slot-scope="scope">
              <el-link :href="scope.row.url" class="link-single-line"
                :target="scope.row.target || '_blank'">{{ scope.row.url }}</el-link>
            </template>
          </el-table-column>
          <el-table-column show-overflow-tooltip prop="label" label="描述">
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
        <el-pagination background layout="prev, pager, next" :total="links.length"
          hide-on-single-page :page-size="linksPageSize" :current-page.sync="linksCurrentPage">
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
              <li v-for="item of uploadFiles" :key="item.id">
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
  name: 'PageHome',
  data: () => ({
    linkForm: {
      url: '',
      label: '',
    },
    linkRules: {
      url: [
        { required: true, message: '请输入链接 URL', trigger: 'blur' },
      ],
      label: [
        { required: true, message: '请输入描述 LABEL', trigger: 'blur' },
        {
          min: 2, max: 10, message: '描述文本在 2 到 10 个字', trigger: 'blur',
        },
      ],
    },
    activeTab: 'list',
    linksPageSize: 10,
    linksCurrentPage: 1,
  }),
  computed: {
    ...mapGetters(['releaseds', 'links', 'uploadFiles']),
    tableCurrentLinks() {
      return this.links
        .slice((this.linksCurrentPage - 1) * this.linksPageSize,
          this.linksCurrentPage * this.linksPageSize);
    },
  },
  mounted() {
    // this.queryTest();
  },
  methods: {
    ...mapMutations(['addLink', 'delLink', 'allowLink', 'batchProcessingLink', 'addFile']),
    ...mapActions(['syncLinks']),
    queryTest() {
      this.$axios.get('/today');
    },

    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addLink(this.linkForm);
          this.syncLinks();
          this.resetForm(formName);
        }
        return false;
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    allow(id) {
      this.allowLink(id);
      this.syncLinks();
    },
    del(id) {
      this.delLink(id);
      this.syncLinks();
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
          this.batchProcessingLink(JSON.parse(a));
          this.syncLinks();
          this.addFile({ label: newFile.name });
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
      eleLink.download = `${this.$moment().format('YYYY-MM-DD HH:mm:ss')}-options.json`;
      eleLink.style.display = 'none';

      // 字符串内容转为 blob 地址
      const val = { links: [...this.links] };
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
  & > a
    display inline-block
    margin-bottom 20px
    margin-right 40px
  & >>> .el-link
    font-size 16px

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
