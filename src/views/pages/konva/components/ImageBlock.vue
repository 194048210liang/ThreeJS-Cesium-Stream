<template>
  <div class="image-block">
    <img :src="propValue?.url || 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'" :style="{ objectFit: propValue?.fit || 'cover' }" draggable="false" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ propValue: any }>()
</script>

<style scoped>
.image-block {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.image-block img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 4px;
}
</style>
