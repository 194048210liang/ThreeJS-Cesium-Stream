<template>
  <span class="count-up" :style="{ color, fontSize, fontWeight }">
    {{ displayValue }}
    <span v-if="suffix" class="suffix">{{ suffix }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  duration?: number
  decimals?: number
  separator?: boolean
  prefix?: string
  suffix?: string
  color?: string
  fontSize?: string
  fontWeight?: string | number
}>(), {
  duration: 1500,
  decimals: 0,
  separator: true,
  prefix: '',
  suffix: '',
  color: '#00f0ff',
  fontSize: '28px',
  fontWeight: 700,
})

const displayValue = ref('')
let raf: number | null = null

function animateCount(from: number, to: number) {
  if (raf) cancelAnimationFrame(raf)
  const start = performance.now()
  const dur = props.duration

  function update(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / dur, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = from + (to - from) * eased

    let fixed = current.toFixed(props.decimals)
    if (props.separator && props.decimals === 0) {
      fixed = Number(fixed).toLocaleString()
    } else if (props.separator) {
      const [int, dec] = fixed.split('.')
      fixed = Number(int).toLocaleString() + '.' + dec
    }
    displayValue.value = props.prefix + fixed

    if (progress < 1) {
      raf = requestAnimationFrame(update)
    }
  }

  raf = requestAnimationFrame(update)
}

onMounted(() => animateCount(0, props.value))

watch(() => props.value, (newVal, oldVal) => {
  animateCount(oldVal ?? 0, newVal)
})
</script>

<style scoped>
.count-up {
  font-family: 'DIN', 'Courier New', monospace;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.suffix {
  font-size: 0.6em;
  opacity: 0.7;
  margin-left: 2px;
}
</style>
