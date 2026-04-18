<template>
  <div class="visitor-dashboard">
    <!-- 背景 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 核心指标 -->
    <div class="kpi-bar">
      <div class="kpi-item" v-for="(kpi, i) in kpis" :key="i">
        <div class="kpi-glow" :style="{ background: kpi.glow }"></div>
        <div
          class="kpi-icon-wrap"
          :style="{ borderColor: kpi.color + '33', background: kpi.color + '10' }"
        >
          <span class="kpi-icon" v-html="kpi.icon"></span>
        </div>
        <div class="kpi-content">
          <span
            class="kpi-value"
            :style="{ color: kpi.color, textShadow: `0 0 20px ${kpi.color}44` }"
          >
            {{ kpi.ref() }}
          </span>
          <span class="kpi-label">{{ kpi.label }}</span>
        </div>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-btn"
          :class="{ active: activeFilter === tab.value }"
          @click="onFilterChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div v-if="activeFilter === 'custom'" class="date-picker-wrap">
        <el-date-picker
          v-model="customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          size="small"
          class="custom-date-picker"
          @change="onCustomDateChange"
        />
      </div>
    </div>

    <!-- 主体 -->
    <div class="dash-body">
      <!-- 左栏：地图 -->
      <div class="col col-left">
        <div class="panel map-panel">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.globe"></span>
            <span class="ph-dot cyan"></span>全球访客分布
          </div>
          <div class="panel-body" ref="mapChartRef"></div>
        </div>
      </div>

      <!-- 右栏 -->
      <div class="col col-right">
        <!-- 页面排行 -->
        <div class="panel">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.rank"></span>
            <span class="ph-dot"></span>页面热度排行
          </div>
          <div class="panel-body" ref="rankChartRef"></div>
        </div>
        <!-- 访问趋势 -->
        <div class="panel trend-panel">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.trend"></span>
            <span class="ph-dot green"></span>访问趋势
          </div>
          <div class="panel-body" ref="trendChartRef"></div>
        </div>
        <!-- 最近访问 -->
        <div class="panel table-panel">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.clock"></span>
            <span class="ph-dot purple"></span>最近访问记录
          </div>
          <div class="panel-body table-body">
            <el-table
              :data="recentVisits"
              style="width: 100%"
              height="100%"
              :header-cell-style="headerStyle"
              :cell-style="cellStyle"
              stripe
            >
              <el-table-column prop="time" label="时间" width="150" />
              <el-table-column prop="page" label="页面" />
              <el-table-column prop="ip" label="IP" width="280" />
              <el-table-column prop="country" label="地区" />
              <el-table-column prop="region" label="省份">
                <template #default="{ row }">{{ row.region || '未知' }}</template>
              </el-table-column>
              <el-table-column prop="browser" label="浏览器" />
            </el-table>
            <div v-if="isLoadingMore" class="load-more-hint">加载中...</div>
            <div v-else-if="recentHasMore" class="load-more-hint">
              已加载 {{ recentVisits.length }} 条，滚动加载更多...
            </div>
            <div v-else-if="recentTotal > recentPageSize" class="load-more-hint done">
              已加载全部 {{ recentVisits.length }} 条记录
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getVisitorStats } from '@/api/visitor'

// ============ 查询条件 ============
const filterTabs = [
  { label: '今天', value: 'day' },
  { label: '近7天', value: 'week' },
  { label: '自定义', value: 'custom' },
]
const activeFilter = ref('week')
const customRange = ref<[string, string]>(['', ''])

function getDateRange(mode: string): { start: string; end: string } {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const end = fmt(now)
  if (mode === 'day') return { start: end, end }
  if (mode === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return { start: fmt(d), end }
  }
  if (mode === 'custom' && customRange.value[0]) {
    return { start: customRange.value[0], end: customRange.value[1] || end }
  }
  return { start: end, end }
}

async function onFilterChange(mode: string) {
  activeFilter.value = mode
  if (mode !== 'custom') await refreshData()
}

async function onCustomDateChange() {
  if (customRange.value[0] && customRange.value[1]) await refreshData()
}

