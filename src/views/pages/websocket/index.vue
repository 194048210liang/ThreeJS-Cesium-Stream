<template>
  <div class="dashboard">
    <!-- 背景粒子网格 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 顶部标题 -->
    <header class="dash-header">
      <div class="header-deco header-deco-left"></div>
      <div class="header-core">
        <div class="header-l">
          <div class="conn-indicator" :class="{ on: wsConnected }">
            <span class="conn-dot"></span>
            <span class="conn-text">WS</span>
          </div>
          <div class="conn-indicator sse" :class="{ on: sseConnected }">
            <span class="conn-dot"></span>
            <span class="conn-text">SSE</span>
          </div>
        </div>
        <div class="header-title-wrap">
          <svg class="title-plane" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <h1 class="header-title">
            <span class="t-char" v-for="(c, i) in '中国民航实时数据监控中心'" :key="i" :style="{ animationDelay: i * 0.08 + 's' }">{{ c }}</span>
          </h1>
          <svg class="title-plane flip" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
        <div class="header-r">
          <div class="digital-clock">{{ currentTime }}</div>
        </div>
      </div>
      <div class="header-deco header-deco-right"></div>
    </header>

    <!-- 核心指标条 -->
    <div class="kpi-bar">
      <div class="kpi-item" v-for="(kpi, i) in kpis" :key="i">
        <div class="kpi-glow" :style="{ background: kpi.glow }"></div>
        <div class="kpi-icon-wrap" :style="{ borderColor: kpi.color + '33', background: kpi.color + '10' }">
          <span class="kpi-icon" v-html="kpi.icon"></span>
        </div>
        <div class="kpi-content">
          <span class="kpi-value" :style="{ color: kpi.color, textShadow: `0 0 20px ${kpi.color}44` }">
            {{ kpi.format(kpi.ref()) }}
          </span>
          <span class="kpi-label">{{ kpi.label }}</span>
        </div>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="dash-body">
      <!-- 左栏 -->
      <div class="col col-left">
        <div class="panel" style="flex: 1.1">
          <div class="panel-head"><span class="ph-dot"></span>航班实时状态</div>
          <div class="panel-body" ref="statusChartRef"></div>
        </div>
        <div class="panel" style="flex: 1">
          <div class="panel-head"><span class="ph-dot warn"></span>机场吞吐 TOP10</div>
          <div class="panel-body" ref="airportChartRef"></div>
        </div>
        <div class="panel" style="flex: 0.85">
          <div class="panel-head"><span class="ph-dot purple"></span>航司综合能力</div>
          <div class="panel-body" ref="airlineChartRef"></div>
        </div>
      </div>

      <!-- 中栏 -->
      <div class="col col-center">
        <div class="panel map-panel">
          <div class="panel-head">
            <span class="ph-dot cyan"></span>全国实时航线态势
            <span class="ph-tag">WebSocket</span>
          </div>
          <div class="panel-body" ref="mapChartRef"></div>
        </div>
        <div class="center-bottom-row">
          <div class="mini-card" v-for="(m, i) in miniCards" :key="i">
            <div class="mc-icon" v-html="m.icon" :style="{ color: m.color }"></div>
            <div class="mc-info">
              <span class="mc-val" :style="{ color: m.color }">{{ m.ref() }}</span>
              <span class="mc-label">{{ m.label }}</span>
            </div>
            <div class="mc-trend" :class="m.trend > 0 ? 'up' : 'down'">
              <span>{{ m.trend > 0 ? '&#9650;' : '&#9660;' }}</span>
              <span>{{ Math.abs(m.trend) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏 -->
      <div class="col col-right">
        <div class="panel" style="flex: 1">
          <div class="panel-head"><span class="ph-dot green"></span>24h 客流趋势</div>
          <div class="panel-body" ref="flowChartRef"></div>
        </div>
        <div class="panel" style="flex: 0.9">
          <div class="panel-head"><span class="ph-dot gold"></span>在飞机型分布</div>
          <div class="panel-body" ref="aircraftChartRef"></div>
        </div>
        <div class="panel alerts-panel" style="flex: 0.9">
          <div class="panel-head">
            <span class="ph-dot red"></span>实时动态
            <span class="ph-tag sse-tag">SSE</span>
          </div>
          <div class="alerts-scroll">
            <div v-for="(a, i) in alerts" :key="i" class="alert-row" :class="a.type">
              <span class="ar-time">{{ a.time }}</span>
              <span class="ar-dot" :class="a.type"></span>
              <span class="ar-text">{{ a.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// ============ Refs ============
const statusChartRef = ref<HTMLElement | null>(null)
const airportChartRef = ref<HTMLElement | null>(null)
const airlineChartRef = ref<HTMLElement | null>(null)
const mapChartRef = ref<HTMLElement | null>(null)
const flowChartRef = ref<HTMLElement | null>(null)
const aircraftChartRef = ref<HTMLElement | null>(null)

const currentTime = ref('')
const wsConnected = ref(false)
const sseConnected = ref(false)

const stats = reactive({ todayFlights: 0, flying: 0, passengers: 0, onTime: 0 })
const metrics = reactive({ domestic: 0, intl: 0, delay: 0, cancel: 0 })
const alerts = ref<{ time: string; icon: string; text: string; type: string }[]>([])
let charts: Record<string, ECharts | null> = {}

// ============ Utils ============
const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const randf = (a: number, b: number) => parseFloat((Math.random() * (b - a) + a).toFixed(1))
const anim = (target: number, obj: any, key: string, dec = 0) => {
  const cur = obj[key]
  const diff = target - cur
  let step = 0
  const total = 40
  const t = setInterval(() => {
    step++
    if (step >= total) { obj[key] = target; clearInterval(t) }
    else obj[key] = Number((cur + diff * (step / total)).toFixed(dec))
  }, 16)
}

const updateTime = () => {
  const d = new Date()
  currentTime.value = [d.getFullYear(), '/', String(d.getMonth()+1).padStart(2,'0'), '/', String(d.getDate()).padStart(2,'0'), ' ',
    String(d.getHours()).padStart(2,'0'), ':', String(d.getMinutes()).padStart(2,'0'), ':', String(d.getSeconds()).padStart(2,'0')].join('')
}

// ============ KPI 定义 ============
const kpis = [
  { label: '今日航班总量', color: '#00f0ff', glow: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    ref: () => stats.todayFlights.toLocaleString(), format: (v: string) => v },
  { label: '在飞航班', color: '#00ff88', glow: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    ref: () => stats.flying.toLocaleString(), format: (v: string) => v },
  { label: '旅客吞吐量', color: '#ffaa00', glow: 'radial-gradient(circle, rgba(255,170,0,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    ref: () => stats.passengers.toLocaleString() + ' 万', format: (v: string) => v },
  { label: '航班准点率', color: '#ff4466', glow: 'radial-gradient(circle, rgba(255,68,102,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    ref: () => stats.onTime.toFixed(1) + '%', format: (v: string) => v },
]

const miniCards = [
  { label: '国内航线', icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    color: '#00f0ff', ref: () => metrics.domestic.toLocaleString(), trend: 2.3 },
  { label: '国际航线', icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>',
    color: '#ffaa00', ref: () => metrics.intl.toLocaleString(), trend: -1.5 },
  { label: '平均延误', icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
    color: '#00ff88', ref: () => metrics.delay + ' min', trend: -8.2 },
  { label: '取消/备降', icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    color: '#ff4466', ref: () => metrics.cancel + ' 架', trend: 5.1 },
]

// ============ WebSocket ============
let wsTimer: ReturnType<typeof setInterval> | null = null
const initWS = () => {
  wsConnected.value = true
  wsTimer = setInterval(() => {
    anim(rand(12800, 13600), stats, 'todayFlights')
    anim(rand(3200, 3900), stats, 'flying')
    anim(rand(185, 215), stats, 'passengers')
    anim(randf(78, 93), stats, 'onTime', 1)
    anim(rand(3400, 3700), metrics, 'domestic')
    anim(rand(850, 950), metrics, 'intl')
    anim(rand(12, 30), metrics, 'delay')
    anim(rand(15, 65), metrics, 'cancel')
  }, 3000)
}

// ============ SSE ============
let sseTimer: ReturnType<typeof setInterval> | null = null
const templates = [
  { icon: '✈', text: 'CA1234 北京首都→上海浦东 已起飞 跑道36L', type: 'info' },
  { icon: '⚠', text: 'MU5678 广州白云 延误约45min 原因:流量控制', type: 'warn' },
  { icon: '✓', text: 'CZ3456 成都天府→深圳宝安 安全降落 T3', type: 'success' },
  { icon: '✗', text: 'HU7890 海口美兰→北京大兴 航班取消', type: 'error' },
  { icon: '✈', text: '3U8003 成都天府→广州白云 开始登机 G12', type: 'info' },
  { icon: '⚠', text: 'FM9012 上海浦东 低能见度 可能延误', type: 'warn' },
  { icon: '✓', text: 'CA1301 广州白云→杭州萧山 准点到达', type: 'success' },
  { icon: '↻', text: 'MU5678 广州白云 决定备降深圳宝安', type: 'error' },
  { icon: '✈', text: 'CA981 北京首都→东京成田 推出开车', type: 'info' },
  { icon: '✓', text: 'SQ801 新加坡→悉尼 巡航高度FL350', type: 'success' },
  { icon: '⚠', text: 'CX888 香港 雷暴预警 AW: amber', type: 'warn' },
  { icon: '✈', text: 'MU587 浦东→肯尼迪 跨太平洋巡航', type: 'info' },
  { icon: '✓', text: 'CA4401 天府→首都 顺利于36R落地', type: 'success' },
  { icon: '⚠', text: '3U8801 重庆江北 短时雷雨 注意绕飞', type: 'warn' },
]
const initSSE = () => {
  sseConnected.value = true
  const now = new Date()
  for (let i = 4; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 6000)
    const tp = templates[rand(0, templates.length - 1)]!
    alerts.value.push({ time: `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`, icon: tp.icon, text: tp.text, type: tp.type })
  }
  sseTimer = setInterval(() => {
    const tp = templates[rand(0, templates.length - 1)]!
    const n = new Date()
    alerts.value.unshift({ time: `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`, icon: tp.icon, text: tp.text, type: tp.type })
    if (alerts.value.length > 40) alerts.value.pop()
  }, 3500)
}

// ============ Charts ============
const C = { cyan: '#00f0ff', blue: '#3b8bff', green: '#00ff88', gold: '#ffaa00', red: '#ff4466', purple: '#b066ff', pink: '#ff6699', teal: '#00d4aa' }
const tooltipStyle = { backgroundColor: 'rgba(5,10,25,0.92)', borderColor: 'rgba(0,240,255,0.25)', borderWidth: 1, textStyle: { color: '#c8daf0', fontSize: 12 } }

const initAllCharts = () => {
  // 1. 航班状态 - 环形
  if (statusChartRef.value) {
    const c = echarts.init(statusChartRef.value); charts.status = c
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'item' },
      legend: { orient: 'vertical', right: '2%', top: 'center', textStyle: { color: '#6b7fa0', fontSize: 11 }, itemWidth: 10, itemHeight: 10, itemGap: 12 },
      graphic: [{
        type: 'text', left: '30%', top: '43%', style: { text: '6,286', fill: '#00f0ff', fontSize: 22, fontWeight: 700, fontFamily: 'DIN, monospace', textAlign: 'center' }
      }, {
        type: 'text', left: '30%', top: '58%', style: { text: '航班总数', fill: '#6b7fa0', fontSize: 11, textAlign: 'center' }
      }],
      series: [{ type: 'pie', radius: ['48%', '72%'], center: ['33%', '52%'],
        itemStyle: { borderRadius: 6, borderColor: 'rgba(5,10,25,0.9)', borderWidth: 3 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 700, color: '#e0eaff' }, itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.6)' } },
        data: [
          { value: rand(2800,3500), name: '飞行中', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#00ff88'},{offset:1,color:'#00cc6a'}]) } },
          { value: rand(600,900), name: '已起飞', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#00f0ff'},{offset:1,color:'#0088cc'}]) } },
          { value: rand(500,700), name: '降落中', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#3b8bff'},{offset:1,color:'#2244aa'}]) } },
          { value: rand(200,400), name: '延误', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#ffaa00'},{offset:1,color:'#cc7700'}]) } },
          { value: rand(50,150), name: '取消', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#ff4466'},{offset:1,color:'#cc2244'}]) } },
          { value: rand(100,250), name: '备降', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#b066ff'},{offset:1,color:'#7733cc'}]) } },
        ]
      }]
    })
  }

  // 2. 机场排名
  if (airportChartRef.value) {
    const c = echarts.init(airportChartRef.value); charts.airport = c
    const names = ['北京首都','上海浦东','广州白云','成都天府','深圳宝安','昆明长水','西安咸阳','重庆江北','杭州萧山','武汉天河']
    const vals = names.map(() => rand(800,1800)).sort((a,b) => b-a)
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '2%', right: '13%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: names, inverse: true, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#6b7fa0', fontSize: 11 } },
      series: [{ type: 'bar', barWidth: 10, data: vals.map((v, i) => ({
        value: v,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: i < 3 ? new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'rgba(0,240,255,0.15)'},{offset:1,color:'#00f0ff'}]) : new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'rgba(59,139,255,0.1)'},{offset:1,color:'rgba(59,139,255,0.7)'}])
        }
      })),
        label: { show: true, position: 'right', color: '#6b7fa0', fontSize: 10, formatter: '{c}' },
        animationDuration: 1800, animationEasing: 'cubicOut'
      }]
    })
  }

  // 3. 航司雷达
  if (airlineChartRef.value) {
    const c = echarts.init(airlineChartRef.value); charts.airline = c
    c.setOption({
      tooltip: tooltipStyle,
      legend: { bottom: 0, textStyle: { color: '#6b7fa0', fontSize: 10 }, itemWidth: 12, itemHeight: 3 },
      radar: {
        indicator: [{name:'运力规模',max:100},{name:'准点率',max:100},{name:'满意度',max:100},{name:'机队规模',max:100},{name:'航线覆盖',max:100},{name:'安全评分',max:100}],
        shape: 'polygon', splitNumber: 4, radius: '62%', center: ['50%','52%'],
        axisName: { color: '#556b88', fontSize: 9 },
        splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)' } },
        splitArea: { show: true, areaStyle: { color: ['rgba(0,240,255,0.01)','rgba(0,240,255,0.03)'] } },
        axisLine: { lineStyle: { color: 'rgba(0,240,255,0.08)' } },
      },
      series: [{ type: 'radar', data: [
        { value: [92,78,85,95,88,97], name: '国航', lineStyle: { color: C.cyan, width: 2 }, itemStyle: { color: C.cyan }, areaStyle: { color: 'rgba(0,240,255,0.12)' } },
        { value: [88,82,90,85,92,95], name: '东航', lineStyle: { color: C.blue, width: 2 }, itemStyle: { color: C.blue }, areaStyle: { color: 'rgba(59,139,255,0.08)' } },
        { value: [75,85,78,70,80,93], name: '南航', lineStyle: { color: C.green, width: 2 }, itemStyle: { color: C.green }, areaStyle: { color: 'rgba(0,255,136,0.06)' } },
      ]}]
    })
  }

  // 4. 航线地图
  if (mapChartRef.value) {
    const c = echarts.init(mapChartRef.value); charts.map = c
    const cities: Record<string,[number,number]> = {
      '北京':[116.4,40.9],'上海':[121.5,31.2],'广州':[113.3,23.1],'成都':[104.1,30.6],'深圳':[114.1,22.5],
      '昆明':[102.7,25.0],'西安':[108.9,34.3],'重庆':[106.5,29.5],'杭州':[120.2,30.3],'武汉':[114.3,30.6],
      '南京':[118.8,32.1],'郑州':[113.7,34.8],'长沙':[113.0,28.2],'厦门':[118.1,24.5],'青岛':[120.4,36.1],
      '大连':[121.6,38.9],'哈尔滨':[126.6,45.7],'乌鲁木齐':[87.6,43.8],'拉萨':[91.1,29.6],'三亚':[109.5,18.3],
      '贵阳':[106.7,26.6],'福州':[119.3,26.1],'天津':[117.2,39.1],'沈阳':[123.4,41.8],'济南':[117.0,36.7],
      '南宁':[108.3,22.8],'海口':[110.3,20.0],'兰州':[103.8,36.1],'呼和浩特':[111.7,40.8],'太原':[112.6,37.9],
    }
    const hubs = ['北京','上海','广州','成都','深圳']
    const allCities = Object.keys(cities)
    const routes: any[] = []
    const points: any[] = []
    hubs.forEach(h => {
      allCities.forEach(d => {
        if (h !== d && Math.random() > 0.25) {
          const f = cities[h]!, t = cities[d]!
          const mx = (f[0]+t[0])/2 + (t[1]-f[1])*0.18
          const my = (f[1]+t[1])/2 - (t[0]-f[0])*0.12
          routes.push({ coords: [f, [mx, my], t] })
        }
      })
    })
    allCities.forEach(n => {
      const co = cities[n]!, isHub = hubs.includes(n)
      points.push({ name: n, value: [co[0], co[1], isHub ? rand(200,500) : rand(30,150)],
        itemStyle: { color: isHub ? C.cyan : C.blue } })
    })
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'item' },
      xAxis: { type: 'value', min: 75, max: 140, show: false },
      yAxis: { type: 'value', min: 15, max: 52, show: false },
      series: [
        { type: 'lines', coordinateSystem: 'cartesian2d', zlevel: 1,
          effect: { show: true, period: 4+Math.random()*3, trailLength: 0.25, symbol: 'circle', symbolSize: 3, color: C.cyan },
          lineStyle: { color: 'rgba(0,240,255,0.12)', width: 0.8, curveness: 0.3 },
          data: routes.map(r => ({ coords: r.coords }))
        },
        { type: 'lines', coordinateSystem: 'cartesian2d', zlevel: 2,
          effect: { show: true, period: 3+Math.random()*2, trailLength: 0.5, symbol: 'arrow', symbolSize: 5, color: C.gold },
          lineStyle: { color: 'rgba(255,170,0,0.06)', width: 0.5, curveness: 0.3 },
          data: routes.slice(0,18).map(r => ({ coords: r.coords }))
        },
        { type: 'effectScatter', coordinateSystem: 'cartesian2d', zlevel: 3,
          rippleEffect: { brushType: 'stroke', scale: 4, period: 3 },
          symbol: 'circle', symbolSize: (v: number[]) => Math.max((v[2]??0)/18, 5),
          label: { show: true, position: 'right', formatter: '{b}', color: '#8899bb', fontSize: 9, textBorderColor: 'rgba(5,10,25,0.9)', textBorderWidth: 2 },
          data: points
        }
      ]
    })
  }

  // 5. 客流趋势
  if (flowChartRef.value) {
    const c = echarts.init(flowChartRef.value); charts.flow = c
    const hrs = Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`)
    const gen = () => hrs.map((_,i) => {
      const b=20, m=80*Math.exp(-0.5*((i-8)/2.5)**2), e=70*Math.exp(-0.5*((i-19)/3)**2)
      return Math.round(b+m+e+Math.random()*10)
    })
    const dep = gen().map(v => Math.round(v*(0.45+Math.random()*0.1)))
    const arr = gen().map(v => Math.round(v*(0.45+Math.random()*0.1)))
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'axis' },
      legend: { data: ['出港','进港'], right: 0, top: 0, textStyle: { color: '#6b7fa0', fontSize: 10 }, itemWidth: 12, itemHeight: 3 },
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%', containLabel: true },
      xAxis: { type: 'category', data: hrs, boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisTick: { show: false }, axisLabel: { color: '#445566', fontSize: 10, interval: 3 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#445566', fontSize: 10 } },
      series: [
        { name: '出港', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: C.cyan, width: 2, shadowColor: 'rgba(0,240,255,0.3)', shadowBlur: 8 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,240,255,0.2)'},{offset:1,color:'rgba(0,240,255,0)'}]) }, data: dep },
        { name: '进港', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: C.green, width: 2, shadowColor: 'rgba(0,255,136,0.3)', shadowBlur: 8 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,255,136,0.15)'},{offset:1,color:'rgba(0,255,136,0)'}]) }, data: arr },
      ]
    })
  }

  // 6. 机型分布
  if (aircraftChartRef.value) {
    const c = echarts.init(aircraftChartRef.value); charts.aircraft = c
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'item' },
      series: [{ type: 'pie', radius: ['15%','70%'], center: ['50%','52%'], roseType: 'area',
        itemStyle: { borderRadius: 5, borderColor: 'rgba(5,10,25,0.8)', borderWidth: 2 },
        label: { color: '#6b7fa0', fontSize: 10, formatter: '{b}\n{d}%' },
        labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' }, length: 8, length2: 10 },
        data: [
          { value: rand(800,1200), name: 'B737-800', itemStyle: { color: C.cyan } },
          { value: rand(600,900), name: 'A320', itemStyle: { color: C.blue } },
          { value: rand(300,500), name: 'A321neo', itemStyle: { color: C.green } },
          { value: rand(200,400), name: 'B787-9', itemStyle: { color: C.gold } },
          { value: rand(150,300), name: 'A350-900', itemStyle: { color: C.purple } },
          { value: rand(100,200), name: 'B777-300ER', itemStyle: { color: C.pink } },
          { value: rand(80,150), name: 'A380-800', itemStyle: { color: C.teal } },
        ]
      }]
    })
  }
}

// 定时更新图表
let chartTimer: ReturnType<typeof setInterval> | null = null
const startUpdates = () => {
  chartTimer = setInterval(() => {
    if (charts.status) charts.status.setOption({ series: [{ data: [
      { value: rand(2800,3500), name: '飞行中', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#00ff88'},{offset:1,color:'#00cc6a'}]) } },
      { value: rand(600,900), name: '已起飞', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#00f0ff'},{offset:1,color:'#0088cc'}]) } },
      { value: rand(500,700), name: '降落中', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#3b8bff'},{offset:1,color:'#2244aa'}]) } },
      { value: rand(200,400), name: '延误', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#ffaa00'},{offset:1,color:'#cc7700'}]) } },
      { value: rand(50,150), name: '取消', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#ff4466'},{offset:1,color:'#cc2244'}]) } },
      { value: rand(100,250), name: '备降', itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,1,[{offset:0,color:'#b066ff'},{offset:1,color:'#7733cc'}]) } },
    ] }] })
    if (charts.flow) {
      const gen = () => Array.from({length:24},(_,i)=>{const b=20,m=80*Math.exp(-0.5*((i-8)/2.5)**2),e=70*Math.exp(-0.5*((i-19)/3)**2);return Math.round((b+m+e)*(0.45+Math.random()*0.1)+Math.random()*5)})
      charts.flow.setOption({ series: [{ data: gen() },{ data: gen() }] })
    }
    if (charts.aircraft) charts.aircraft.setOption({ series: [{ data: [
      { value: rand(800,1200), name: 'B737-800', itemStyle: { color: C.cyan } },
      { value: rand(600,900), name: 'A320', itemStyle: { color: C.blue } },
      { value: rand(300,500), name: 'A321neo', itemStyle: { color: C.green } },
      { value: rand(200,400), name: 'B787-9', itemStyle: { color: C.gold } },
      { value: rand(150,300), name: 'A350-900', itemStyle: { color: C.purple } },
      { value: rand(100,200), name: 'B777-300ER', itemStyle: { color: C.pink } },
      { value: rand(80,150), name: 'A380-800', itemStyle: { color: C.teal } },
    ] }] })
  }, 5000)
}

const handleResize = () => Object.values(charts).forEach(c => c?.resize())

let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(async () => {
  updateTime(); clockTimer = setInterval(updateTime, 1000)
  await nextTick()
  initAllCharts(); initWS(); initSSE(); startUpdates()
  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    anim(rand(12800,13200), stats, 'todayFlights')
    anim(rand(3200,3600), stats, 'flying')
    anim(rand(185,200), stats, 'passengers')
    anim(randf(82,90), stats, 'onTime', 1)
    anim(rand(3400,3600), metrics, 'domestic')
    anim(rand(860,920), metrics, 'intl')
    anim(rand(15,22), metrics, 'delay')
    anim(rand(20,45), metrics, 'cancel')
  }, 200)
})
onUnmounted(() => {
  ;[clockTimer,wsTimer,sseTimer,chartTimer].forEach(t => t && clearInterval(t))
  window.removeEventListener('resize', handleResize)
  Object.values(charts).forEach(c => c?.dispose()); charts = {}
})
</script>

<style scoped lang="scss">
// ============ Variables ============
$bg: #030810;
$panel-bg: rgba(6, 14, 30, 0.88);
$border: rgba(0, 200, 255, 0.08);
$glow: rgba(0, 240, 255, 0.06);
$txt: #c0d0e4;
$txt2: #4a6080;

// ============ Root ============
.dashboard {
  width: 100vw; height: 100vh;
  background: $bg;
  display: flex; flex-direction: column;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: $txt;
  padding-top: 60px;
  position: relative;
}

// ============ Background ============
.bg-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-glow {
  position: absolute; z-index: 0; pointer-events: none; border-radius: 50%;
  &-1 { width: 600px; height: 600px; top: -200px; left: 30%; background: radial-gradient(circle, rgba(0,120,255,0.08) 0%, transparent 70%); }
  &-2 { width: 500px; height: 500px; bottom: -150px; right: 10%; background: radial-gradient(circle, rgba(0,200,180,0.06) 0%, transparent 70%); }
}

// ============ Header ============
.dash-header {
  height: 58px; flex-shrink: 0;
  display: flex; align-items: center;
  position: relative; z-index: 2;
  padding: 0 20px;
}
.header-deco {
  flex: 1; overflow: hidden; opacity: 0.6; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.4) 30%, rgba(0,240,255,0.6) 50%, rgba(0,240,255,0.4) 70%, transparent);
  border-radius: 1px;
  &-right { background: linear-gradient(90deg, transparent, rgba(0,240,255,0.4) 30%, rgba(0,240,255,0.6) 50%, rgba(0,240,255,0.4) 70%, transparent); }
}
.header-core {
  display: flex; align-items: center; gap: 20px; flex-shrink: 0; white-space: nowrap;
}
.header-l, .header-r { display: flex; align-items: center; gap: 10px; }
.conn-indicator {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  font-size: 10px; color: #445; transition: all 0.3s;
  .conn-dot { width: 5px; height: 5px; border-radius: 50%; background: #445; transition: all 0.3s; }
  &.on { color: #00ff88; border-color: rgba(0,255,136,0.2); background: rgba(0,255,136,0.05);
    .conn-dot { background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: pulse 2s infinite; }
  }
  &.sse.on { color: #00bbff; border-color: rgba(0,187,255,0.2); background: rgba(0,187,255,0.05);
    .conn-dot { background: #00bbff; box-shadow: 0 0 8px #00bbff; }
  }
}
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

.header-title-wrap {
  display: flex; align-items: center; gap: 12px;
}
.title-plane { color: #00f0ff; filter: drop-shadow(0 0 8px rgba(0,240,255,0.6)); animation: floatY 3s ease-in-out infinite; }
.title-plane.flip { transform: scaleX(-1); animation-delay: 1.5s; }
@keyframes floatY { 0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)} }
.flip { @keyframes floatY { 0%,100%{transform:scaleX(-1) translateY(0)}50%{transform:scaleX(-1) translateY(-3px)} } }

.header-title {
  font-size: 22px; font-weight: 800; letter-spacing: 6px;
  display: flex; margin: 0;
  .t-char {
    background: linear-gradient(180deg, #ffffff 0%, #80d0ff 50%, #00a0ff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charGlow 4s ease-in-out infinite;
    text-shadow: none;
  }
}
@keyframes charGlow { 0%,100%{filter:brightness(1)}50%{filter:brightness(1.3)} }

.digital-clock {
  font-family: 'DIN', 'Courier New', monospace;
  font-size: 14px; font-weight: 600;
  color: #00f0ff; letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0,240,255,0.4);
}

// ============ KPI Bar ============
.kpi-bar {
  height: 76px; flex-shrink: 0;
  display: flex; gap: 12px;
  padding: 0 16px; z-index: 2;
  margin-top: -4px;
}
.kpi-item {
  flex: 1;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(8,16,35,0.9), rgba(4,10,25,0.95));
  border: 1px solid $border;
  border-radius: 8px;
  position: relative; overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
  &:hover { border-color: rgba(0,200,255,0.2); transform: translateY(-1px); }
  .kpi-glow {
    position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px; opacity: 0.6;
    pointer-events: none;
  }
  .kpi-icon-wrap {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    .kpi-icon { color: inherit; display: flex; }
  }
  .kpi-content { display: flex; flex-direction: column; gap: 2px; }
  .kpi-value {
    font-family: 'DIN', 'Courier New', monospace;
    font-size: 20px; font-weight: 700;
    letter-spacing: 0.5px;
  }
  .kpi-label { font-size: 10px; color: $txt2; letter-spacing: 0.5px; }
}

// ============ Body ============
.dash-body {
  flex: 1; display: flex; gap: 10px;
  padding: 0 16px 12px; z-index: 2;
  min-height: 0;
}
.col { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.col-left, .col-right { width: 310px; flex-shrink: 0; }
.col-center { flex: 1; min-width: 0; }

// ============ Panel ============
.panel {
  background: $panel-bg;
  border: 1px solid $border;
  border-radius: 6px;
  display: flex; flex-direction: column;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(12px);
  // 角落装饰
  &::before, &::after {
    content: ''; position: absolute; width: 14px; height: 14px; z-index: 1; pointer-events: none;
  }
  &::before {
    top: -1px; left: -1px;
    border-top: 2px solid rgba(0,240,255,0.3);
    border-left: 2px solid rgba(0,240,255,0.3);
  }
  &::after {
    bottom: -1px; right: -1px;
    border-bottom: 2px solid rgba(0,240,255,0.15);
    border-right: 2px solid rgba(0,240,255,0.15);
  }
}
.panel-head {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; font-size: 12px; font-weight: 600;
  color: #a0b8d0; letter-spacing: 0.5px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  .ph-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00f0ff; box-shadow: 0 0 6px rgba(0,240,255,0.5);
    &.warn { background: #ffaa00; box-shadow: 0 0 6px rgba(255,170,0,0.5); }
    &.purple { background: #b066ff; box-shadow: 0 0 6px rgba(176,102,255,0.5); }
    &.green { background: #00ff88; box-shadow: 0 0 6px rgba(0,255,136,0.5); }
    &.gold { background: #ffaa00; box-shadow: 0 0 6px rgba(255,170,0,0.5); }
    &.red { background: #ff4466; box-shadow: 0 0 6px rgba(255,68,102,0.5); }
    &.cyan { background: #00f0ff; box-shadow: 0 0 6px rgba(0,240,255,0.5); }
  }
  .ph-tag {
    margin-left: auto; font-size: 9px; font-weight: 600;
    color: #00f0ff; background: rgba(0,240,255,0.08);
    border: 1px solid rgba(0,240,255,0.2);
    padding: 1px 7px; border-radius: 8px; letter-spacing: 0.5px;
    &.sse-tag { color: #00bbff; background: rgba(0,187,255,0.08); border-color: rgba(0,187,255,0.2); }
  }
}
.panel-body { flex: 1; min-height: 0; }

.map-panel { flex: 1 !important; }

// ============ Center Bottom ============
.center-bottom-row {
  display: flex; gap: 10px; flex-shrink: 0; height: 72px;
}
.mini-card {
  flex: 1;
  display: flex; align-items: center; gap: 10px;
  background: $panel-bg; border: 1px solid $border;
  border-radius: 6px; padding: 10px 14px;
  position: relative; overflow: hidden;
  transition: border-color 0.3s;
  &:hover { border-color: rgba(0,200,255,0.18); }
  .mc-icon { flex-shrink: 0; display: flex; opacity: 0.8; }
  .mc-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .mc-val { font-family: 'DIN', monospace; font-size: 16px; font-weight: 700; }
  .mc-label { font-size: 10px; color: $txt2; }
  .mc-trend {
    font-size: 10px; font-weight: 600;
    &.up { color: #00ff88; }
    &.down { color: #ff4466; }
  }
}

// ============ Alerts ============
.alerts-scroll {
  flex: 1; overflow-y: auto; padding: 4px 10px 6px;
  display: flex; flex-direction: column; gap: 3px;
  &::-webkit-scrollbar { width: 2px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
}
.alert-row {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-radius: 4px;
  font-size: 10px; line-height: 1.3;
  background: rgba(255,255,255,0.015);
  border-left: 2px solid transparent;
  animation: slideIn 0.3s ease;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.03); }
  &.info { border-left-color: #00f0ff; }
  &.warn { border-left-color: #ffaa00; }
  &.success { border-left-color: #00ff88; }
  &.error { border-left-color: #ff4466; }
  .ar-time { color: #3a5070; font-family: 'DIN', monospace; font-size: 9px; flex-shrink: 0; }
  .ar-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: #334;
    &.info { background: #00f0ff; box-shadow: 0 0 4px #00f0ff; }
    &.warn { background: #ffaa00; box-shadow: 0 0 4px #ffaa00; }
    &.success { background: #00ff88; box-shadow: 0 0 4px #00ff88; }
    &.error { background: #ff4466; box-shadow: 0 0 4px #ff4466; }
  }
  .ar-text { color: #8095b0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
@keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }

// ============ Responsive ============
@media (max-width: 1400px) {
  .col-left, .col-right { width: 270px; }
  .kpi-value { font-size: 17px; }
  .header-title { font-size: 18px; letter-spacing: 4px; }
}
</style>
