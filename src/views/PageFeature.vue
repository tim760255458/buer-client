<template>
  <div class="app-page">
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :icon="activity.icon"
        :type="activity.type"
        :color="activity.color"
        :size="activity.size"
        placement="top"
        :timestamp="activity.timestamp">
        <el-card shadow="never">
          <p>{{activity.content}}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
<script>
export default {
  name: 'PageFeature',
  data: () => ({
    activities: [
      {
        content: '自动签到功能 进行中...',
        timestamp: '2019-12-19 v0.2',
        size: 'large',
        type: 'danger',
        icon: 'el-icon-more',
      }, {
        content: '任务清单功能',
        timestamp: '2019-12-19 v0.1',
        size: 'large',
        type: 'success',
        icon: 'el-icon-success',
      }, {
        content: '数据自动同步到 indexDB 功能；添加 feature list；',
        timestamp: '2019-12-18 v0.1',
        size: 'large',
        type: 'success',
        icon: 'el-icon-success',
      }, {
        content: '链接、便签功能；导入导出数据功能；',
        timestamp: '2019-12-17 v0.1',
        size: 'large',
        type: 'success',
        icon: 'el-icon-success',
      }, {
        content: '创建项目',
        timestamp: '2019-12-16 v0.1',
        size: 'large',
        type: 'info',
        icon: 'el-icon-circle-plus',
      },
    ],
  }),
};
</script>
