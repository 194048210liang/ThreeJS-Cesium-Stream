<template>
  <div class="smart-building">
    <!-- 3D 渲染区域 -->
    <div class="three-canvas" ref="canvasBox"></div>

    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <div class="back-btn" @click="$emit('back')" title="返回查看器">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="back-label">查看器</span>
        </div>
        <el-divider direction="vertical" />
        <div class="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6v4H9z"/>
          </svg>
        </div>
        <span class="page-title">智慧楼宇管理系统</span>
        <span class="page-subtitle">SMART BUILDING MANAGEMENT</span>
      </div>
      <div class="top-bar-right">
        <div class="live-badge">
          <span class="live-dot"></span>
          实时监控中
        </div>
        <span class="time-text">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 左侧楼层面板 -->
    <div class="left-panel">
      <div class="panel-card">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          <span>楼层总览</span>
        </div>
        <div class="floor-list">
          <div
            v-for="floor in floors"
            :key="floor.id"
            class="floor-item"
            :class="{ active: selectedFloor?.id === floor.id, warning: floor.alertCount > 0 }"
            @click="selectFloor(floor)"
          >
            <div class="floor-indicator" :style="{ background: floor.color }"></div>
            <div class="floor-info">
              <div class="floor-name">{{ floor.name }}</div>
              <div class="floor-desc">{{ floor.type }} · {{ floor.devices }} 台设备</div>
            </div>
            <div class="floor-badges">
              <span v-if="floor.alertCount > 0" class="badge alert">{{ floor.alertCount }}</span>
              <span class="badge status" :class="floor.status">{{ floor.statusText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 整体能耗概览 -->
      <div class="panel-card">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00cec9" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>实时能耗</span>
        </div>
        <div class="energy-grid">
          <div class="energy-item">
            <div class="energy-icon water">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div class="energy-detail">
              <div class="energy-value">{{ realTimeData.water }} <small>m³/h</small></div>
              <div class="energy-label">用水量</div>
            </div>
          </div>
          <div class="energy-item">
            <div class="energy-icon electric">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div class="energy-detail">
              <div class="energy-value">{{ realTimeData.electric }} <small>kWh</small></div>
              <div class="energy-label">用电量</div>
            </div>
          </div>
          <div class="energy-item">
            <div class="energy-icon gas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" /><path d="M8 12a4 4 0 0 1 8 0" fill="none" stroke="#1a1a2e" stroke-width="2" />
              </svg>
            </div>
            <div class="energy-detail">
              <div class="energy-value">{{ realTimeData.gas }} <small>m³</small></div>
              <div class="energy-label">燃气量</div>
            </div>
          </div>
          <div class="energy-item">
            <div class="energy-icon temp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>
            <div class="energy-detail">
              <div class="energy-value">{{ realTimeData.temp }} <small>°C</small></div>
              <div class="energy-label">平均温度</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧详情面板 -->
    <div class="right-panel" :class="{ collapsed: rightCollapsed }">
      <div class="panel-toggle" @click="rightCollapsed = !rightCollapsed">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline v-if="rightCollapsed" points="9 18 15 12 9 6" />
          <polyline v-else points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="panel-card" v-show="!rightCollapsed">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>{{ selectedFloor ? selectedFloor.name + ' 详情' : '楼层详情' }}</span>
        </div>
        <div v-if="selectedFloor" class="detail-content">
          <!-- 楼层基本信息 -->
          <div class="detail-section">
            <div class="detail-title">基本信息</div>
            <div class="detail-grid">
              <div class="detail-cell">
                <div class="cell-label">楼层类型</div>
                <div class="cell-value">{{ selectedFloor.type }}</div>
              </div>
              <div class="detail-cell">
                <div class="cell-label">面积</div>
                <div class="cell-value">{{ selectedFloor.area }} m²</div>
              </div>
              <div class="detail-cell">
                <div class="cell-label">设备数</div>
                <div class="cell-value">{{ selectedFloor.devices }}</div>
              </div>
              <div class="detail-cell">
                <div class="cell-label">在线率</div>
                <div class="cell-value highlight">{{ selectedFloor.onlineRate }}%</div>
              </div>
              <div class="detail-cell">
                <div class="cell-label">温度</div>
                <div class="cell-value">{{ selectedFloor.temp }}°C</div>
              </div>
              <div class="detail-cell">
                <div class="cell-label">湿度</div>
                <div class="cell-value">{{ selectedFloor.humidity }}%</div>
              </div>
            </div>
          </div>

          <!-- 楼层水电数据 -->
          <div class="detail-section">
            <div class="detail-title">实时水电</div>
            <div class="meter-row">
              <div class="meter-item water">
                <div class="meter-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                  用水
                </div>
                <div class="meter-value">{{ selectedFloor.waterUsage }} m³/h</div>
                <div class="meter-bar">
                  <div class="meter-fill" :style="{ width: Math.min(selectedFloor.waterUsage / 5 * 100, 100) + '%' }"></div>
                </div>
              </div>
              <div class="meter-item electric">
                <div class="meter-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  用电
                </div>
                <div class="meter-value">{{ selectedFloor.electricUsage }} kWh</div>
                <div class="meter-bar">
                  <div class="meter-fill" :style="{ width: Math.min(selectedFloor.electricUsage / 200 * 100, 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 设备列表 -->
          <div class="detail-section">
            <div class="detail-title">设备状态</div>
            <div class="device-list">
              <div
                v-for="device in selectedFloor.deviceList"
                :key="device.id"
                class="device-item"
                :class="device.status"
                @click="selectDevice(device)"
              >
                <div class="device-icon">{{ device.icon }}</div>
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-meta">{{ device.location }}</div>
                </div>
                <div class="device-status-dot"></div>
              </div>
            </div>
          </div>

          <!-- 设备详情弹窗 -->
          <div v-if="selectedDevice" class="device-detail-popup">
            <div class="popup-header">
              <span>{{ selectedDevice.icon }} {{ selectedDevice.name }}</span>
              <span class="popup-close" @click="selectedDevice = null">✕</span>
            </div>
            <div class="popup-body">
              <div class="popup-row"><span class="lbl">位置</span><span>{{ selectedDevice.location }}</span></div>
              <div class="popup-row"><span class="lbl">状态</span><span :class="'txt-' + selectedDevice.status">{{ statusMap[selectedDevice.status] }}</span></div>
              <div class="popup-row"><span class="lbl">功率</span><span>{{ selectedDevice.power }} kW</span></div>
              <div class="popup-row"><span class="lbl">运行时长</span><span>{{ selectedDevice.runTime }} h</span></div>
              <div class="popup-row"><span class="lbl">今日用电</span><span>{{ selectedDevice.todayUsage }} kWh</span></div>
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span>点击左侧楼层或3D建筑查看详情</span>
        </div>
      </div>
    </div>

    <!-- 底部数据面板 -->
    <div class="bottom-panel">
      <div class="bottom-card">
        <div class="chart-box" ref="electricChartRef"></div>
        <div class="chart-label">24h 用电趋势</div>
      </div>
      <div class="bottom-card">
        <div class="chart-box" ref="waterChartRef"></div>
        <div class="chart-label">24h 用水趋势</div>
      </div>
      <div class="bottom-card">
        <div class="chart-box" ref="envChartRef"></div>
        <div class="chart-label">温湿度监控</div>
      </div>
      <div class="bottom-card stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalDevices }}</div>
          <div class="stat-label">设备总数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value online">{{ onlineDevices }}</div>
          <div class="stat-label">在线设备</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value warning">{{ alertDevices }}</div>
          <div class="stat-label">告警设备</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ offlineDevices }}</div>
          <div class="stat-label">离线设备</div>
        </div>
      </div>
    </div>

    <!-- 3D 场景中的楼层标签 -->
    <div
      v-for="floor in floors"
      :key="'label-' + floor.id"
      class="floor-label-3d"
      :class="{ active: selectedFloor?.id === floor.id }"
      :style="getFloorLabelStyle(floor)"
      @click="selectFloor(floor)"
    >
      {{ floor.name }}
    </div>

    <!-- 提示信息 -->
    <div class="hint-bar">
      <span>🖱️ 点击楼层查看详情</span>
      <span>🔄 滚轮缩放 · 拖拽旋转</span>
    </div>

    <!-- 管线控制栏 -->
    <div class="pipe-toolbar">
      <div class="pipe-toolbar-title">管线视图</div>
      <div class="pipe-btn" :class="{ active: showWaterPipes }" @click="toggleWaterPipes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        <span>水管</span>
        <span class="pipe-dot water"></span>
      </div>
      <div class="pipe-btn" :class="{ active: showElectricPipes }" @click="toggleElectricPipes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>电路</span>
        <span class="pipe-dot electric"></span>
      </div>
    </div>

    <!-- 管道信息弹窗 -->
    <div v-if="pipeInfo" class="pipe-info-popup" :style="pipeInfoStyle">
      <div class="pipe-popup-header">
        <span class="pipe-popup-icon" :class="pipeInfo.type">{{ pipeInfo.type === 'water' ? '💧' : '⚡' }}</span>
        <span class="pipe-popup-title">{{ pipeInfo.name }}</span>
        <span class="pipe-popup-close" @click="pipeInfo = null">✕</span>
      </div>
      <div class="pipe-popup-body">
        <div class="pipe-popup-row"><span class="lbl">类型</span><span>{{ pipeInfo.type === 'water' ? '供水管路' : '供电线路' }}</span></div>
        <div class="pipe-popup-row"><span class="lbl">楼层</span><span>{{ pipeInfo.floorName }}</span></div>
        <div class="pipe-popup-row"><span class="lbl">{{ pipeInfo.type === 'water' ? '流速' : '电流' }}</span><span>{{ pipeInfo.flow }}</span></div>
        <div class="pipe-popup-row"><span class="lbl">{{ pipeInfo.type === 'water' ? '压力' : '电压' }}</span><span>{{ pipeInfo.pressure }}</span></div>
        <div class="pipe-popup-row"><span class="lbl">状态</span><span :class="'txt-' + pipeInfo.status">{{ pipeInfo.statusText }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as echarts from 'echarts'

// ============ Emits ============
defineEmits<{ back: [] }>()

// ============ 当前时间 ============
const currentTime = ref('')
let timeTimer: number | null = null
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ============ DOM 引用 ============
const canvasBox = ref<HTMLDivElement | null>(null)
const electricChartRef = ref<HTMLDivElement | null>(null)
const waterChartRef = ref<HTMLDivElement | null>(null)
const envChartRef = ref<HTMLDivElement | null>(null)

// ============ Three.js 核心 ============
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number | null = null

// ============ 楼层数据 ============
interface Device {
  id: string
  name: string
  icon: string
  location: string
  status: 'online' | 'warning' | 'offline'
  power: number
  runTime: number
  todayUsage: number
}

interface FloorData {
  id: number
  name: string
  type: string
  color: string
  area: number
  devices: number
  onlineRate: number
  temp: number
  humidity: number
  waterUsage: number
  electricUsage: number
  alertCount: number
  status: string
  statusText: string
  deviceList: Device[]
}

const floors = reactive<FloorData[]>([
  {
    id: 1, name: 'B1 地下层', type: '停车场', color: '#636e72',
    area: 1200, devices: 24, onlineRate: 95.8, temp: 18, humidity: 55,
    waterUsage: 0.8, electricUsage: 45, alertCount: 1, status: 'warning', statusText: '告警',
    deviceList: [
      { id: 'd1-1', name: '排风机组 A', icon: '💨', location: 'B1-西区', status: 'online', power: 7.5, runTime: 2847, todayUsage: 32 },
      { id: 'd1-2', name: '排风机组 B', icon: '💨', location: 'B1-东区', status: 'warning', power: 7.5, runTime: 2847, todayUsage: 35 },
      { id: 'd1-3', name: '消防水泵', icon: '🚰', location: 'B1-中控', status: 'online', power: 15, runTime: 0, todayUsage: 0 },
      { id: 'd1-4', name: '照明控制', icon: '💡', location: 'B1-全域', status: 'online', power: 3.2, runTime: 4320, todayUsage: 12 },
    ],
  },
  {
    id: 2, name: '1F 大厅', type: '接待/展示', color: '#0984e3',
    area: 950, devices: 32, onlineRate: 100, temp: 24, humidity: 48,
    waterUsage: 1.2, electricUsage: 86, alertCount: 0, status: 'online', statusText: '正常',
    deviceList: [
      { id: 'd2-1', name: '中央空调', icon: '❄️', location: '1F-大厅', status: 'online', power: 25, runTime: 4320, todayUsage: 180 },
      { id: 'd2-2', name: '智能照明', icon: '💡', location: '1F-全域', status: 'online', power: 5, runTime: 2880, todayUsage: 24 },
      { id: 'd2-3', name: '安防摄像头', icon: '📷', location: '1F-入口', status: 'online', power: 0.5, runTime: 8640, todayUsage: 3 },
      { id: 'd2-4', name: '闸机系统', icon: '🚪', location: '1F-大厅', status: 'online', power: 2, runTime: 4320, todayUsage: 15 },
    ],
  },
  {
    id: 3, name: '2F 办公区', type: '开放办公', color: '#00b894',
    area: 880, devices: 45, onlineRate: 97.8, temp: 23, humidity: 45,
    waterUsage: 2.1, electricUsage: 156, alertCount: 0, status: 'online', statusText: '正常',
    deviceList: [
      { id: 'd3-1', name: '中央空调', icon: '❄️', location: '2F-中区', status: 'online', power: 30, runTime: 4320, todayUsage: 210 },
      { id: 'd3-2', name: '新风系统', icon: '🌬️', location: '2F-全域', status: 'online', power: 8, runTime: 4320, todayUsage: 56 },
      { id: 'd3-3', name: '智能照明', icon: '💡', location: '2F-全域', status: 'online', power: 6, runTime: 2880, todayUsage: 28 },
      { id: 'd3-4', name: '打印机', icon: '🖨️', location: '2F-东区', status: 'online', power: 1.2, runTime: 480, todayUsage: 4 },
    ],
  },
  {
    id: 4, name: '3F 会议室', type: '会议/培训', color: '#fdcb6e',
    area: 880, devices: 28, onlineRate: 92.9, temp: 25, humidity: 50,
    waterUsage: 0.9, electricUsage: 120, alertCount: 2, status: 'warning', statusText: '告警',
    deviceList: [
      { id: 'd4-1', name: '中央空调', icon: '❄️', location: '3F-中区', status: 'online', power: 25, runTime: 4320, todayUsage: 175 },
      { id: 'd4-2', name: '投影系统', icon: '📽️', location: '3F-A会议室', status: 'warning', power: 2.5, runTime: 240, todayUsage: 8 },
      { id: 'd4-3', name: '视频会议', icon: '📺', location: '3F-B会议室', status: 'offline', power: 3, runTime: 0, todayUsage: 0 },
      { id: 'd4-4', name: '智能照明', icon: '💡', location: '3F-全域', status: 'online', power: 4, runTime: 2880, todayUsage: 18 },
    ],
  },
  {
    id: 5, name: '4F 机房', type: '数据中心', color: '#e17055',
    area: 600, devices: 38, onlineRate: 94.7, temp: 22, humidity: 40,
    waterUsage: 3.5, electricUsage: 380, alertCount: 1, status: 'warning', statusText: '告警',
    deviceList: [
      { id: 'd5-1', name: '精密空调 A', icon: '❄️', location: '4F-主机房', status: 'online', power: 45, runTime: 8640, todayUsage: 320 },
      { id: 'd5-2', name: '精密空调 B', icon: '❄️', location: '4F-主机房', status: 'online', power: 45, runTime: 8640, todayUsage: 318 },
      { id: 'd5-3', name: 'UPS电源', icon: '🔋', location: '4F-电源室', status: 'warning', power: 10, runTime: 8640, todayUsage: 72 },
      { id: 'd5-4', name: '动环监控', icon: '📊', location: '4F-监控室', status: 'online', power: 0.8, runTime: 8640, todayUsage: 6 },
    ],
  },
])

const selectedFloor = ref<FloorData | null>(null)
const selectedDevice = ref<Device | null>(null)
const rightCollapsed = ref(false)

const statusMap: Record<string, string> = { online: '正常运行', warning: '告警中', offline: '已离线' }

// 实时数据
const realTimeData = reactive({ water: 8.5, electric: 787, gas: 12.3, temp: 23.5 })

// 统计
const totalDevices = computed(() => floors.reduce((s, f) => s + f.devices, 0))
const onlineDevices = computed(() => floors.reduce((s, f) => s + f.deviceList.filter(d => d.status === 'online').length, 0))
const alertDevices = computed(() => floors.reduce((s, f) => s + f.deviceList.filter(d => d.status === 'warning').length, 0))
const offlineDevices = computed(() => floors.reduce((s, f) => s + f.deviceList.filter(d => d.status === 'offline').length, 0))

// ============ 楼层3D对象映射 ============
const floorMeshMap = new Map<number, THREE.Group>()
let floorLabels: { floor: FloorData; position: THREE.Vector3 }[] = []
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// ============ 管线系统 ============
const showWaterPipes = ref(true)
const showElectricPipes = ref(true)
let waterPipeGroup: THREE.Group | null = null
let electricPipeGroup: THREE.Group | null = null

// 流动粒子
interface FlowParticle {
  mesh: THREE.Mesh
  curve: THREE.CatmullRomCurve3
  progress: number
  speed: number
}
const flowParticles: FlowParticle[] = []

// 管道点击信息
interface PipeInfoData {
  type: 'water' | 'electric'
  name: string
  floorName: string
  flow: string
  pressure: string
  status: string
  statusText: string
  screenX: number
  screenY: number
}
const pipeInfo = ref<PipeInfoData | null>(null)
const pipeInfoStyle = computed(() => {
  if (!pipeInfo.value) return {}
  return {
    left: pipeInfo.value.screenX + 'px',
    top: pipeInfo.value.screenY + 'px',
  }
})

// ============ 初始化3D场景 ============
const initThree = () => {
  if (!canvasBox.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e1a)
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.025)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(18, 14, 18)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  canvasBox.value.appendChild(renderer.domElement)

  // 灯光
  const ambient = new THREE.AmbientLight(0xb0c4de, 0.5)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
  dirLight.position.set(10, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  dirLight.shadow.camera.left = -20
  dirLight.shadow.camera.right = 20
  dirLight.shadow.camera.top = 20
  dirLight.shadow.camera.bottom = -20
  scene.add(dirLight)

  const hemiLight = new THREE.HemisphereLight(0x4fc3f7, 0x1a1a2e, 0.3)
  scene.add(hemiLight)

  // 地面
  const groundGeo = new THREE.PlaneGeometry(60, 60)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f1525, roughness: 0.95, metalness: 0.05 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 网格
  const grid = new THREE.GridHelper(60, 60, 0x1a2540, 0x121a30)
  scene.add(grid)

  // 构建建筑
  buildArchitecture()

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, 5, 0)
  controls.minDistance = 5
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI / 2 + 0.2

  // 事件
  renderer.domElement.addEventListener('click', onCanvasClick)
  window.addEventListener('resize', onResize)

  animate()
}