async function refreshData() {
  await loadData()
  updateAllCharts()
}

function updateAllCharts() {
  if (charts.trend) updateTrendChart(charts.trend)
  if (charts.rank) updateRankChart(charts.rank)
}

// ============ SVG 图标 ============
const iconSvg = {
  globe:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54A1.99 1.99 0 0 0 16 16h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41A7.997 7.997 0 0 1 20 12c0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  trend:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>',
  rank: '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg>',
  device:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
}

// ============ 响应式数据 ============
const stats = reactive({ todayPV: 0, todayUV: 0, totalPV: 0, totalUV: 0 })
const geoData = ref<{ name: string; value: number }[]>([])
const pageRank = ref<{ name: string; value: number }[]>([])
const trendData = ref<{ dates: string[]; pv: number[]; uv: number[] }>({
  dates: [],
  pv: [],
  uv: [],
})
const recentVisits = ref<
  { time: string; page: string; ip: string; country: string; region: string; browser: string }[]
>([])

// ============ 表格后端分页 ============
const recentOffset = ref(0)
const recentTotal = ref(0)
const recentPageSize = 50
const isLoadingMore = ref(false)
const recentHasMore = computed(() => recentVisits.value.length < recentTotal.value)

let tableScrollEl: HTMLElement | null = null

function setupTableScroll() {
  // el-table height 模式下滚动容器是 .el-scrollbar__wrap
  tableScrollEl = document.querySelector('.table-body .el-scrollbar__wrap')
  if (!tableScrollEl) {
    // 兜底：再试 .el-table__body-wrapper
    tableScrollEl = document.querySelector('.table-body .el-table__body-wrapper')
  }
  if (!tableScrollEl) return
  console.log('[scroll] 监听表格滚动', tableScrollEl.className)
  tableScrollEl.addEventListener('scroll', onTableScroll, { passive: true })
}

function onTableScroll() {
  if (!tableScrollEl || !recentHasMore.value || isLoadingMore.value) return
  const { scrollTop, scrollHeight, clientHeight } = tableScrollEl
  if (scrollTop + clientHeight >= scrollHeight - 30) {
    console.log('[scroll] 触发加载更多', {
      scrollTop,
      scrollHeight,
      clientHeight,
      offset: recentOffset.value,
      total: recentTotal.value,
    })
    loadMoreRecent()
  }
}

