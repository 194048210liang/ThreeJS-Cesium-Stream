<template>
  <div class="dashboard">
    <!-- 背景 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 核心指标条 -->
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
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.flight"></span>
            <span class="ph-dot"></span>航班实时状态
          </div>
          <div class="panel-body" ref="statusChartRef"></div>
        </div>
        <div class="panel" style="flex: 1">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.ranking"></span>
            <span class="ph-dot warn"></span>机场吞吐 TOP10
          </div>
          <div class="panel-body" ref="airportChartRef"></div>
        </div>
        <div class="panel" style="flex: 0.85">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.radar"></span>
            <span class="ph-dot purple"></span>航司综合能力
          </div>
          <div class="panel-body" ref="airlineChartRef"></div>
        </div>
      </div>

      <!-- 中栏 -->
      <div class="col col-center">
        <div class="panel map-panel">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.globe"></span>
            <span class="ph-dot cyan"></span>全国实时航线态势
            <span class="ph-tag">OpenSky ADS-B</span>
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
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.trend"></span>
            <span class="ph-dot green"></span>24h 客流趋势
          </div>
          <div class="panel-body" ref="flowChartRef"></div>
        </div>
        <div class="panel" style="flex: 0.9">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.plane2"></span>
            <span class="ph-dot gold"></span>在飞机型分布
          </div>
          <div class="panel-body" ref="aircraftChartRef"></div>
        </div>
        <div class="panel alerts-panel" style="flex: 0.9">
          <div class="panel-head">
            <span class="ph-icon" v-html="iconSvg.bell"></span>
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
import {
  fetchChinaFlights,
  findNearestAirport,
  getAirlineName,
  type FlightState,
} from '@/api/opensky'

// ============ 统一 SVG 图标 ============
const iconSvg = {
  flight:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  ranking:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg>',
  radar:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-2.38 1.05-4.52 2.7-5.98L5.28 4.43A9.96 9.96 0 0 0 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-2.92-1.26-5.55-3.26-7.38l-.67-.69zM12 2v6l3.5 2.08-.72 1.21L11 9.27V2h1z"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54A1.99 1.99 0 0 0 16 16h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41A7.997 7.997 0 0 1 20 12c0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  trend:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>',
  plane2:
    '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
}

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

// ====== OpenSky 实时数据 ======
const realFlights = ref<FlightState[]>([])
let realDataTimer: ReturnType<typeof setInterval> | null = null

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
    if (step >= total) {
      obj[key] = target
      clearInterval(t)
    } else obj[key] = Number((cur + diff * (step / total)).toFixed(dec))
  }, 16)
}

const updateTime = () => {
  const d = new Date()
  currentTime.value = [
    d.getFullYear(),
    '/',
    String(d.getMonth() + 1).padStart(2, '0'),
    '/',
    String(d.getDate()).padStart(2, '0'),
    ' ',
    String(d.getHours()).padStart(2, '0'),
    ':',
    String(d.getMinutes()).padStart(2, '0'),
    ':',
    String(d.getSeconds()).padStart(2, '0'),
  ].join('')
}

// ============ KPI ============
const kpis = [
  {
    label: '今日航班总量',
    color: '#00f0ff',
    glow: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    ref: () => stats.todayFlights.toLocaleString(),
    format: (v: string) => v,
  },
  {
    label: '在飞航班',
    color: '#00ff88',
    glow: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
    ref: () => stats.flying.toLocaleString(),
    format: (v: string) => v,
  },
  {
    label: '旅客吞吐量',
    color: '#ffaa00',
    glow: 'radial-gradient(circle, rgba(255,170,0,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    ref: () => stats.passengers.toLocaleString() + ' 万',
    format: (v: string) => v,
  },
  {
    label: '航班准点率',
    color: '#ff4466',
    glow: 'radial-gradient(circle, rgba(255,68,102,0.1) 0%, transparent 70%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    ref: () => stats.onTime.toFixed(1) + '%',
    format: (v: string) => v,
  },
]