// ============ 构建建筑模型 ============
const buildArchitecture = () => {
  const buildingGroup = new THREE.Group()
  buildingGroup.name = 'building'

  const floorHeight = 2.4
  const buildingWidth = 8
  const buildingDepth = 6
  const gap = 0.15

  floors.forEach((floorData, index) => {
    const floorGroup = new THREE.Group()
    floorGroup.name = `floor-${floorData.id}`
    floorGroup.userData = { floorId: floorData.id }

    const y = index * (floorHeight + gap)

    // 楼层主体 - 半透明
    const floorGeo = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth)
    const floorColor = new THREE.Color(floorData.color)
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: floorColor,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.1,
      transmission: 0.1,
      side: THREE.DoubleSide,
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.position.y = y + floorHeight / 2
    floorMesh.castShadow = true
    floorMesh.receiveShadow = true
    floorMesh.userData = { floorId: floorData.id }
    floorGroup.add(floorMesh)

    // 楼层边框线
    const edgesGeo = new THREE.EdgesGeometry(floorGeo)
    const edgesMat = new THREE.LineBasicMaterial({ color: floorColor.clone().multiplyScalar(1.5), transparent: true, opacity: 0.6 })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    edges.position.copy(floorMesh.position)
    floorGroup.add(edges)

    // 窗户效果 - 随机发光面片
    const windowCount = 6
    for (let i = 0; i < windowCount; i++) {
      const wGeo = new THREE.PlaneGeometry(0.6, 0.8)
      const isLit = Math.random() > 0.3
      const wMat = new THREE.MeshBasicMaterial({
        color: isLit ? 0xf0e68c : 0x2a2a4a,
        transparent: true,
        opacity: isLit ? 0.7 + Math.random() * 0.3 : 0.3,
      })
      const wMesh = new THREE.Mesh(wGeo, wMat)

      const side = Math.floor(Math.random() * 4)
      const wx = (Math.random() - 0.5) * (buildingWidth - 1.5)
      const wz = (Math.random() - 0.5) * (buildingDepth - 1.5)

      if (side === 0) {
        wMesh.position.set(wx, y + floorHeight * (0.3 + Math.random() * 0.5), buildingDepth / 2 + 0.01)
      } else if (side === 1) {
        wMesh.position.set(wx, y + floorHeight * (0.3 + Math.random() * 0.5), -buildingDepth / 2 - 0.01)
        wMesh.rotation.y = Math.PI
      } else if (side === 2) {
        wMesh.position.set(buildingWidth / 2 + 0.01, y + floorHeight * (0.3 + Math.random() * 0.5), wz)
        wMesh.rotation.y = Math.PI / 2
      } else {
        wMesh.position.set(-buildingWidth / 2 - 0.01, y + floorHeight * (0.3 + Math.random() * 0.5), wz)
        wMesh.rotation.y = -Math.PI / 2
      }
      floorGroup.add(wMesh)
    }

    // 设备标记点
    floorData.deviceList.forEach((device, di) => {
      const markerGeo = new THREE.SphereGeometry(0.12, 16, 16)
      const markerColor = device.status === 'online' ? 0x3fb950 : device.status === 'warning' ? 0xf0b429 : 0x636e72
      const markerMat = new THREE.MeshBasicMaterial({ color: markerColor })
      const marker = new THREE.Mesh(markerGeo, markerMat)
      const angle = (di / floorData.deviceList.length) * Math.PI * 2
      const radius = 1.5 + Math.random()
      marker.position.set(
        Math.cos(angle) * radius,
        y + floorHeight * 0.5,
        Math.sin(angle) * radius,
      )
      marker.userData = { deviceId: device.id, floorId: floorData.id }
      floorGroup.add(marker)

      // 脉冲环效果
      if (device.status === 'warning') {
        const ringGeo = new THREE.RingGeometry(0.15, 0.25, 32)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf0b429, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.position.copy(marker.position)
        ring.lookAt(camera?.position || new THREE.Vector3(0, 10, 0))
        ring.userData = { isPulse: true }
        floorGroup.add(ring)
      }
    })

    // 记录楼层标签位置
    floorLabels.push({
      floor: floorData,
      position: new THREE.Vector3(buildingWidth / 2 + 1.5, y + floorHeight / 2, 0),
    })

    floorMeshMap.set(floorData.id, floorGroup)
    buildingGroup.add(floorGroup)
  })

  // 楼顶天线
  const antennaGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 8)
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0x8b949e, metalness: 0.8, roughness: 0.2 })
  const antenna = new THREE.Mesh(antennaGeo, antennaMat)
  antenna.position.y = floors.length * (floorHeight + gap)
  buildingGroup.add(antenna)

  // 天线灯
  const tipGeo = new THREE.SphereGeometry(0.1, 16, 16)
  const tipMat = new THREE.MeshBasicMaterial({ color: 0xff4444 })
  const tip = new THREE.Mesh(tipGeo, tipMat)
  tip.position.y = floors.length * (floorHeight + gap) + 1.5
  tip.userData = { isAntennaTip: true }
  buildingGroup.add(tip)

  // 周围装饰建筑
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const dist = 15
    const h = 3 + Math.random() * 6
    const decoGeo = new THREE.BoxGeometry(2 + Math.random() * 2, h, 2 + Math.random() * 2)
    const decoMat = new THREE.MeshStandardMaterial({
      color: 0x151b2e,
      roughness: 0.8,
      metalness: 0.2,
    })
    const deco = new THREE.Mesh(decoGeo, decoMat)
    deco.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist)
    deco.castShadow = true
    scene.add(deco)

    // 装饰建筑的发光窗户
    const decoEdgeGeo = new THREE.EdgesGeometry(decoGeo)
    const decoEdgeMat = new THREE.LineBasicMaterial({ color: 0x2a3550, transparent: true, opacity: 0.4 })
    const decoEdge = new THREE.LineSegments(decoEdgeGeo, decoEdgeMat)
    decoEdge.position.copy(deco.position)
    scene.add(decoEdge)
  }

  scene.add(buildingGroup)

  // 构建管线系统
  buildPipes()
}