function formatVisit(v: any) {
  let timeStr = ''
  if (v.created_at) {
    const d = new Date(v.created_at.replace(' ', 'T') + 'Z')
    const cn = new Date(d.getTime() + 8 * 60 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    timeStr = `${cn.getUTCFullYear()}-${pad(cn.getUTCMonth() + 1)}-${pad(cn.getUTCDate())} ${pad(cn.getUTCHours())}:${pad(cn.getUTCMinutes())}:${pad(cn.getUTCSeconds())}`
  }
  return {
    time: timeStr,
    page: pageNameMap[v.page] || v.page,
    ip: v.ip ? v.ip.replace(/(\d+\.\d+)\.\d+\.\d+/, '$1.***.***') : '-',
    country: v.country || '-',
    region: v.region || '',
    browser: v.browser || '-',
  }
}

async function loadMoreRecent() {
  if (isLoadingMore.value || !recentHasMore.value) return
  isLoadingMore.value = true
  try {
    const range = getDateRange(activeFilter.value)
    const params: Record<string, string | number> = {
      limit: recentPageSize,
      offset: recentOffset.value,
    }
    if (range.start) params.start = range.start
    if (range.end) params.end = range.end

    const res = (await getVisitorStats(params)) as any
    if (res.recent?.length) {
      recentVisits.value.push(...res.recent.map(formatVisit))
      recentOffset.value += res.recent.length
    }
    recentTotal.value = res.recentTotal || 0
  } catch (e) {
    console.error('加载更多失败:', e)
  } finally {
    isLoadingMore.value = false
  }
}

// 国家代码 → 名称 + 经纬度 + world.json中的名称
const countryMap: Record<string, { name: string; geoName: string; coords: [number, number] }> = {
  CN: { name: '中国', geoName: 'China', coords: [104.195, 35.86] },
  US: { name: '美国', geoName: 'United States of America', coords: [-95.713, 37.09] },
  JP: { name: '日本', geoName: 'Japan', coords: [138.253, 36.204] },
  KR: { name: '韩国', geoName: 'South Korea', coords: [127.978, 37.566] },
  GB: { name: '英国', geoName: 'United Kingdom', coords: [-1.265, 53.442] },
  DE: { name: '德国', geoName: 'Germany', coords: [10.451, 51.166] },
  FR: { name: '法国', geoName: 'France', coords: [2.2137, 46.2276] },
  BR: { name: '巴西', geoName: 'Brazil', coords: [-51.9253, -14.235] },
  IN: { name: '印度', geoName: 'India', coords: [78.9629, 20.5937] },
  CA: { name: '加拿大', geoName: 'Canada', coords: [-106.3468, 56.1304] },
  AU: { name: '澳大利亚', geoName: 'Australia', coords: [133.7751, -25.2744] },
  RU: { name: '俄罗斯', geoName: 'Russia', coords: [105.3188, 61.524] },
  SG: { name: '新加坡', geoName: 'Singapore', coords: [103.8198, 1.3521] },
  MY: { name: '马来西亚', geoName: 'Malaysia', coords: [101.9758, 4.2105] },
  TH: { name: '泰国', geoName: 'Thailand', coords: [100.9925, 15.87] },
  VN: { name: '越南', geoName: 'Vietnam', coords: [107.8443, 14.0583] },
  ID: { name: '印度尼西亚', geoName: 'Indonesia', coords: [-0.7893, 113.9213] },
  TW: { name: '中国台湾', geoName: 'Taiwan', coords: [120.96, 23.7] },
  HK: { name: '中国香港', geoName: 'Hong Kong S.A.R.', coords: [114.17, 22.32] },
  Unknown: { name: '未知', geoName: '', coords: [0, 0] },
}

// 页面路径 → 中文名
const pageNameMap: Record<string, string> = {
  '/': '首页',
  '/cesium': 'Cesium',
  '/threejs': 'Three.js',
  '/components': '组件展示',
  '/communication': '访客统计',
  '/websocket': 'WebSocket 大屏',
  '/konva': '低代码编辑器',
}

// ============ 加载真实数据 ============
async function loadData() {
  try {
    const range = getDateRange(activeFilter.value)
    const filterParams: Record<string, string | number> = {}
    if (range.start) filterParams.start = range.start
    if (range.end) filterParams.end = range.end

    // 统计 + 图表数据：一次请求，不传分页参数
    const res = (await getVisitorStats(filterParams)) as any

    if (res.stats) {
      stats.todayPV = res.stats.todayPV || 0
      stats.todayUV = res.stats.todayUV || 0
      stats.totalPV = res.stats.totalPV || 0
      stats.totalUV = res.stats.totalUV || 0
    }

    if (res.geo?.length) {
      const countryAgg = new Map<string, number>()
      for (const row of res.geo) {
        const key = row.country || 'Unknown'
        countryAgg.set(key, (countryAgg.get(key) || 0) + row.value)
      }
      geoData.value = [...countryAgg.entries()]
        .map(([code, value]) => ({ name: code, value }))
        .sort((a, b) => b.value - a.value)
    }

    if (res.pages?.length) {
      pageRank.value = res.pages
        .map((p: any) => ({
          name: pageNameMap[p.page] || p.page,
          value: p.value,
        }))
        .sort((a: any, b: any) => b.value - a.value)
    } else if (res.recent?.length) {
      const pm = new Map<string, number>()
      for (const v of res.recent) {
        const key = pageNameMap[v.page] || v.page || '未知页面'
        pm.set(key, (pm.get(key) || 0) + 1)
      }
      pageRank.value = [...pm.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    }

    if (res.trend?.length) {
      trendData.value = {
        dates: res.trend.map((t: any) => t.date?.slice(5) || ''),
        pv: res.trend.map((t: any) => t.pv || 0),
        uv: res.trend.map((t: any) => t.uv || 0),
      }
    }

    // 表格：重置分页，加载第一页
    recentTotal.value = res.recentTotal || 0
    recentOffset.value = 0
    recentVisits.value = (res.recent || []).map(formatVisit)
    recentOffset.value = (res.recent || []).length
  } catch (e) {
    console.error('加载访客数据失败:', e)
  }
}

// ============ 表格样式 ============
const headerStyle = () => ({
  background: 'rgba(0, 80, 200, 0.15)',
  color: '#7ab8ff',
  borderColor: 'rgba(0, 120, 255, 0.12)',
  fontSize: '12px',
  padding: '8px 0',
})
const cellStyle = () => ({
  color: '#c0d8f0',
  borderColor: 'rgba(0, 120, 255, 0.08)',
  fontSize: '12px',
  padding: '6px 0',
})

// ============ KPI ============
const kpis = [
  {
    label: '今日浏览量 (PV)',
    color: '#00f0ff',
    glow: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
    ref: () => stats.todayPV.toLocaleString(),
  },
  {
    label: '今日访客数 (UV)',
    color: '#00ff88',
    glow: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    ref: () => stats.todayUV.toLocaleString(),
  },
  {
    label: '累计浏览量 (PV)',
    color: '#ffaa00',
    glow: 'radial-gradient(circle, rgba(255,170,0,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
    ref: () => stats.totalPV.toLocaleString(),
  },
  {
    label: '累计访客数 (UV)',
    color: '#ff4466',
    glow: 'radial-gradient(circle, rgba(255,68,102,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    ref: () => stats.totalUV.toLocaleString(),
  },
]

// ============ Refs ============
const mapChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const rankChartRef = ref<HTMLElement | null>(null)

let charts: Record<string, ECharts | null> = {}

// ============ ECharts 公共配色 ============
const echartsTextColor = '#7a8a9a'
const echartsBorderColor = 'rgba(0, 120, 255, 0.12)'

// ============ 初始化图表 ============
function initMapChart() {
  if (!mapChartRef.value) return
  const chart = echarts.init(mapChartRef.value)
  charts.map = chart

  fetch('/world.json')
    .then((r) => r.json())
    .then((worldJson) => {
      echarts.registerMap('world', worldJson)
      updateMapChart(chart)
    })
}

function updateMapChart(chart: ECharts) {
  const scatterData = geoData.value
    .filter((d) => countryMap[d.name]?.coords)
    .map((d) => ({
      name: countryMap[d.name]?.name || d.name,
      value: [...(countryMap[d.name]?.coords || [0, 0]), d.value],
    }))

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(4, 12, 36, 0.9)',
      borderColor: 'rgba(0, 160, 255, 0.3)',
      textStyle: { color: '#c0d8f0', fontSize: 12 },
      formatter: (p: any) => {
        if (p.seriesType === 'effectScatter') return `${p.name}<br/>访问量: ${p.value[2]}`
        return p.name
      },
    },
    geo: {
      map: 'world',
      roam: true,
      zoom: 1.2,
      label: { show: false },
      itemStyle: {
        areaColor: 'rgba(0, 40, 80, 0.6)',
        borderColor: 'rgba(0, 120, 255, 0.25)',
        borderWidth: 0.6,
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(0, 100, 200, 0.4)',
          borderColor: '#00a0ff',
          borderWidth: 1,
        },
        label: { show: false },
      },
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData.length ? scatterData : [],
        symbolSize: (val: number[]) => Math.max(8, Math.sqrt(val[2]) * 0.5),
        rippleEffect: { brushType: 'stroke', scale: 5, period: 3 },
        showEffectOn: 'render',
        label: {
          show: true,
          formatter: (params: any) => `${params.name} ${params.value[2]}次`,
          position: 'right',
          color: '#c0d8f0',
          fontSize: 11,
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowBlur: 4,
        },
        itemStyle: {
          color: (params: any) => {
            const v = params.value[2]
            if (v > 500) return '#00f0ff'
            if (v > 100) return '#00ff88'
            return '#ffaa00'
          },
          shadowBlur: 15,
          shadowColor: 'rgba(0, 180, 255, 0.6)',
        },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#fff' },
          itemStyle: { shadowBlur: 25, shadowColor: 'rgba(0, 240, 255, 0.8)' },
        },
      },
    ],
  })
}

