<template>
  <span class="status-tag" :class="[type, { dot: showDot }]">
    <i v-if="showDot" class="tag-dot"></i>
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
  showDot?: boolean
}>(), {
  text: '',
  type: 'info',
  showDot: true,
})
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: 1px solid;
  transition: all 0.3s;

  &.primary {
    color: #00d4ff;
    border-color: rgba(0, 212, 255, 0.25);
    background: rgba(0, 212, 255, 0.08);
  }
  &.success {
    color: #00ff88;
    border-color: rgba(0, 255, 136, 0.25);
    background: rgba(0, 255, 136, 0.08);
  }
  &.warning {
    color: #ffaa00;
    border-color: rgba(255, 170, 0, 0.25);
    background: rgba(255, 170, 0, 0.08);
  }
  &.danger {
    color: #ff4466;
    border-color: rgba(255, 68, 102, 0.25);
    background: rgba(255, 68, 102, 0.08);
  }
  &.info {
    color: #8899bb;
    border-color: rgba(136, 153, 187, 0.2);
    background: rgba(136, 153, 187, 0.08);
  }
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-tag.success .tag-dot {
  background: #00ff88;
  box-shadow: 0 0 6px #00ff88;
  animation: dotPulse 2s infinite;
}
.status-tag.warning .tag-dot {
  background: #ffaa00;
  box-shadow: 0 0 6px #ffaa00;
  animation: dotPulse 2s infinite 0.5s;
}
.status-tag.danger .tag-dot {
  background: #ff4466;
  box-shadow: 0 0 6px #ff4466;
  animation: dotPulse 1.5s infinite;
}
.status-tag.primary .tag-dot {
  background: #00d4ff;
  box-shadow: 0 0 6px #00d4ff;
  animation: dotPulse 2s infinite 1s;
}
.status-tag.info .tag-dot {
  background: #8899bb;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