const miniCards = [
  {
    label: '国内航线',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    color: '#00f0ff',
    ref: () => metrics.domestic.toLocaleString(),
    trend: 2.3,
  },
  {
    label: '国际航线',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>',
    color: '#ffaa00',
    ref: () => metrics.intl.toLocaleString(),
    trend: -1.5,
  },
  {
    label: '平均延误',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
    color: '#00ff88',
    ref: () => metrics.delay + ' min',
    trend: -8.2,
  },
  {
    label: '取消/备降',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    color: '#ff4466',
    ref: () => metrics.cancel + ' 架',
    trend: 5.1,
  },
]

// ============ WebSocket ============
let wsTimer: ReturnType<typeof setInterval> | null = null
const initWS = () => {
  wsConnected.value = true
  wsTimer = setInterval(() => {
    anim(rand(12800, 13600), stats, 'todayFlights')
    anim(rand(185, 215), stats, 'passengers')
    anim(randf(78, 93), stats, 'onTime', 1)
    anim(rand(3400, 3700), metrics, 'domestic')
    anim(rand(850, 950), metrics, 'intl')
    anim(rand(12, 30), metrics, 'delay')
    anim(rand(15, 65), metrics, 'cancel')
    // flying 由 refreshRealData 从 OpenSky 实时更新，无数据时回退模拟
    if (realFlights.value.length === 0) {
      anim(rand(3200, 3900), stats, 'flying')
    }
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
    alerts.value.push({
      time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`,
      icon: tp.icon,
      text: tp.text,
      type: tp.type,
    })
  }
  sseTimer = setInterval(() => {
    const tp = templates[rand(0, templates.length - 1)]!
    const n = new Date()
    alerts.value.unshift({
      time: `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`,
      icon: tp.icon,
      text: tp.text,
      type: tp.type,
    })
    if (alerts.value.length > 40) alerts.value.pop()
  }, 3500)
}

// ============ Color & Style ============
const C = {
  cyan: '#00f0ff',
  blue: '#3b8bff',
  green: '#00ff88',
  gold: '#ffaa00',
  red: '#ff4466',
  purple: '#b066ff',
  pink: '#ff6699',
  teal: '#00d4aa',
}
const tooltipStyle = {
  backgroundColor: 'rgba(5,10,25,0.94)',
  borderColor: 'rgba(0,240,255,0.25)',
  borderWidth: 1,
  textStyle: { color: '#a0c8f0', fontSize: 12 },
}

// ============ Charts ============
const initAllCharts = async () => {
  // 加载中国地图
  try {
    const resp = await fetch('/china.json')
    const chinaJson = await resp.json()
    echarts.registerMap('china', chinaJson as any)
  } catch (e) {
    console.warn('地图加载失败，使用散点图备用', e)
  }

  // 1. 航班状态 - 环形
  if (statusChartRef.value) {
    const c = echarts.init(statusChartRef.value)
    charts.status = c
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'item' },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '43%',
          style: {
            text: '6,286',
            fill: '#00f0ff',
            fontSize: 24,
            fontWeight: 700,
            fontFamily: 'DIN, monospace',
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '58%',
          style: { text: '航班总数', fill: '#5a8abf', fontSize: 11, textAlign: 'center' },
        },
      ],
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '52%'],
          itemStyle: { borderRadius: 6, borderColor: 'rgba(5,10,25,0.9)', borderWidth: 3 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 700, color: '#e0eaff' },
            itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.6)' },
          },
          data: [
            {
              value: rand(2800, 3500),
              name: '飞行中',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#00e0ff' },
                  { offset: 1, color: '#0088cc' },
                ]),
              },
            },
            {
              value: rand(600, 900),
              name: '已起飞',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#3b9bff' },
                  { offset: 1, color: '#1a5faa' },
                ]),
              },
            },
            {
              value: rand(500, 700),
              name: '降落中',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#6ab4ff' },
                  { offset: 1, color: '#2a6ecc' },
                ]),
              },
            },
            {
              value: rand(200, 400),
              name: '延误',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#00c8ff' },
                  { offset: 1, color: '#0066aa' },
                ]),
              },
            },
            {
              value: rand(50, 150),
              name: '取消',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#1a5fbb' },
                  { offset: 1, color: '#0a2f6a' },
                ]),
              },
            },
            {
              value: rand(100, 250),
              name: '备降',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: '#88ccff' },
                  { offset: 1, color: '#3388cc' },
                ]),
              },
            },
          ],
        },
      ],
    })
  }

  // 2. 机场排名 - 横向条形图
  if (airportChartRef.value) {
    const c = echarts.init(airportChartRef.value)
    charts.airport = c
    const names = [
      '北京首都',
      '上海浦东',
      '广州白云',
      '成都天府',
      '深圳宝安',
      '昆明长水',
      '西安咸阳',
      '重庆江北',
      '杭州萧山',
      '武汉天河',
    ]
    const vals = names.map(() => rand(800, 1800)).sort((a, b) => b - a)
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '4%', right: '14%', top: '4%', bottom: '4%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#5a8abf', fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: vals.map((v, i) => ({
            value: v,
            itemStyle: {
              borderRadius: [0, 5, 5, 0],
              color:
                i < 3
                  ? (new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: 'rgba(0,240,255,0.1)' },
                      { offset: 1, color: '#00f0ff' },
                    ]) as any)
                  : (new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: 'rgba(59,139,255,0.05)' },
                      { offset: 1, color: 'rgba(59,139,255,0.6)' },
                    ]) as any),
              shadowColor: i < 3 ? 'rgba(0,240,255,0.25)' : 'transparent',
              shadowBlur: i < 3 ? 8 : 0,
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#7aacdd',
            fontSize: 10,
            fontFamily: 'DIN, monospace',
            formatter: '{c}',
          },
          animationDuration: 1800,
          animationEasing: 'cubicOut',
        },
      ],
    })
  }

  // 3. 航司雷达
  if (airlineChartRef.value) {
    const c = echarts.init(airlineChartRef.value)
    charts.airline = c
    c.setOption({
      tooltip: tooltipStyle,
      legend: {
        bottom: 0,
        textStyle: { color: '#5a8abf', fontSize: 10 },
        itemWidth: 14,
        itemHeight: 3,
      },
      radar: {
        indicator: [
          { name: '运力规模', max: 100 },
          { name: '准点率', max: 100 },
          { name: '满意度', max: 100 },
          { name: '机队规模', max: 100 },
          { name: '航线覆盖', max: 100 },
          { name: '安全评分', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        radius: '60%',
        center: ['50%', '52%'],
        axisName: { color: '#5a8abf', fontSize: 9 },
        splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)' } },
        splitArea: {
          show: true,
          areaStyle: { color: ['rgba(0,240,255,0.01)', 'rgba(0,240,255,0.03)'] },
        },
        axisLine: { lineStyle: { color: 'rgba(0,240,255,0.08)' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [92, 78, 85, 95, 88, 97],
              name: '国航',
              lineStyle: { color: C.cyan, width: 2 },
              itemStyle: { color: C.cyan },
              areaStyle: { color: 'rgba(0,240,255,0.12)' },
            },
            {
              value: [88, 82, 90, 85, 92, 95],
              name: '东航',
              lineStyle: { color: C.blue, width: 2 },
              itemStyle: { color: C.blue },
              areaStyle: { color: 'rgba(59,139,255,0.08)' },
            },
            {
              value: [75, 85, 78, 70, 80, 93],
              name: '南航',
              lineStyle: { color: C.green, width: 2 },
              itemStyle: { color: C.green },
              areaStyle: { color: 'rgba(0,255,136,0.06)' },
            },
          ],
        },
      ],
    })
  }

  // 4. 中国地图 + 飞线
  if (mapChartRef.value) {
    const c = echarts.init(mapChartRef.value)
    charts.map = c
    const cities: Record<string, [number, number]> = {
      北京: [116.46, 39.92],
      上海: [121.48, 31.22],
      广州: [113.23, 23.16],
      成都: [104.06, 30.67],
      深圳: [114.07, 22.62],
      昆明: [102.73, 25.04],
      西安: [108.95, 34.27],
      重庆: [106.54, 29.59],
      杭州: [120.19, 30.26],
      武汉: [114.31, 30.52],
      南京: [118.78, 32.04],
      郑州: [113.65, 34.76],
      长沙: [112.94, 28.23],
      厦门: [118.1, 24.46],
      青岛: [120.33, 36.07],
      大连: [121.62, 38.92],
      哈尔滨: [126.63, 45.75],
      乌鲁木齐: [87.68, 43.77],
      拉萨: [91.11, 29.97],
      三亚: [109.51, 18.25],
      贵阳: [106.71, 26.57],
      福州: [119.3, 26.08],
      天津: [117.2, 39.13],
      沈阳: [123.38, 41.8],
      济南: [117.0, 36.65],
      南宁: [108.33, 22.84],
      海口: [110.35, 20.02],
      兰州: [103.73, 36.03],
      呼和浩特: [111.65, 40.82],
      太原: [112.55, 37.87],
    }
    const hubs = ['北京', '上海', '广州', '成都', '深圳']
    const allCities = Object.keys(cities)
    const routes: any[] = []
    const points: any[] = []

    // 生成航线
    hubs.forEach((h) => {
      allCities.forEach((d) => {
        if (h !== d && Math.random() > 0.3) {
          const f = cities[h]!,
            t = cities[d]!
          routes.push({ fromName: h, toName: d, coords: [f, t] })
        }
      })
    })

    // 生成城市点
    allCities.forEach((n) => {
      const co = cities[n]!,
        isHub = hubs.includes(n)
      points.push({
        name: n,
        value: [...co, isHub ? rand(200, 500) : rand(30, 150)],
        itemStyle: { color: isHub ? '#00f0ff' : '#3b8bff' },
      })
    })

    c.setOption({
      tooltip: {
        ...tooltipStyle,
        trigger: 'item',
        formatter: (p: any) => {
          if (p.seriesType === 'effectScatter') return `<b>${p.name}</b>`
          if (p.seriesType === 'lines') return `${p.data.fromName} → ${p.data.toName}`
          return ''
        },
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [104.5, 36],
        label: { show: false },
        itemStyle: {
          areaColor: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(8,30,60,0.9)' },
              { offset: 1, color: 'rgba(4,16,40,0.95)' },
            ],
          } as any,
          borderColor: 'rgba(0,200,255,0.18)',
          borderWidth: 1,
          shadowColor: 'rgba(0,100,200,0.15)',
          shadowBlur: 20,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(0,120,200,0.25)',
            borderColor: 'rgba(0,240,255,0.5)',
            borderWidth: 1.5,
          },
          label: { show: true, color: '#c0e0ff', fontSize: 11 },
        },
      },
      series: [
        // 飞线底层 - 细线
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 1,
          effect: {
            show: true,
            period: 4 + Math.random() * 2,
            trailLength: 0.3,
            symbol: 'circle',
            symbolSize: 3,
            color: '#00f0ff',
          },
          lineStyle: { color: 'rgba(0,240,255,0.08)', width: 0.8, curveness: 0.3 },
          data: routes,
        },
        // 飞线顶层 - 金色重点航线
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: true,
            period: 3 + Math.random() * 2,
            trailLength: 0.5,
            symbol: 'arrow',
            symbolSize: 6,
            color: '#ffaa00',
          },
          lineStyle: { color: 'rgba(255,170,0,0.04)', width: 0.5, curveness: 0.3 },
          data: routes.slice(0, 20),
        },
        // 城市散点 - 涟漪
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          rippleEffect: { brushType: 'stroke', scale: 5, period: 3 },
          symbol: 'circle',
          symbolSize: (val: number[]) => Math.max((val[2] ?? 0) / 18, 5),
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            color: '#7aacdd',
            fontSize: 9,
            textBorderColor: 'rgba(5,10,25,0.9)',
            textBorderWidth: 2,
          },
          data: points,
        },
        // 实时航班位置 - OpenSky ADS-B
        {
          name: 'realAircraft',
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 4,
          symbol: 'circle',
          symbolSize: 3,
          itemStyle: { color: '#ffffff', opacity: 0.7 },
          label: { show: false },
          data: [],
        },
      ],
    })
  }

  // 5. 客流趋势
  if (flowChartRef.value) {
    const c = echarts.init(flowChartRef.value)
    charts.flow = c
    const hrs = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    const gen = () =>
      hrs.map((_, i) => {
        const b = 20,
          m = 80 * Math.exp(-0.5 * ((i - 8) / 2.5) ** 2),
          e = 70 * Math.exp(-0.5 * ((i - 19) / 3) ** 2)
        return Math.round(b + m + e + Math.random() * 10)
      })
    const dep = gen().map((v) => Math.round(v * (0.45 + Math.random() * 0.1)))
    const arr = gen().map((v) => Math.round(v * (0.45 + Math.random() * 0.1)))
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'axis' },
      legend: {
        data: ['出港', '进港'],
        right: 0,
        top: 0,
        textStyle: { color: '#5a8abf', fontSize: 10 },
        itemWidth: 14,
        itemHeight: 3,
      },
      grid: { left: '2%', right: '2%', top: '16%', bottom: '4%', containLabel: true },
      xAxis: {
        type: 'category',
        data: hrs,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisTick: { show: false },
        axisLabel: { color: '#5a8abf', fontSize: 10, interval: 3 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#5a8abf', fontSize: 10 },
      },
      series: [
        {
          name: '出港',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: C.cyan, width: 2, shadowColor: 'rgba(0,240,255,0.3)', shadowBlur: 8 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,240,255,0.2)' },
              { offset: 1, color: 'rgba(0,240,255,0)' },
            ]),
          },
          data: dep,
        },
        {
          name: '进港',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: C.green,
            width: 2,
            shadowColor: 'rgba(0,255,136,0.3)',
            shadowBlur: 8,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,255,136,0.15)' },
              { offset: 1, color: 'rgba(0,255,136,0)' },
            ]),
          },
          data: arr,
        },
      ],
    })
  }

  // 6. 机型分布
  if (aircraftChartRef.value) {
    const c = echarts.init(aircraftChartRef.value)
    charts.aircraft = c
    c.setOption({
      tooltip: { ...tooltipStyle, trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['15%', '70%'],
          center: ['50%', '52%'],
          roseType: 'area',
          itemStyle: { borderRadius: 5, borderColor: 'rgba(5,10,25,0.8)', borderWidth: 2 },
          label: { color: '#5a8abf', fontSize: 10, formatter: '{b}\n{d}%' },
          labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' }, length: 8, length2: 10 },
          data: [
            { value: rand(800, 1200), name: 'B737-800', itemStyle: { color: C.cyan } },
            { value: rand(600, 900), name: 'A320', itemStyle: { color: C.blue } },
            { value: rand(300, 500), name: 'A321neo', itemStyle: { color: C.green } },
            { value: rand(200, 400), name: 'B787-9', itemStyle: { color: C.gold } },
            { value: rand(150, 300), name: 'A350-900', itemStyle: { color: C.purple } },
            { value: rand(100, 200), name: 'B777-300ER', itemStyle: { color: C.pink } },
            { value: rand(80, 150), name: 'A380-800', itemStyle: { color: C.teal } },
          ],
        },
      ],
    })
  }
}

// 定时更新
let chartTimer: ReturnType<typeof setInterval> | null = null
const startUpdates = () => {
  chartTimer = setInterval(() => {
    if (charts.status)
      charts.status.setOption({
        series: [
          {
            data: [
              {
                value: rand(2800, 3500),
                name: '飞行中',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#00e0ff' },
                    { offset: 1, color: '#0088cc' },
                  ]),
                },
              },
              {
                value: rand(600, 900),
                name: '已起飞',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#3b9bff' },
                    { offset: 1, color: '#1a5faa' },
                  ]),
                },
              },
              {
                value: rand(500, 700),
                name: '降落中',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#6ab4ff' },
                    { offset: 1, color: '#2a6ecc' },
                  ]),
                },
              },
              {
                value: rand(200, 400),
                name: '延误',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#00c8ff' },
                    { offset: 1, color: '#0066aa' },
                  ]),
                },
              },
              {
                value: rand(50, 150),
                name: '取消',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#1a5fbb' },
                    { offset: 1, color: '#0a2f6a' },
                  ]),
                },
              },
              {
                value: rand(100, 250),
                name: '备降',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#88ccff' },
                    { offset: 1, color: '#3388cc' },
                  ]),
                },
              },
            ],
          },
        ],
      })
    if (charts.flow) {
      const gen = () =>
        Array.from({ length: 24 }, (_, i) => {
          const b = 20,
            m = 80 * Math.exp(-0.5 * ((i - 8) / 2.5) ** 2),
            e = 70 * Math.exp(-0.5 * ((i - 19) / 3) ** 2)
          return Math.round((b + m + e) * (0.45 + Math.random() * 0.1) + Math.random() * 5)
        })
      charts.flow.setOption({ series: [{ data: gen() }, { data: gen() }] })
    }
    if (charts.aircraft)
      charts.aircraft.setOption({
        series: [
          {
            data: [
              { value: rand(800, 1200), name: 'B737-800', itemStyle: { color: C.cyan } },
              { value: rand(600, 900), name: 'A320', itemStyle: { color: C.blue } },
              { value: rand(300, 500), name: 'A321neo', itemStyle: { color: C.green } },
              { value: rand(200, 400), name: 'B787-9', itemStyle: { color: C.gold } },
              { value: rand(150, 300), name: 'A350-900', itemStyle: { color: C.purple } },
              { value: rand(100, 200), name: 'B777-300ER', itemStyle: { color: C.pink } },
              { value: rand(80, 150), name: 'A380-800', itemStyle: { color: C.teal } },
            ],
          },
        ],
      })
  }, 5000)
}

const handleResize = () => Object.values(charts).forEach((c) => c?.resize())

// ============ OpenSky 实时数据刷新 ============
const refreshRealData = async () => {
  try {
    const { flights, total } = await fetchChinaFlights()
    realFlights.value = flights

    // 更新 KPI「在飞航班」
    anim(total, stats, 'flying')

    // 更新地图散点 - 真实航班位置
    if (charts.map) {
      const scatterData = flights.slice(0, 600).map((f) => ({
        value: [f.longitude, f.latitude, f.altitude],
        itemStyle: {
          color: f.altitude > 10000 ? '#ffffff' : '#66ccff',
          opacity: 0.75,
        },
      }))
      // 只更新 index=3 的 realAircraft series，不影响其他 series
      const seriesOption = charts.map.getOption() as any
      const allSeries = seriesOption?.series || []
      allSeries[3] = { ...allSeries[3], data: scatterData }
      charts.map.setOption({ series: allSeries })
    }

    // 用真实航班号生成动态消息
    const count = Math.min(3, flights.length)
    for (let i = 0; i < count; i++) {
      const f = flights[rand(0, flights.length - 1)]!
      const airport = findNearestAirport(f.latitude, f.longitude)
      const airline = getAirlineName(f.callsign)
      const alt = Math.round(f.altitude * 3.2808)
      const spd = Math.round(f.velocity * 3.6)
      const n = new Date()
      const time = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`

      const msgs = [
        { text: `${airline}${f.callsign} ${airport}附近 巡航高度${alt}ft`, type: 'info' as const },
        { text: `${airline}${f.callsign} 途径${airport} 空速${spd}km/h`, type: 'info' as const },
        { text: `${airline}${f.callsign} 接近${airport} 高度${alt}ft 开始下降`, type: 'success' as const },
        { text: `${airline}${f.callsign} ${airport}上空 真航迹${Math.round(f.heading)}°`, type: 'info' as const },
      ]
      const msg = msgs[rand(0, msgs.length - 1)]!
      alerts.value.unshift({
        time,
        icon: msg.type === 'success' ? '✓' : '✈',
        text: msg.text,
        type: msg.type,
      })
    }
    if (alerts.value.length > 50) alerts.value = alerts.value.slice(0, 50)
  } catch (e) {
    console.warn('OpenSky 数据获取失败，使用模拟数据:', e)
    // API 失败时回退模拟「在飞航班」
    if (realFlights.value.length === 0) {
      anim(rand(3200, 3900), stats, 'flying')
    }
  }
}

let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(async () => {
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
  await nextTick()
  await initAllCharts()
  initWS()
  initSSE()
  startUpdates()
  refreshRealData()
  realDataTimer = setInterval(refreshRealData, 12000)
  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    anim(rand(12800, 13200), stats, 'todayFlights')
    // flying 等待 OpenSky 数据返回后由 refreshRealData 设置
    anim(rand(185, 200), stats, 'passengers')
    anim(randf(82, 90), stats, 'onTime', 1)
    anim(rand(3400, 3600), metrics, 'domestic')
    anim(rand(860, 920), metrics, 'intl')
    anim(rand(15, 22), metrics, 'delay')
    anim(rand(20, 45), metrics, 'cancel')
  }, 200)
})
onUnmounted(() => {
  ;[clockTimer, wsTimer, sseTimer, chartTimer, realDataTimer].forEach((t) => t && clearInterval(t))
  window.removeEventListener('resize', handleResize)
  Object.values(charts).forEach((c) => c?.dispose())
  charts = {}
})
</script>