function initTrendChart() {
  if (!trendChartRef.value) return
  charts.trend = echarts.init(trendChartRef.value)
  updateTrendChart(charts.trend)
}

function updateTrendChart(chart: ECharts) {
  const range = getDateRange(activeFilter.value)
  const label =
    activeFilter.value === 'day'
      ? '今日'
      : activeFilter.value === 'week'
        ? '近7天'
        : `${range.start.slice(5)} 至 ${range.end.slice(5)}`
  chart.setOption({
    title: {
      text: label,
      right: 10,
      top: 2,
      textStyle: { color: '#5a7090', fontSize: 11, fontWeight: 'normal' },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 12, 36, 0.9)',
      borderColor: 'rgba(0, 160, 255, 0.3)',
      textStyle: { color: '#c0d8f0', fontSize: 12 },
    },
    legend: {
      data: ['浏览量', '访客数'],
      right: 60,
      top: 2,
      textStyle: { color: echartsTextColor, fontSize: 10 },
      itemWidth: 14,
      itemHeight: 2,
    },
    grid: { left: 40, right: 15, top: 32, bottom: 24 },
    xAxis: {
      type: 'category',
      data: trendData.value.dates,
      axisLine: { lineStyle: { color: echartsBorderColor } },
      axisLabel: { color: echartsTextColor, fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 120, 255, 0.06)' } },
      axisLabel: { color: echartsTextColor, fontSize: 10 },
    },
    series: [
      {
        name: '浏览量',
        type: 'line',
        smooth: true,
        data: trendData.value.pv,
        lineStyle: { color: '#00f0ff', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 240, 255, 0.25)' },
            { offset: 1, color: 'rgba(0, 240, 255, 0.02)' },
          ]),
        },
        itemStyle: { color: '#00f0ff' },
        symbol: 'circle',
        symbolSize: 4,
      },
      {
        name: '访客数',
        type: 'line',
        smooth: true,
        data: trendData.value.uv,
        lineStyle: { color: '#00ff88', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 136, 0.2)' },
            { offset: 1, color: 'rgba(0, 255, 136, 0.02)' },
          ]),
        },
        itemStyle: { color: '#00ff88' },
        symbol: 'circle',
        symbolSize: 4,
      },
    ],
  })
}

