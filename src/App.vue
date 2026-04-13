<template>
  <div class="app">
    <Header v-if="showHeader" class="header" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/header.vue';

const route = useRoute();

// 只在非首页显示 Header
const showHeader = computed(() => {
  return route.path !== '/';
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.app {
  width: 100%;
  height: 100%;
  position: relative;

  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }
}
</style>
