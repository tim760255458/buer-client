<template>
  <el-card>
    <div v-if="cardTitle" slot="header">{{ cardTitle }}</div>
  </el-card>
</template>
<script>
export default {
  name: 'AppCard',
  data: () => ({}),
  props: {
    cardTitle: String,
  },
};
</script>