function initRankChart() {
  if (!rankChartRef.value) return
  charts.rank = echarts.init(rankChartRef.value)
  updateRankChart(charts.rank)
}

function updateRankChart(chart: ECharts) {
  const sorted = [...pageRank.value].sort((a, b) => a.value - b.value)
  chart.setOption({
    grid: { left: 90, right: 45, top: 5, bottom: 5, containLabel: false },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 120, 255, 0.06)' } },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8aa0b8', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => d.value),
        barWidth: 10,
        barGap: '80%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0050b3' },
            { offset: 1, color: '#00a0ff' },
          ]),
        },
        label: {
          show: true,
          position: 'right',
          color: '#00c8ff',
          fontSize: 11,
          formatter: '{c}',
        },
      },
    ],
  })
}

// ============ Resize ============
let ro: ResizeObserver
let resizeTimer: ReturnType<typeof setTimeout> | null = null
function setupResize() {
  ro = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      Object.values(charts).forEach((c) => c?.resize())
    }, 100)
  })
  const container = document.querySelector('.visitor-dashboard')
  if (container) ro.observe(container)
}

// ============ 生命周期 ============
onMounted(async () => {
  await loadData()
  await nextTick()
  setTimeout(() => {
    initMapChart()
    initTrendChart()
    initRankChart()
    setupResize()
    setupTableScroll()
  }, 100)
})

onUnmounted(() => {
  Object.values(charts).forEach((c) => c?.dispose())
  ro?.disconnect()
  if (resizeTimer) clearTimeout(resizeTimer)
  if (tableScrollEl) tableScrollEl.removeEventListener('scroll', onTableScroll)
})
</script>