<style scoped lang="scss">
// ============ Variables ============
$bg: #040818;
$panel-bg: rgba(6, 14, 30, 0.85);
$border-base: rgba(0, 200, 255, 0.12);
$txt: #c0d0e4;
$txt2: #4a6080;
$accent-cyan: #00f0ff;

// ============ Root ============
.dashboard {
  width: 100%;
  height: 100%;
  background: $bg;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: $txt;
  position: relative;
}

// ============ Background ============
.bg-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 200, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.025) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-glow {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  &-1 {
    width: 700px;
    height: 700px;
    top: -250px;
    left: 25%;
    background: radial-gradient(circle, rgba(0, 120, 255, 0.07) 0%, transparent 70%);
  }
  &-2 {
    width: 500px;
    height: 500px;
    bottom: -150px;
    right: 5%;
    background: radial-gradient(circle, rgba(0, 200, 180, 0.05) 0%, transparent 70%);
  }
}

// ============ KPI Bar ============
.kpi-bar {
  height: 78px;
  flex-shrink: 0;
  display: flex;
  gap: 14px;
  padding: 0 20px;
  z-index: 2;
}
.kpi-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(8, 16, 35, 0.9), rgba(4, 10, 25, 0.95));
  border: 1px solid $border-base;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  transition: all 0.8s;
  &:hover {
    border-color: rgba(0, 200, 255, 0.25);
    box-shadow:
      0 0 20px rgba(0, 200, 255, 0.08),
      inset 0 0 20px rgba(0, 200, 255, 0.03);
    transform: translateY(-2px);
  }
  .kpi-glow {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    opacity: 0.6;
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
    .kpi-icon {
      color: inherit;
      display: flex;
    }
  }
  .kpi-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .kpi-value {
    font-family: 'DIN', 'Courier New', monospace;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .kpi-label {
    font-size: 10px;
    color: $txt2;
    letter-spacing: 0.5px;
  }
}

