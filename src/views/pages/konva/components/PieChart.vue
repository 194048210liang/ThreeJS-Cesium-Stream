<template>
  <div ref="chartRef" class="chart-block"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{ propValue: any }>()
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let ro: ResizeObserver

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  const data = props.propValue || []
  chart.setOption({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.85)', borderColor: 'rgba(0,160,255,0.3)', textStyle: { color: '#c0d0e0' } },
    legend: { bottom: 10, textStyle: { color: '#7a8a9a' }, itemWidth: 12, itemHeight: 12 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      data,
      label: { color: '#7a8a9a', fontSize: 12 },
      labelLine: { lineStyle: { color: 'rgba(0,160,255,0.3)' } },
      itemStyle: { borderColor: '#0a1628', borderWidth: 2 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,160,255,0.5)' } },
    }],
    color: ['#00a0ff', '#0050b3', '#00d4ff', '#36cfc9', '#1890ff', '#597ef7'],
  })
}

watch(() => props.propValue, render, { deep: true })
onMounted(() => {
  render()
  ro = new ResizeObserver(() => chart?.resize())
  if (chartRef.value) ro.observe(chartRef.value)
})
onUnmounted(() => { chart?.dispose(); ro?.disconnect() })
</script>

<style scoped>
.chart-block { width: 100%; height: 100%; }
</style>