<style lang="scss" scoped>
.visitor-dashboard {
  height: 100vh;
  background: #040818;
  color: #c0d8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

// ====== 背景 ======
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 80, 200, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 80, 200, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
.bg-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  &.bg-glow-1 {
    top: -200px;
    left: -100px;
    background: rgba(0, 80, 255, 0.08);
  }
  &.bg-glow-2 {
    bottom: -200px;
    right: -100px;
    background: rgba(0, 180, 255, 0.06);
  }
}

// ====== KPI 条 ======
.kpi-bar {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  position: relative;
  z-index: 2;
}
.kpi-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(0, 40, 100, 0.15);
  border: 1px solid transparent;
  border-image: linear-gradient(
      135deg,
      rgba(0, 180, 255, 0.45),
      rgba(0, 120, 255, 0.2) 30%,
      rgba(0, 120, 255, 0.2) 70%,
      rgba(0, 180, 255, 0.45)
    )
    1;
  border-radius: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  // 用 outline + clip-path 模拟圆角边框
  outline: none;
  filter: drop-shadow(0 0 0.5px rgba(0, 120, 255, 0.08));
  &:hover {
    background: rgba(0, 50, 120, 0.25);
    filter: drop-shadow(0 0 8px rgba(0, 160, 255, 0.15));
  }
  // 用伪元素做圆角背景遮罩
  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: rgba(4, 8, 24, 0.92);
    border-radius: 7px;
    z-index: -1;
  }
}
.kpi-glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  pointer-events: none;
}
.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon {
  color: #00a0ff;
}
.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kpi-value {
  font-family: 'DIN', 'Courier New', monospace;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
}
.kpi-label {
  font-size: 12px;
  color: #5a7090;
  letter-spacing: 1px;
}

// ====== 主体布局 ======
.dash-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 0 24px 16px;
  min-height: 0;
  position: relative;
  z-index: 2;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.col-left {
  flex: 1.3;
}
.col-right {
  flex: 0.8;
}
.col-right .panel {
  flex: 1;
  min-height: 0;
}

// ====== 面板 ======
.panel {
  background: rgba(4, 8, 24, 0.85);
  border: 1px solid transparent;
  border-image: linear-gradient(
      160deg,
      rgba(0, 180, 255, 0.5),
      rgba(0, 120, 255, 0.25) 30%,
      rgba(0, 120, 255, 0.25) 70%,
      rgba(0, 140, 255, 0.4)
    )
    1;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  filter: drop-shadow(0 0 0.5px rgba(0, 120, 255, 0.06));
  transition: filter 0.3s;
  &:hover {
    filter: drop-shadow(0 0 10px rgba(0, 140, 255, 0.12));
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.5), transparent);
    z-index: 1;
  }
  // 圆角内背景遮罩
  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: rgba(4, 8, 24, 0.88);
    border-radius: 7px;
    z-index: 0;
  }
}
.map-panel {
  flex: 1;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #a0c0e0;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(0, 120, 255, 0.06);
  position: relative;
  z-index: 1;
}
.ph-icon {
  color: #0088ff;
  display: flex;
}
.ph-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a0ff;
  box-shadow: 0 0 6px rgba(0, 160, 255, 0.5);
  &.cyan {
    background: #00f0ff;
    box-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
  }
  &.green {
    background: #00ff88;
    box-shadow: 0 0 6px rgba(0, 255, 136, 0.5);
  }
  &.gold {
    background: #ffaa00;
    box-shadow: 0 0 6px rgba(255, 170, 0, 0.5);
  }
  &.purple {
    background: #8866ff;
    box-shadow: 0 0 6px rgba(136, 102, 255, 0.5);
  }
  &.warn {
    background: #ff8800;
    box-shadow: 0 0 6px rgba(255, 136, 0, 0.5);
  }
  &.red {
    background: #ff4466;
    box-shadow: 0 0 6px rgba(255, 68, 102, 0.5);
  }
}

.panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