// ============ 构建管线系统 ============
const buildPipes = () => {
  const floorHeight = 2.4
  const gap = 0.15
  const step = floorHeight + gap
  const bw = 8 // buildingWidth
  const bd = 6 // buildingDepth

  // ---- 水管（蓝色，左侧，沿左外墙 + 前墙走） ----
  waterPipeGroup = new THREE.Group()
  waterPipeGroup.name = 'waterPipes'

  // 主供水管：从地下左侧进入，沿左外墙竖直贯穿
  const waterMainPoints: THREE.Vector3[] = [
    new THREE.Vector3(-bw / 2 - 1.5, -1.5, 0),
    new THREE.Vector3(-bw / 2 - 0.6, -0.5, 0),
    new THREE.Vector3(-bw / 2 - 0.6, 0.3, 0),
  ]
  for (let i = 0; i < floors.length; i++) {
    const y = i * step + floorHeight * 0.5
    waterMainPoints.push(new THREE.Vector3(-bw / 2 - 0.6, y, 0))
  }
  const waterMainCurve = new THREE.CatmullRomCurve3(waterMainPoints)
  const waterMainGeo = new THREE.TubeGeometry(waterMainCurve, 64, 0.12, 8, false)
  const waterMainMat = new THREE.MeshPhysicalMaterial({
    color: 0x0984e3,
    emissive: 0x0984e3,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.9,
    roughness: 0.3,
    metalness: 0.5,
  })
  const waterMainMesh = new THREE.Mesh(waterMainGeo, waterMainMat)
  waterMainMesh.userData = { pipeType: 'water', pipeName: '主供水管', floorId: 0 }
  waterPipeGroup.add(waterMainMesh)

  // 每层水平分支水管：沿左外墙 → 前墙延伸，不穿越到右侧
  floors.forEach((floor, i) => {
    const y = i * step + floorHeight * 0.5
    const branchPoints: THREE.Vector3[] = [
      new THREE.Vector3(-bw / 2 - 0.6, y, 0),
      new THREE.Vector3(-bw / 2 - 0.3, y, -0.5),
      new THREE.Vector3(-bw / 2 + 0.5, y, -bd / 2 + 0.3),
      new THREE.Vector3(-1, y, -bd / 2 + 0.3),
      new THREE.Vector3(0, y, -bd / 2 + 0.8),
    ]
    const branchCurve = new THREE.CatmullRomCurve3(branchPoints)
    const branchGeo = new THREE.TubeGeometry(branchCurve, 32, 0.08, 8, false)
    const branchMat = new THREE.MeshPhysicalMaterial({
      color: 0x74b9ff,
      emissive: 0x0984e3,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3,
      metalness: 0.4,
    })
    const branchMesh = new THREE.Mesh(branchGeo, branchMat)
    branchMesh.userData = { pipeType: 'water', pipeName: `${floor.name}供水支管`, floorId: floor.id }
    waterPipeGroup!.add(branchMesh)

    // 水表节点（左前角外墙）
    const meterGeo = new THREE.BoxGeometry(0.25, 0.2, 0.2)
    const meterMat = new THREE.MeshBasicMaterial({ color: 0x0984e3 })
    const meter = new THREE.Mesh(meterGeo, meterMat)
    meter.position.set(-bw / 2 + 0.5, y, -bd / 2 + 0.3)
    meter.userData = { pipeType: 'water', pipeName: `${floor.name}水表`, floorId: floor.id, isMeter: true }
    waterPipeGroup!.add(meter)

    // 流动粒子
    addFlowParticles(branchCurve, 0x74b9ff, 3, 0.002 + Math.random() * 0.001)
  })

  // 主管流动粒子
  addFlowParticles(waterMainCurve, 0x0984e3, 5, 0.003)

  scene.add(waterPipeGroup)

  // ---- 电路（黄色，右侧，沿右外墙 + 后墙走） ----
  electricPipeGroup = new THREE.Group()
  electricPipeGroup.name = 'electricPipes'

  // 主供电缆：从地下右侧进入，沿右外墙竖直贯穿
  const elecMainPoints: THREE.Vector3[] = [
    new THREE.Vector3(bw / 2 + 1.5, -1.5, 0),
    new THREE.Vector3(bw / 2 + 0.6, -0.5, 0),
    new THREE.Vector3(bw / 2 + 0.6, 0.3, 0),
  ]
  for (let i = 0; i < floors.length; i++) {
    const y = i * step + floorHeight * 0.65
    elecMainPoints.push(new THREE.Vector3(bw / 2 + 0.6, y, 0))
  }
  const elecMainCurve = new THREE.CatmullRomCurve3(elecMainPoints)
  const elecMainGeo = new THREE.TubeGeometry(elecMainCurve, 64, 0.12, 8, false)
  const elecMainMat = new THREE.MeshPhysicalMaterial({
    color: 0xf39c12,
    emissive: 0xf39c12,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9,
    roughness: 0.3,
    metalness: 0.6,
  })
  const elecMainMesh = new THREE.Mesh(elecMainGeo, elecMainMat)
  elecMainMesh.userData = { pipeType: 'electric', pipeName: '主供电缆', floorId: 0 }
  electricPipeGroup.add(elecMainMesh)

  // 每层水平分支电缆：沿右外墙 → 后墙延伸，不穿越到左侧
  floors.forEach((floor, i) => {
    const y = i * step + floorHeight * 0.65
    const branchPoints: THREE.Vector3[] = [
      new THREE.Vector3(bw / 2 + 0.6, y, 0),
      new THREE.Vector3(bw / 2 + 0.3, y, 0.5),
      new THREE.Vector3(bw / 2 - 0.5, y, bd / 2 - 0.3),
      new THREE.Vector3(1, y, bd / 2 - 0.3),
      new THREE.Vector3(0, y, bd / 2 - 0.8),
    ]
    const branchCurve = new THREE.CatmullRomCurve3(branchPoints)
    const branchGeo = new THREE.TubeGeometry(branchCurve, 32, 0.08, 8, false)
    const branchMat = new THREE.MeshPhysicalMaterial({
      color: 0xffeaa7,
      emissive: 0xf39c12,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3,
      metalness: 0.5,
    })
    const branchMesh = new THREE.Mesh(branchGeo, branchMat)
    branchMesh.userData = { pipeType: 'electric', pipeName: `${floor.name}供电支线`, floorId: floor.id }
    electricPipeGroup!.add(branchMesh)

    // 配电箱节点（右后角外墙）
    const panelGeo = new THREE.BoxGeometry(0.3, 0.35, 0.15)
    const panelMat = new THREE.MeshBasicMaterial({ color: 0xf39c12 })
    const panel = new THREE.Mesh(panelGeo, panelMat)
    panel.position.set(bw / 2 - 0.5, y, bd / 2 - 0.3)
    panel.userData = { pipeType: 'electric', pipeName: `${floor.name}配电箱`, floorId: floor.id, isPanel: true }
    electricPipeGroup!.add(panel)

    // 流动粒子
    addFlowParticles(branchCurve, 0xffeaa7, 3, 0.003 + Math.random() * 0.002)
  })

  // 主缆流动粒子
  addFlowParticles(elecMainCurve, 0xf39c12, 5, 0.004)

  scene.add(electricPipeGroup)
}

