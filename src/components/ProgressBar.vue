<template>
  <div class="progress-bar">
    <div class="bar-header">
      <span class="bar-label">{{ label }}</span>
      <span class="bar-value" :style="{ color: barColor }">{{ animatedPercent }}%</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" :style="{ width: animatedPercent + '%', background: barGradient }">
        <div class="bar-shine"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  percent: number
  label?: string
  color?: string
  colorEnd?: string
  duration?: number
}>(), {
  label: '',
  color: '#00d4ff',
  colorEnd: '#0066aa',
  duration: 1200,
})

const barColor = computed(() => props.color)
const barGradient = computed(() =>
  `linear-gradient(90deg, ${props.colorEnd}, ${props.color})`
)

const animatedPercent = ref(0)

function animate(target: number) {
  const from = animatedPercent.value
  const start = performance.now()
  const dur = props.duration

  function update(now: number) {
    const progress = Math.min((now - start) / dur, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedPercent.value = Math.round(from + (target - from) * eased)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

onMounted(() => animate(props.percent))
watch(() => props.percent, (v) => animate(v))
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bar-label {
  font-size: 12px;
  color: #8ab8e0;
}

.bar-value {
  font-family: 'DIN', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 600;
}

.bar-track {
  width: 100%;
  height: 6px;
  background: rgba(0, 80, 160, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  position: relative;
  transition: width 0.1s;
}

.bar-shine {
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: barShine 2.5s ease-in-out infinite;
}

@keyframes barShine {
  0% { left: -40%; }
  100% { left: 140%; }
}
</style>