// ============ Body ============
.dash-body {
  flex: 1;
  display: flex;
  gap: 14px;
  padding: 10px 20px 14px;
  z-index: 2;
  min-height: 0;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}
.col-left,
.col-right {
  width: 340px;
  flex-shrink: 0;
}
.col-center {
  flex: 1;
  min-width: 0;
}

// ============ Panel - 流光边框 ============
.panel {
  background: $panel-bg;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(12px);
  box-shadow:
    inset 0 0 30px rgba(0, 200, 255, 0.03),
    0 0 15px rgba(0, 100, 200, 0.05);

  // 流光边框 - 使用 mask 只显示 1px 边框区域
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    padding: 1px;
    background: conic-gradient(
      from var(--border-angle, 0deg),
      transparent 0%,
      rgba(0, 240, 255, 0.6) 8%,
      rgba(0, 240, 255, 0.1) 16%,
      transparent 24%,
      transparent 50%,
      rgba(0, 200, 255, 0.25) 55%,
      transparent 62%,
      transparent 78%,
      rgba(0, 180, 255, 0.5) 85%,
      rgba(0, 180, 255, 0.1) 92%,
      transparent 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: 10;
    pointer-events: none;
    animation: borderRotate 6s linear infinite;
  }
}

@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes borderRotate {
  0% {
    --border-angle: 0deg;
  }
  100% {
    --border-angle: 360deg;
  }
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #a0c8f0;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(3, 70, 164, 0.378);
  background: linear-gradient(90deg, rgba(0, 200, 255, 0.04), transparent 60%);
  position: relative;
  z-index: 1;
  .ph-icon {
    color: rgba(0, 200, 255, 0.5);
    display: flex;
    align-items: center;
    filter: drop-shadow(0 0 2px rgba(0, 200, 255, 0.3));
  }
  .ph-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #00f0ff;
    box-shadow:
      0 0 8px rgba(0, 240, 255, 0.6),
      0 0 2px rgba(0, 240, 255, 0.9);
    &.warn {
      background: #ffaa00;
      box-shadow:
        0 0 8px rgba(255, 170, 0, 0.6),
        0 0 2px rgba(255, 170, 0, 0.9);
    }
    &.purple {
      background: #b066ff;
      box-shadow:
        0 0 8px rgba(176, 102, 255, 0.6),
        0 0 2px rgba(176, 102, 255, 0.9);
    }
    &.green {
      background: #00ff88;
      box-shadow:
        0 0 8px rgba(0, 255, 136, 0.6),
        0 0 2px rgba(0, 255, 136, 0.9);
    }
    &.gold {
      background: #ffaa00;
      box-shadow:
        0 0 8px rgba(255, 170, 0, 0.6),
        0 0 2px rgba(255, 170, 0, 0.9);
    }
    &.red {
      background: #ff4466;
      box-shadow:
        0 0 8px rgba(255, 68, 102, 0.6),
        0 0 2px rgba(255, 68, 102, 0.9);
    }
    &.cyan {
      background: #00f0ff;
      box-shadow:
        0 0 8px rgba(0, 240, 255, 0.6),
        0 0 2px rgba(0, 240, 255, 0.9);
    }
  }
  .ph-tag {
    margin-left: auto;
    font-size: 9px;
    font-weight: 600;
    color: #00f0ff;
    background: rgba(0, 240, 255, 0.06);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 2px 8px;
    border-radius: 8px;
    letter-spacing: 0.5px;
    &.sse-tag {
      color: #00bbff;
      background: rgba(0, 187, 255, 0.06);
      border-color: rgba(0, 187, 255, 0.2);
    }
  }
}
.panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}
.map-panel {
  flex: 1 !important;
}

