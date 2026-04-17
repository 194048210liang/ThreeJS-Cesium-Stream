<template>
  <div class="app">
    <Header v-if="showHeader" :title="pageTitle" :subtitle="pageSubtitle" />
    <router-view class="page" :class="{ 'with-header': showHeader }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/header.vue'

const route = useRoute()

const showHeader = computed(() => {
  return route.path !== '/' && route.name !== 'not-found'
})

const pageTitle = computed(() => (route.meta?.title as string) || '')

const pageSubtitle = computed(() => (route.meta?.subtitle as string) || '')
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
  display: flex;
  flex-direction: column;
}

.page {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