// 添加沿曲线流动的粒子
const addFlowParticles = (curve: THREE.CatmullRomCurve3, color: number, count: number, speed: number) => {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.07, 8, 8)
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const progress = i / count
    const pos = curve.getPoint(progress)
    mesh.position.copy(pos)
    mesh.userData = { isFlowParticle: true }
    // 粒子不参与射线检测，避免遮挡管道点击
    mesh.raycast = () => {}
    scene.add(mesh)
    flowParticles.push({ mesh, curve, progress, speed })
  }
}

// ============ 管线显隐控制 ============
const toggleWaterPipes = () => {
  showWaterPipes.value = !showWaterPipes.value
  if (waterPipeGroup) waterPipeGroup.visible = showWaterPipes.value
  // 同步粒子
  flowParticles.forEach(p => {
    if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
      const isWater = (p.mesh.material.color.getHex() === 0x0984e3 || p.mesh.material.color.getHex() === 0x74b9ff)
      if (isWater) p.mesh.visible = showWaterPipes.value
    }
  })
}

const toggleElectricPipes = () => {
  showElectricPipes.value = !showElectricPipes.value
  if (electricPipeGroup) electricPipeGroup.visible = showElectricPipes.value
  flowParticles.forEach(p => {
    if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
      const isElec = (p.mesh.material.color.getHex() === 0xf39c12 || p.mesh.material.color.getHex() === 0xffeaa7)
      if (isElec) p.mesh.visible = showElectricPipes.value
    }
  })
}

