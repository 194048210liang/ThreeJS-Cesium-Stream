<template>
  <div class="border-card" :class="{ hoverable }">
    <div class="card-glow"></div>
    <div class="card-border"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
    <div class="card-body">
      <div v-if="title" class="card-title">
        <span class="title-icon"></span>
        <span>{{ title }}</span>
      </div>
      <div class="card-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  hoverable?: boolean
}>(), {
  hoverable: true,
})
</script>

<style lang="scss" scoped>
.border-card {
  position: relative;
  background: rgba(8, 16, 40, 0.85);
  border-radius: 8px;
  overflow: visible;

  // 外层背景 + 内切边框
  .card-border {
    position: absolute;
    inset: 0;
    border-radius: 8px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(0, 160, 255, 0.3),
      rgba(0, 80, 200, 0.1) 40%,
      rgba(0, 120, 255, 0.2) 70%,
      rgba(0, 180, 255, 0.3)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    transition: all 0.4s;
  }

  // hover 发光
  &.hoverable:hover .card-border {
    background: linear-gradient(135deg,
      rgba(0, 200, 255, 0.5),
      rgba(0, 100, 255, 0.2) 40%,
      rgba(0, 160, 255, 0.4) 70%,
      rgba(0, 220, 255, 0.5)
    );
  }

  // 顶部微光
  .card-glow {
    position: absolute;
    top: -1px;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.6), transparent);
    pointer-events: none;
  }

  // 四角
  .corner {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 2;
    pointer-events: none;

    &.tl { top: -1px; left: -1px; border-top: 2px solid rgba(0, 200, 255, 0.6); border-left: 2px solid rgba(0, 200, 255, 0.6); border-radius: 2px 0 0 0; }
    &.tr { top: -1px; right: -1px; border-top: 2px solid rgba(0, 200, 255, 0.6); border-right: 2px solid rgba(0, 200, 255, 0.6); border-radius: 0 2px 0 0; }
    &.bl { bottom: -1px; left: -1px; border-bottom: 2px solid rgba(0, 200, 255, 0.6); border-left: 2px solid rgba(0, 200, 255, 0.6); border-radius: 0 0 0 2px; }
    &.br { bottom: -1px; right: -1px; border-bottom: 2px solid rgba(0, 200, 255, 0.6); border-right: 2px solid rgba(0, 200, 255, 0.6); border-radius: 0 0 2px 0; }
  }

  .card-body {
    position: relative;
    z-index: 1;
    padding: 16px;
    height: 100%;
    overflow: hidden;
    border-radius: 7px;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #a0c8f0;
    letter-spacing: 1px;
  }

  .title-icon {
    width: 3px;
    height: 14px;
    background: linear-gradient(180deg, #00d4ff, #0066aa);
    border-radius: 2px;
    flex-shrink: 0;
  }

  .card-content {
    color: #b0d0ff;
  }
}
</style>
