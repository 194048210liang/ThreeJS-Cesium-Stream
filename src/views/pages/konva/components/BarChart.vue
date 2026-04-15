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
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.85)', borderColor: 'rgba(0,160,255,0.3)', textStyle: { color: '#c0d0e0' } },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(0,160,255,0.3)' } }, axisLabel: { color: '#7a8a9a' }, splitLine: { lineStyle: { color: 'rgba(0,160,255,0.08)' } } },
    yAxis: { type: 'category', data: data.map((d: any) => d.name), axisLine: { lineStyle: { color: 'rgba(0,160,255,0.3)' } }, axisLabel: { color: '#7a8a9a' } },
    series: [{ type: 'bar', data: data.map((d: any) => d.value), barWidth: 18, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#0050b3' }, { offset: 1, color: '#00a0ff' }]), borderRadius: [0, 4, 4, 0] } }],
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