// ============ 楼层标签位置 ============
const getFloorLabelStyle = (floor: FloorData) => {
  const labelData = floorLabels.find(l => l.floor.id === floor.id)
  if (!labelData || !camera) return { display: 'none' }

  const pos = labelData.position.clone()
  pos.project(camera)

  const x = (pos.x * 0.5 + 0.5) * window.innerWidth
  const y = (-pos.y * 0.5 + 0.5) * window.innerHeight

  if (pos.z > 1) return { display: 'none' }

  return {
    left: x + 'px',
    top: y + 'px',
    transform: 'translate(-50%, -50%)',
  }
}

// ============ 选中楼层 ============
const selectFloor = (floor: FloorData) => {
  selectedFloor.value = floor
  selectedDevice.value = null
  rightCollapsed.value = false

  // 高亮3D楼层
  floorMeshMap.forEach((group, id) => {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial && !child.userData.deviceId) {
        if (id === floor.id) {
          child.material.opacity = 0.55
          child.material.emissive = new THREE.Color(floor.color)
          child.material.emissiveIntensity = 0.3
        } else {
          child.material.opacity = 0.15
          child.material.emissive = new THREE.Color(0x000000)
          child.material.emissiveIntensity = 0
        }
      }
    })
  })

  // 相机聚焦到该楼层
  const floorIndex = floors.findIndex(f => f.id === floor.id)
  const targetY = floorIndex * 2.55 + 1.2
  animateCamera(targetY)
}

