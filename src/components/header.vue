<template>
  <div class="container">
    <div class="header-content">
      <el-button type="primary" :plain="true" @click="goBack" class="back-button">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </el-button>
      <div class="header-title" v-if="title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();
const props = defineProps<{
  title?: string;
}>();

const goBack = () => {
  router.go(-1);
};
</script>

<style lang="scss" scoped>
.container {
  height: 60px;
  background-color: rgba(13, 13, 13, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    width: 100%;

    .back-button {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