// ============ Center Bottom ============
.center-bottom-row {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
  height: 74px;
}
.mini-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: $panel-bg;
  border-radius: 8px;
  padding: 10px 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  backdrop-filter: blur(8px);

  // 流光边框
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    padding: 1px;
    background: conic-gradient(
      from var(--border-angle, 0deg),
      transparent 0%,
      rgba(0, 200, 255, 0.4) 10%,
      transparent 20%,
      transparent 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: 10;
    pointer-events: none;
    animation: borderRotate 8s linear infinite;
  }

  &:hover {
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.08);
    transform: translateY(-2px);
  }
  .mc-icon {
    flex-shrink: 0;
    display: flex;
    opacity: 0.85;
  }
  .mc-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .mc-val {
    font-family: 'DIN', monospace;
    font-size: 17px;
    font-weight: 700;
  }
  .mc-label {
    font-size: 10px;
    color: $txt2;
  }
  .mc-trend {
    font-size: 10px;
    font-weight: 600;
    &.up {
      color: #00ff88;
    }
    &.down {
      color: #ff4466;
    }
  }
}

// ============ Alerts ============
.alerts-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  &::-webkit-scrollbar {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }
}
.alert-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 5px;
  font-size: 10px;
  line-height: 1.3;
  background: rgba(255, 255, 255, 0.015);
  border-left: 2px solid transparent;
  border: 1px solid rgba(2, 112, 176, 0.743);
  animation: slideIn 0.3s ease;
  transition: background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  &.info {
    border-left-color: #00f0ff;
  }
  &.warn {
    border-left-color: #ffaa00;
  }
  &.success {
    border-left-color: #00ff88;
  }
  &.error {
    border-left-color: #ff4466;
  }
  .ar-time {
    color: #5a8abf;
    font-family: 'DIN', monospace;
    font-size: 9px;
    flex-shrink: 0;
  }
  .ar-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #334;
    &.info {
      background: #00f0ff;
      box-shadow: 0 0 4px #00f0ff;
    }
    &.warn {
      background: #ffaa00;
      box-shadow: 0 0 4px #ffaa00;
    }
    &.success {
      background: #00ff88;
      box-shadow: 0 0 4px #00ff88;
    }
    &.error {
      background: #ff4466;
      box-shadow: 0 0 4px #ff4466;
    }
  }
  .ar-text {
    color: #8ab8e0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ============ Responsive ============
@media (max-width: 1600px) {
  .col-left,
  .col-right {
    width: 300px;
  }
}
@media (max-width: 1400px) {
  .col-left,
  .col-right {
    width: 260px;
  }
  .kpi-value {
    font-size: 17px;
  }
}
</style>