const animateCamera = (targetY: number) => {
  if (!controls) return
  const startY = controls.target.y
  const endY = targetY
  const duration = 600
  const startTime = performance.now()

  const step = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1)
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    controls.target.y = startY + (endY - startY) * ease
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const selectDevice = (device: Device) => {
  selectedDevice.value = device
}

// ============ 3D 点击事件 ============
const onCanvasClick = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children, true)

  // 优先检测管道
  const pipeHit = intersects.find(i => i.object.userData?.pipeType)
  if (pipeHit) {
    const data = pipeHit.object.userData
    const floor = floors.find(f => f.id === data.floorId)
    const isWater = data.pipeType === 'water'
    pipeInfo.value = {
      type: data.pipeType,
      name: data.pipeName,
      floorName: floor?.name || '公共管线',
      flow: isWater ? `${(0.5 + Math.random() * 3).toFixed(1)} m³/h` : `${(10 + Math.random() * 30).toFixed(0)} A`,
      pressure: isWater ? `${(0.2 + Math.random() * 0.4).toFixed(2)} MPa` : `${(218 + Math.random() * 5).toFixed(0)} V`,
      status: floor?.status || 'online',
      statusText: floor?.status === 'warning' ? '异常' : '正常',
      screenX: event.clientX + 12,
      screenY: event.clientY - 12,
    }
    return
  }

  // 关闭管道弹窗
  pipeInfo.value = null

  // 楼层点击
  const hit = intersects.find(i => i.object.userData?.floorId)
  if (hit) {
    const floorId = hit.object.userData.floorId
    const floor = floors.find(f => f.id === floorId)
    if (floor) selectFloor(floor)
  }
}

// ============ 动画循环 ============
const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (controls) controls.update()

  // 天线灯闪烁
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData?.isAntennaTip) {
      (child.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5
      ;(child.material as THREE.MeshBasicMaterial).transparent = true
    }
    // 脉冲环
    if (child instanceof THREE.Mesh && child.userData?.isPulse) {
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.3
      child.scale.set(s, s, s)
      ;(child.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.3
    }
  })

  // 流动粒子动画
  flowParticles.forEach(p => {
    if (!p.mesh.visible) return
    p.progress += p.speed
    if (p.progress > 1) p.progress -= 1
    const pos = p.curve.getPoint(p.progress)
    p.mesh.position.copy(pos)
    // 粒子闪烁
    ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(Date.now() * 0.008 + p.progress * 10) * 0.4
  })

  renderer.render(scene, camera)
}

// ============ 窗口缩放 ============
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// ============ ECharts 图表 ============
let electricChart: echarts.ECharts | null = null
let waterChart: echarts.ECharts | null = null
let envChart: echarts.ECharts | null = null

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

const initCharts = () => {
  const chartTheme = {
    textStyle: { color: '#8b949e', fontSize: 10 },
  }

  // 用电图
  if (electricChartRef.value) {
    electricChart = echarts.init(electricChartRef.value)
    electricChart.setOption({
      ...chartTheme,
      grid: { left: 35, right: 10, top: 10, bottom: 22 },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#2a3040' } }, axisLabel: { fontSize: 8, interval: 5 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1a2030' } }, axisLabel: { fontSize: 8 } },
      series: [{
        type: 'line', smooth: true, data: generateElectricData(), symbol: 'none',
        lineStyle: { color: '#fdcb6e', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(253,203,110,0.3)' },
          { offset: 1, color: 'rgba(253,203,110,0)' },
        ])},
      }],
    })
  }

  // 用水图
  if (waterChartRef.value) {
    waterChart = echarts.init(waterChartRef.value)
    waterChart.setOption({
      ...chartTheme,
      grid: { left: 30, right: 10, top: 10, bottom: 22 },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#2a3040' } }, axisLabel: { fontSize: 8, interval: 5 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1a2030' } }, axisLabel: { fontSize: 8 } },
      series: [{
        type: 'bar', data: generateWaterData(), barWidth: 6,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0984e3' },
          { offset: 1, color: '#0652DD' },
        ]), borderRadius: [2, 2, 0, 0] },
      }],
    })
  }

  // 温湿度图
  if (envChartRef.value) {
    envChart = echarts.init(envChartRef.value)
    envChart.setOption({
      ...chartTheme,
      grid: { left: 35, right: 30, top: 10, bottom: 22 },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#2a3040' } }, axisLabel: { fontSize: 8, interval: 5 } },
      yAxis: [
        { type: 'value', splitLine: { lineStyle: { color: '#1a2030' } }, axisLabel: { fontSize: 8 }, name: '°C', nameTextStyle: { fontSize: 8, color: '#8b949e' } },
        { type: 'value', splitLine: { show: false }, axisLabel: { fontSize: 8 }, name: '%', nameTextStyle: { fontSize: 8, color: '#8b949e' } },
      ],
      series: [
        {
          type: 'line', smooth: true, data: generateTempData(), symbol: 'none',
          lineStyle: { color: '#e17055', width: 2 },
        },
        {
          type: 'line', smooth: true, data: generateHumidityData(), symbol: 'none', yAxisIndex: 1,
          lineStyle: { color: '#00cec9', width: 2, type: 'dashed' },
        },
      ],
    })
  }
}

const generateElectricData = () => Array.from({ length: 24 }, (_, i) => {
  const base = i >= 8 && i <= 22 ? 160 : 60
  return Math.round(base + Math.random() * 50)
})

const generateWaterData = () => Array.from({ length: 24 }, (_, i) => {
  const base = i >= 7 && i <= 22 ? 3 : 0.5
  return +(base + Math.random() * 1.5).toFixed(1)
})