// ====== 查询条件 ======
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px 12px;
  position: relative;
  z-index: 2;
}
.filter-tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 30, 80, 0.3);
  border: 1px solid rgba(0, 120, 255, 0.15);
  border-radius: 6px;
  padding: 3px;
}
.filter-btn {
  padding: 5px 16px;
  font-size: 12px;
  color: #7a8a9a;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.5px;
  &:hover {
    color: #a0c0e0;
  }
  &.active {
    background: rgba(0, 140, 255, 0.2);
    color: #00d4ff;
    box-shadow: 0 0 8px rgba(0, 160, 255, 0.15);
  }
}

// ====== 日期选择器 ======
.date-picker-wrap {
  width: 220px;
  flex-shrink: 0;
}
.custom-date-picker {
  width: 100% !important;
  :deep(.el-input__wrapper) {
    background: #0a1a3a !important;
    border: 1px solid rgba(0, 120, 255, 0.15) !important;
    box-shadow: none !important;
    border-radius: 6px;
    padding: 4px 11px;
    &:hover,
    &.is-focus {
      border-color: rgba(0, 160, 255, 0.4) !important;
    }
  }
  :deep(.el-input__inner) {
    color: #a0c0e0 !important;
    font-size: 12px;
    letter-spacing: 0.5px;
    &::placeholder {
      color: #5a7090 !important;
    }
  }
  :deep(.el-range-separator) {
    color: #5a7090 !important;
    font-size: 12px;
  }
  :deep(.el-range-input) {
    color: #a0c0e0 !important;
    background: transparent !important;
    font-size: 12px;
    &::placeholder {
      color: #5a7090 !important;
    }
  }
  :deep(.el-icon) {
    color: #5a7090 !important;
  }
  // 弹出面板样式
  :deep(.el-picker__popper) {
    background: rgba(4, 12, 36, 0.95) !important;
    border: 1px solid rgba(0, 120, 255, 0.25) !important;
    border-radius: 8px;
    .el-picker-panel__body {
      color: #a0c0e0;
    }
    .el-date-picker__header-label,
    .el-date-picker__prev-btn,
    .el-date-picker__next-btn {
      color: #a0c0e0 !important;
    }
    .el-date-table th {
      color: #5a7090;
      border-bottom-color: rgba(0, 120, 255, 0.1);
    }
    .el-date-table td .el-date-table-cell__text {
      color: #8aa0b8;
    }
    .el-date-table td.today .el-date-table-cell__text {
      color: #00d4ff !important;
    }
    .el-date-table td.available:hover .el-date-table-cell__text {
      background: rgba(0, 140, 255, 0.2);
      color: #00d4ff;
    }
    .el-date-table td.in-range .el-date-table-cell {
      background: rgba(0, 100, 200, 0.15) !important;
    }
    .el-date-table td.start-date .el-date-table-cell__text,
    .el-date-table td.end-date .el-date-table-cell__text {
      background: rgba(0, 140, 255, 0.3) !important;
      color: #fff !important;
    }
  }
}

// ====== 表格 ======
.table-body {
  flex: 1;
  min-height: 0;
  padding: 0 8px 8px;
  overflow: hidden;
  // 滚动条美化
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 30, 60, 0.2);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 120, 255, 0.3);
    border-radius: 2px;
    &:hover {
      background: rgba(0, 120, 255, 0.5);
    }
  }
  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-row-hover-bg-color: rgba(0, 80, 200, 0.12);
    --el-table-border-color: rgba(0, 120, 255, 0.08);
  }
  :deep(.el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: rgba(0, 40, 100, 0.1);
  }
  :deep(.el-table__empty-text) {
    color: #5a7090;
  }
}

// ====== 加载更多提示 ======
.load-more-hint {
  text-align: center;
  padding: 6px 0;
  font-size: 11px;
  color: #5a7090;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  &.done {
    color: #3a5a70;
  }
}

// ====== 响应式 ======
@media (max-width: 900px) {
  .dash-body {
    flex-direction: column;
  }
  .kpi-bar {
    flex-wrap: wrap;
  }
  .kpi-item {
    min-width: 45%;
  }
}
</style>