const generateTempData = () => Array.from({ length: 24 }, () => +(20 + Math.random() * 6).toFixed(1))
const generateHumidityData = () => Array.from({ length: 24 }, () => +(35 + Math.random() * 25).toFixed(0))

// ============ 模拟实时数据更新 ============
let dataTimer: number | null = null

const startDataSimulation = () => {
  dataTimer = window.setInterval(() => {
    // 更新整体实时数据
    realTimeData.water = +(7 + Math.random() * 4).toFixed(1)
    realTimeData.electric = Math.round(700 + Math.random() * 200)
    realTimeData.gas = +(10 + Math.random() * 5).toFixed(1)
    realTimeData.temp = +(22 + Math.random() * 4).toFixed(1)

    // 更新每个楼层的实时数据
    floors.forEach(floor => {
      floor.waterUsage = +(floor.waterUsage + (Math.random() - 0.5) * 0.3).toFixed(1)
      floor.electricUsage = Math.round(floor.electricUsage + (Math.random() - 0.5) * 10)
      floor.temp = +(floor.temp + (Math.random() - 0.5) * 0.5).toFixed(1)
      floor.humidity = Math.round(floor.humidity + (Math.random() - 0.5) * 2)
    })

    // 更新图表
    if (electricChart) {
      electricChart.setOption({ series: [{ data: generateElectricData() }] })
    }
    if (waterChart) {
      waterChart.setOption({ series: [{ data: generateWaterData() }] })
    }
    if (envChart) {
      envChart.setOption({ series: [{ data: generateTempData() }, { data: generateHumidityData() }] })
    }
  }, 3000)
}

// ============ 生命周期 ============
onMounted(() => {
  initThree()
  nextTick(() => {
    initCharts()
  })
  startDataSimulation()
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)

  window.addEventListener('resize', () => {
    electricChart?.resize()
    waterChart?.resize()
    envChart?.resize()
  })
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (dataTimer) clearInterval(dataTimer)
  if (timeTimer) clearInterval(timeTimer)
  window.removeEventListener('resize', onResize)
  renderer?.domElement.removeEventListener('click', onCanvasClick)
  controls?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
  electricChart?.dispose()
  waterChart?.dispose()
  envChart?.dispose()
})
</script>

<style scoped lang="scss">
$bg-dark: #0a0e1a;
$bg-card: rgba(16, 22, 36, 0.92);
$bg-hover: rgba(30, 40, 60, 0.8);
$border: rgba(255, 255, 255, 0.06);
$text-primary: #e6edf3;
$text-secondary: #8b949e;
$text-muted: #484f58;
$accent: #6c5ce7;
$accent-light: #a29bfe;
$accent-bg: rgba(108, 92, 231, 0.15);
$green: #3fb950;
$yellow: #f0b429;
$red: #f85149;
$radius: 10px;

.smart-building {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: $bg-dark;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  .three-canvas {
    width: 100%;
    height: 100%;
    canvas { display: block; }
  }

  // ============ 顶部导航栏 ============
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: rgba(10, 14, 26, 0.88);
    backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 25;

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .back-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 10px;
        border-radius: 8px;
        cursor: pointer;
        color: $text-secondary;
        background: rgba(255,255,255,0.04);
        border: 1px solid $border;
        transition: all 0.2s;

        .back-label {
          font-size: 11px;
          font-weight: 500;
        }

        &:hover {
          background: $accent-bg;
          color: $accent-light;
          border-color: rgba(108, 92, 231, 0.3);
        }
      }

      .el-divider { border-color: $text-muted; }

      .logo-icon {
        display: flex;
        align-items: center;
      }

      .page-title {
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
        letter-spacing: 0.5px;
      }

      .page-subtitle {
        font-size: 10px;
        color: $text-muted;
        letter-spacing: 1.5px;
        font-weight: 400;
      }
    }

    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .live-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: $green;
        font-weight: 500;

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: $green;
          box-shadow: 0 0 6px rgba(63,185,80,0.6);
          animation: pulse-green 2s infinite;
        }
      }

      .time-text {
        font-size: 12px;
        color: $text-secondary;
        font-variant-numeric: tabular-nums;
        font-family: 'SF Mono', 'Cascadia Code', monospace;
      }
    }
  }

  @keyframes pulse-green {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(63,185,80,0.6); }
    50% { opacity: 0.6; box-shadow: 0 0 2px rgba(63,185,80,0.3); }
  }

  // ============ 左侧面板 ============
  .left-panel {
    position: absolute;
    top: 56px;
    left: 12px;
    bottom: 140px;
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 15;
    pointer-events: auto;
  }

  .panel-card {
    background: $bg-card;
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid $border;
    border-radius: $radius;
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid $border;
      font-size: 13px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  // ============ 楼层列表 ============
  .floor-list {
    max-height: 280px;
    overflow-y: auto;
    padding: 4px;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  }

  .floor-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { background: $bg-hover; }
    &.active { background: $accent-bg; }

    &.warning {
      .floor-indicator { animation: pulse-warn 2s infinite; }
    }

    .floor-indicator {
      width: 4px;
      height: 32px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .floor-info {
      flex: 1;
      min-width: 0;
      .floor-name { font-size: 12px; color: $text-primary; font-weight: 500; }
      .floor-desc { font-size: 10px; color: $text-muted; margin-top: 2px; }
    }

    .floor-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;

      .badge {
        font-size: 9px;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 600;

        &.alert { background: rgba(240,180,41,0.15); color: $yellow; }
        &.status {
          &.online { background: rgba(63,185,80,0.12); color: $green; }
          &.warning { background: rgba(240,180,41,0.12); color: $yellow; }
          &.offline { background: rgba(248,81,73,0.12); color: $red; }
        }
      }
    }
  }

  // ============ 能耗面板 ============
  .energy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 10px;
  }

  .energy-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: 8px;

    .energy-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.water { background: rgba(9,132,227,0.15); color: #0984e3; }
      &.electric { background: rgba(253,203,110,0.15); color: #fdcb6e; }
      &.gas { background: rgba(225,112,85,0.15); color: #e17055; }
      &.temp { background: rgba(0,206,201,0.15); color: #00cec9; }
    }

    .energy-detail {
      .energy-value {
        font-size: 14px;
        font-weight: 700;
        color: $text-primary;
        font-variant-numeric: tabular-nums;
        small { font-size: 9px; color: $text-muted; font-weight: 400; }
      }
      .energy-label { font-size: 10px; color: $text-muted; }
    }
  }

  // ============ 右侧面板 ============
  .right-panel {
    position: absolute;
    top: 56px;
    right: 12px;
    bottom: 140px;
    width: 280px;
    z-index: 15;
    transition: width 0.3s;

    &.collapsed { width: 36px; }

    .panel-toggle {
      position: absolute;
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      background: $bg-card;
      border: 1px solid $border;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: $text-secondary;
      z-index: 5;

      &:hover { color: $text-primary; background: $bg-hover; }
    }

    .panel-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  }

  .detail-section {
    margin-bottom: 12px;

    .detail-title {
      font-size: 11px;
      color: $text-muted;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;

    .detail-cell {
      padding: 6px 8px;
      background: rgba(255,255,255,0.02);
      border: 1px solid $border;
      border-radius: 6px;

      .cell-label { font-size: 10px; color: $text-muted; }
      .cell-value { font-size: 13px; color: $text-primary; font-weight: 600; margin-top: 2px; font-variant-numeric: tabular-nums; }
      .cell-value.highlight { color: $green; }
    }
  }

  // ============ 水电计量条 ============
  .meter-row { display: flex; flex-direction: column; gap: 8px; }

  .meter-item {
    padding: 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: 8px;

    &.water .meter-fill { background: linear-gradient(90deg, #0984e3, #74b9ff); }
    &.electric .meter-fill { background: linear-gradient(90deg, #fdcb6e, #ffeaa7); }

    .meter-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: $text-secondary;
      margin-bottom: 4px;
    }

    .meter-value {
      font-size: 14px;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 4px;
      font-variant-numeric: tabular-nums;
    }

    .meter-bar {
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 2px;
      overflow: hidden;

      .meter-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
      }
    }
  }

  // ============ 设备列表 ============
  .device-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .device-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { background: $bg-hover; }

    .device-icon { font-size: 16px; flex-shrink: 0; }
    .device-info {
      flex: 1;
      .device-name { font-size: 11px; color: $text-primary; }
      .device-meta { font-size: 9px; color: $text-muted; }
    }

    .device-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    &.online .device-status-dot { background: $green; box-shadow: 0 0 4px rgba(63,185,80,0.5); }
    &.warning .device-status-dot { background: $yellow; box-shadow: 0 0 4px rgba(240,180,41,0.5); animation: pulse-warn 2s infinite; }
    &.offline .device-status-dot { background: $text-muted; }
  }

  // ============ 设备详情弹窗 ============
  .device-detail-popup {
    background: rgba(20, 28, 44, 0.98);
    border: 1px solid $border;
    border-radius: 8px;
    padding: 10px;
    margin-top: 8px;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: $text-primary;
      font-weight: 600;
      margin-bottom: 8px;

      .popup-close {
        cursor: pointer;
        color: $text-muted;
        font-size: 14px;
        &:hover { color: $text-primary; }
      }
    }

    .popup-body {
      .popup-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 11px;
        color: $text-secondary;

        .lbl { color: $text-muted; }
        .txt-online { color: $green; }
        .txt-warning { color: $yellow; }
        .txt-offline { color: $red; }
      }
    }
  }

  // ============ 空提示 ============
  .empty-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 30px 10px;
    color: $text-muted;
    font-size: 11px;
  }

  // ============ 底部面板 ============
  .bottom-panel {
    position: absolute;
    bottom: 75px;
    left: 12px;
    right: 12px;
    height: 120px;
    display: flex;
    gap: 10px;
    z-index: 15;
  }

  .bottom-card {
    flex: 1;
    background: $bg-card;
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid $border;
    border-radius: $radius;
    padding: 8px;
    display: flex;
    flex-direction: column;

    &.stats {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0;
    }

    .chart-box { flex: 1; min-height: 0; }
    .chart-label {
      font-size: 10px;
      color: $text-muted;
      text-align: center;
      padding-top: 2px;
    }
  }

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-value {
      font-size: 22px;
      font-weight: 800;
      color: $text-primary;
      font-variant-numeric: tabular-nums;

      &.online { color: $green; }
      &.warning { color: $yellow; }
    }

    .stat-label {
      font-size: 10px;
      color: $text-muted;
      margin-top: 2px;
    }
  }

  .stat-divider {
    width: 1px;
    height: 36px;
    background: $border;
  }

  // ============ 3D 楼层标签 ============
  .floor-label-3d {
    position: absolute;
    padding: 3px 10px;
    background: rgba(16, 22, 36, 0.9);
    border: 1px solid rgba(108, 92, 231, 0.3);
    border-radius: 4px;
    font-size: 11px;
    color: $text-secondary;
    pointer-events: auto;
    cursor: pointer;
    z-index: 10;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover { background: $accent-bg; color: $accent-light; border-color: $accent; }
    &.active { background: $accent-bg; color: $accent-light; border-color: $accent; }
  }

  // ============ 提示栏 ============
  .hint-bar {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 16px;
    background: $bg-card;
    backdrop-filter: blur(24px);
    border: 1px solid $border;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 11px;
    color: $text-muted;
    z-index: 20;
  }

  // ============ 动画 ============
  @keyframes pulse-warn {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  // ============ 管线控制栏 ============
  .pipe-toolbar {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: $bg-card;
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid $border;
    border-radius: 10px;
    padding: 6px 12px;
    z-index: 20;

    .pipe-toolbar-title {
      font-size: 10px;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-right: 4px;
    }

    .pipe-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 7px;
      border: 1px solid $border;
      background: transparent;
      color: $text-muted;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: rgba(255,255,255,0.06);
        color: $text-primary;
      }

      &.active {
        &.active { border-color: rgba(108, 92, 231, 0.3); }
        color: $text-primary;

        .pipe-dot {
          &.water { background: #0984e3; box-shadow: 0 0 6px rgba(9,132,227,0.6); }
          &.electric { background: #fdcb6e; box-shadow: 0 0 6px rgba(253,203,110,0.6); }
        }
      }

      .pipe-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        transition: all 0.2s;

        &.water { background: $text-muted; }
        &.electric { background: $text-muted; }
      }
    }
  }

  // ============ 管道信息弹窗 ============
  .pipe-info-popup {
    position: absolute;
    width: 220px;
    background: rgba(16, 22, 36, 0.96);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(108, 92, 231, 0.25);
    border-radius: 10px;
    padding: 10px 12px;
    z-index: 30;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    transform: translate(0, 0);
    pointer-events: auto;

    .pipe-popup-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid $border;

      .pipe-popup-icon {
        font-size: 14px;

        &.water { filter: drop-shadow(0 0 4px rgba(9,132,227,0.5)); }
        &.electric { filter: drop-shadow(0 0 4px rgba(253,203,110,0.5)); }
      }

      .pipe-popup-title {
        flex: 1;
        font-size: 12px;
        font-weight: 600;
        color: $text-primary;
      }

      .pipe-popup-close {
        cursor: pointer;
        color: $text-muted;
        font-size: 13px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.15s;

        &:hover { background: $bg-hover; color: $text-primary; }
      }
    }

    .pipe-popup-body {
      .pipe-popup-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 11px;
        color: $text-secondary;

        .lbl { color: $text-muted; }
        .txt-online { color: $green; }
        .txt-warning { color: $yellow; }
        .txt-offline { color: $red; }
      }
    }
  }
}
</style>
