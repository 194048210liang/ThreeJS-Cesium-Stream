<template>
  <div class="container">
    <!-- Cesium 容器 -->
    <div class="cesiumBox" ref="cesiumBox"></div>

    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <el-icon :size="22" color="#6C5CE7"><View /></el-icon>
        <span class="logo-text">Cesium 地图</span>
        <el-divider direction="vertical" />
        <span class="model-name">成都</span>
      </div>
      <div class="top-bar-right">
        <span class="status-dot active"></span>
        <span class="status-label">已就绪</span>
      </div>
    </div>

    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <div class="toolbar-title">视图</div>
        <div class="toolbar-btn" :class="{ active: currentSceneMode === '3D' }" @click="switchSceneMode('3D')" title="3D视图">
          <el-icon :size="18"><View /></el-icon>
          <span>3D</span>
        </div>
        <div class="toolbar-btn" :class="{ active: currentSceneMode === '2D' }" @click="switchSceneMode('2D')" title="2D视图">
          <el-icon :size="18"><Monitor /></el-icon>
          <span>2D</span>
        </div>
        <div class="toolbar-btn" :class="{ active: currentSceneMode === 'COLUMBUS' }" @click="switchSceneMode('COLUMBUS')" title="哥伦布视图">
          <el-icon :size="18"><Grid /></el-icon>
          <span>哥伦布</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">相机</div>
        <div class="toolbar-btn" @click="flyToChengdu" title="飞行到成都">
          <el-icon :size="18"><Position /></el-icon>
          <span>定位</span>
        </div>
        <div class="toolbar-btn" :class="{ active: isRotating }" @click="toggleRotate" title="绕点旋转">
          <el-icon :size="18"><RefreshRight /></el-icon>
          <span>旋转</span>
        </div>
        <div class="toolbar-btn" @click="saveBookmark" title="保存当前视角">
          <el-icon :size="18"><Star /></el-icon>
          <span>书签</span>
        </div>
        <div class="toolbar-btn" @click="resetView" title="重置视角">
          <el-icon :size="18"><Refresh /></el-icon>
          <span>复位</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">标绘</div>
        <div class="toolbar-btn" :class="{ active: drawMode === 'point' }" @click="startDraw('point')" title="绘制点">
          <el-icon :size="18"><Location /></el-icon>
          <span>画点</span>
        </div>
        <div class="toolbar-btn" :class="{ active: drawMode === 'polyline' }" @click="startDraw('polyline')" title="绘制线">
          <el-icon :size="18"><EditPen /></el-icon>
          <span>画线</span>
        </div>
        <div class="toolbar-btn" :class="{ active: drawMode === 'polygon' }" @click="startDraw('polygon')" title="绘制面">
          <el-icon :size="18"><PieChart /></el-icon>
          <span>画面</span>
        </div>
        <div class="toolbar-btn" @click="clearAllDrawings" title="清除所有绘制">
          <el-icon :size="18"><Delete /></el-icon>
          <span>清除</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">编辑</div>
        <div class="toolbar-btn" :class="{ active: editMode }" @click="toggleEditMode" title="编辑模式">
          <el-icon :size="18"><Edit /></el-icon>
          <span>编辑</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">其他</div>
        <div class="toolbar-btn" :class="{ active: showTerrain }" @click="toggleTerrain" title="地形开关">
          <el-icon :size="18"><Position /></el-icon>
          <span>地形</span>
        </div>
        <div class="toolbar-btn" @click="addDemoPOIs" title="添加示例POI">
          <el-icon :size="18"><AddLocation /></el-icon>
          <span>POI</span>
        </div>
      </div>
    </div>

    <!-- 右侧控制面板 -->
    <div class="panel" :class="{ collapsed: panelCollapsed }">
      <div class="panel-header">
        <span>控制面板</span>
        <div class="panel-close" @click="panelCollapsed = !panelCollapsed">
          <el-icon :size="16"><ArrowRight v-if="panelCollapsed" /><ArrowLeft v-else /></el-icon>
        </div>
      </div>
      <div class="panel-body" v-show="!panelCollapsed">
        <!-- 图层管理 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('layer')">
            <span class="section-icon">◉</span>
            <span class="section-title">图层管理</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.layer }"><ArrowRight /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.layer">
            <div class="control-item">
              <span class="control-label">底图图层</span>
            </div>
            <div class="layer-grid">
              <div class="layer-card" v-for="layer in baseLayers" :key="layer.name"
                :class="{ active: currentBaseLayer === layer.name }"
                @click="switchBaseLayer(layer.name)">
                <div class="layer-thumb">
                  <img :src="layer.thumb" :alt="layer.label" />
                </div>
                <span class="layer-name">{{ layer.label }}</span>
              </div>
            </div>
            <div class="control-item" style="margin-top: 8px">
              <span class="control-label">叠加图层</span>
            </div>
            <div class="control-item">
              <el-switch v-model="overlayLayers.amapLabel" size="small" @change="toggleOverlayLayer('amapLabel')" />
              <span class="control-label">高德标注</span>
            </div>
            <div class="control-item">
              <el-switch v-model="overlayLayers.tiandituLabel" size="small" @change="toggleOverlayLayer('tiandituLabel')" />
              <span class="control-label">天地图注记</span>
            </div>
            <div class="control-item">
              <el-switch v-model="overlayLayers.tiandituRoad" size="small" @change="toggleOverlayLayer('tiandituRoad')" />
              <span class="control-label">天地图路网</span>
            </div>
          </div>
        </div>

        <!-- 地形设置 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('terrain')">
            <span class="section-icon">▲</span>
            <span class="section-title">地形设置</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.terrain }"><ArrowRight /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.terrain">
            <div class="control-item">
              <span class="control-label">启用地形</span>
              <el-switch v-model="showTerrain" size="small" @change="toggleTerrain" />
            </div>
            <div class="control-item">
              <span class="control-label">深度检测</span>
              <el-switch v-model="depthTest" size="small" @change="toggleDepthTest" />
            </div>
          </div>
        </div>

        <!-- 视角书签 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('bookmark')">
            <span class="section-icon">★</span>
            <span class="section-title">视角书签</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.bookmark }"><ArrowRight /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.bookmark">
            <div v-if="bookmarks.length > 0" class="bookmark-list">
              <div class="bookmark-item" v-for="(bm, idx) in bookmarks" :key="idx">
                <span class="bookmark-name" @click="flyToBookmark(bm)">{{ bm.name }}</span>
                <span class="bookmark-del" @click="removeBookmark(idx)">x</span>
              </div>
            </div>
            <div v-else class="empty-hint">点击左侧「书签」保存当前视角</div>
          </div>
        </div>

        <!-- 绘制信息 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('draw')">
            <span class="section-icon">✦</span>
            <span class="section-title">绘制信息</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.draw }"><ArrowRight /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.draw">
            <div v-if="drawMode" class="draw-hint">
              当前模式: {{ drawModeLabel }}
              <br />
              <span v-if="drawMode === 'point'">点击地图放置点</span>
              <span v-else-if="drawMode === 'polyline'">点击添加节点，双击结束</span>
              <span v-else-if="drawMode === 'polygon'">点击添加节点，双击结束</span>
            </div>
            <div v-else class="empty-hint">未开启绘制</div>
            <div class="info-grid" v-if="drawEntities.length > 0">
              <div class="info-cell">
                <div class="info-value">{{ drawEntities.length }}</div>
                <div class="info-key">绘制数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 鼠标位置 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('position')">
            <span class="section-icon">◈</span>
            <span class="section-title">坐标信息</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.position }"><ArrowRight /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.position">
            <div class="info-grid">
              <div class="info-cell">
                <div class="info-value">{{ mousePosition.lng.toFixed(4) }}</div>
                <div class="info-key">经度</div>
              </div>
              <div class="info-cell">
                <div class="info-value">{{ mousePosition.lat.toFixed(4) }}</div>
                <div class="info-key">纬度</div>
              </div>
              <div class="info-cell">
                <div class="info-value">{{ mousePosition.height.toFixed(0) }}</div>
                <div class="info-key">高度(m)</div>
              </div>
            </div>
            <div v-if="clickPosition" class="click-info">
              <div class="info-cell single">
                <div class="info-value">{{ clickPosition.lng.toFixed(6) }}, {{ clickPosition.lat.toFixed(6) }}</div>
                <div class="info-key">点击坐标</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 绘制模式提示 -->
    <div class="draw-tip" v-if="drawMode">
      <span>{{ drawModeLabel }}模式 - {{ drawMode === 'point' ? '点击放置' : '点击添加，双击结束' }}</span>
      <button class="mini-btn" @click="cancelDraw">取消 (Esc)</button>
    </div>

    <!-- 点击弹窗 -->
    <div class="popup-overlay" v-if="popup.visible" :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
      <div class="popup-card">
        <div class="popup-header">
          <span>{{ popup.title }}</span>
          <span class="popup-close" @click="closePopup">x</span>
        </div>
        <div class="popup-body">
          <div class="popup-row" v-for="(val, key) in popup.properties" :key="key">
            <span class="popup-key">{{ key }}</span>
            <span class="popup-val">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="bottom-bar">
      <div class="bottom-left">
        <span class="coord-badge">{{ mousePosition.lng.toFixed(4) }}, {{ mousePosition.lat.toFixed(4) }}</span>
        <span class="bar-divider">|</span>
        <span>{{ statusText }}</span>
      </div>
      <div class="bottom-right">
        <span v-if="drawMode" class="draw-badge">{{ drawModeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { ElMessage } from 'element-plus'
import {
  View, Monitor, Grid, Position, RefreshRight, Star, Refresh,
  Location, EditPen, PieChart, Delete, Edit, ArrowRight, ArrowLeft,
  AddLocation
} from '@element-plus/icons-vue'

// ============ 常量 ============
const CHENGDU = { lng: 104.0668, lat: 30.5728, height: 2000 }

// ============ DOM 引用 ============
const cesiumBox = ref<HTMLDivElement | null>(null)
let viewer: Cesium.Viewer

// ============ 状态 ============
const currentSceneMode = ref('3D')
const panelCollapsed = ref(false)
const statusText = ref('就绪')
const isRotating = ref(false)
const showTerrain = ref(true)
const depthTest = ref(true)
const editMode = ref(false)

// 鼠标位置
const mousePosition = reactive({ lng: 0, lat: 0, height: 0 })
const clickPosition = ref<{ lng: number; lat: number; height: number } | null>(null)

// 面板折叠
const openSections = reactive({
  layer: true,
  terrain: false,
  bookmark: false,
  draw: false,
  position: true
})
const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

// 图层
const currentBaseLayer = ref('amap')
const baseLayers = [
  {
    name: 'amap',
    label: '高德影像',
    thumb: 'https://webst02.is.autonavi.com/appmaptile?style=6&x=53&y=26&z=6'
  },
  {
    name: 'amapVector',
    label: '高德矢量',
    thumb: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=53&y=26&z=6'
  },
  {
    name: 'arcgis',
    label: 'ArcGIS 影像',
    thumb: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/26/53'
  },
  {
    name: 'tianditu',
    label: '天地图影像',
    thumb: 'https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=53&TILEROW=26&TILEMATRIX=6&tk=c5765199b4a3f6d8f1a7f8f7d0b9c3a2'
  },
  {
    name: 'osm',
    label: 'OpenStreetMap',
    thumb: 'https://tile.openstreetmap.org/6/53/26.png'
  }
]
const overlayLayers = reactive({
  amapLabel: false,
  tiandituLabel: false,
  tiandituRoad: false
})
let overlayProviderLabel: Cesium.ImageryLayer | null = null
let overlayProviderRoad: Cesium.ImageryLayer | null = null
let overlayProviderAmapLabel: Cesium.ImageryLayer | null = null

// 书签
interface Bookmark {
  name: string
  destination: Cesium.Cartesian3
  orientation: { heading: number; pitch: number; roll: number }
}
const bookmarks = ref<Bookmark[]>([])

// 绘制
const drawMode = ref<string | null>(null)
const drawEntities: Cesium.Entity[] = []
let drawingPositions: Cesium.Cartesian3[] = []
let tempEntity: Cesium.Entity | null = null
let drawHandler: Cesium.ScreenSpaceEventHandler | null = null

const drawModeLabel = ref('')

// 弹窗
const popup = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  properties: {} as Record<string, string>
})

// ============ 初始化 Cesium ============
const initCesium = () => {
  if (!cesiumBox.value) return

  const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN
  if (cesiumToken) {
    Cesium.Ion.defaultAccessToken = cesiumToken
  }

  viewer = new Cesium.Viewer(cesiumBox.value, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    timeline: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: true,
    shouldAnimate: true,
    terrainProvider: undefined,
    baseLayer: false
  })

  // 添加高德影像底图
  viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      minimumLevel: 3,
      maximumLevel: 18
    })
  )

  // 加载地形
  loadTerrain()

  // 深度检测
  viewer.scene.globe.depthTestAgainstTerrain = depthTest.value

  // 设置初始视角到成都
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(CHENGDU.lng, CHENGDU.lat, CHENGDU.height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  })

  // 鼠标移动 - 更新坐标
  const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  moveHandler.setInputAction((movement: any) => {
    const cartesian = viewer.scene.pickPosition(movement.endPosition)
    if (cartesian) {
      const carto = Cesium.Cartographic.fromCartesian(cartesian)
      mousePosition.lng = Cesium.Math.toDegrees(carto.longitude)
      mousePosition.lat = Cesium.Math.toDegrees(carto.latitude)
      mousePosition.height = carto.height
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  // 左键点击 - 获取坐标 + 实体点击
  const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  clickHandler.setInputAction((click: any) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    if (cartesian) {
      const carto = Cesium.Cartographic.fromCartesian(cartesian)
      clickPosition.value = {
        lng: Cesium.Math.toDegrees(carto.longitude),
        lat: Cesium.Math.toDegrees(carto.latitude),
        height: carto.height
      }
    }

    // 实体点击弹窗
    const picked = viewer.scene.pick(click.position)
    if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
      const entity = picked.id
      if (entity.name || entity.properties) {
        showEntityPopup(entity, click.position)
      }
    } else {
      closePopup()
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 添加成都区域示例 POI
  addDemoPOIs()

  statusText.value = '已就绪 - 成都'
}

// ============ 地形加载 ============
const loadTerrain = async () => {
  try {
    const terrainProvider = await Cesium.createWorldTerrainAsync()
    if (showTerrain.value) {
      viewer.terrainProvider = terrainProvider
    }
  } catch (e) {
    console.warn('地形加载失败:', e)
  }
}

const toggleTerrain = async () => {
  if (showTerrain.value) {
    try {
      const terrainProvider = await Cesium.createWorldTerrainAsync()
      viewer.terrainProvider = terrainProvider
    } catch (e) {
      ElMessage.warning('地形加载失败')
    }
  } else {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
}

const toggleDepthTest = () => {
  viewer.scene.globe.depthTestAgainstTerrain = depthTest.value
}

// ============ 视图切换 ============
const switchSceneMode = (mode: string) => {
  currentSceneMode.value = mode
  switch (mode) {
    case '3D':
      viewer.scene.morphTo3D(1.0)
      break
    case '2D':
      viewer.scene.morphTo2D(1.0)
      break
    case 'COLUMBUS':
      viewer.scene.morphToColumbusView(1.0)
      break
  }
  statusText.value = `已切换为 ${mode} 视图`
}

// ============ 图层管理 ============
const switchBaseLayer = (name: string) => {
  currentBaseLayer.value = name
  // 移除当前所有底图 (保留叠加层)
  const layers = viewer.imageryLayers
  while (layers.length > 0) {
    layers.remove(layers.get(0))
  }

  let provider: Cesium.ImageryProvider
  switch (name) {
    case 'amap':
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18
      })
      break
    case 'amapVector':
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18
      })
      break
    case 'arcgis':
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 18
      })
      break
    case 'tianditu':
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=c5765199b4a3f6d8f1a7f8f7d0b9c3a2',
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        maximumLevel: 18
      })
      break
    case 'osm':
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        maximumLevel: 18
      })
      break
    default:
      provider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18
      })
  }

  layers.addImageryProvider(provider)

  // 重新添加叠加层
  if (overlayLayers.amapLabel && overlayProviderAmapLabel) {
    layers.add(overlayProviderAmapLabel)
  }
  if (overlayLayers.tiandituLabel && overlayProviderLabel) {
    layers.add(overlayProviderLabel)
  }
  if (overlayLayers.tiandituRoad && overlayProviderRoad) {
    layers.add(overlayProviderRoad)
  }

  statusText.value = `底图: ${baseLayers.find((l) => l.name === name)?.label}`
}

const toggleOverlayLayer = (layerName: string) => {
  const layers = viewer.imageryLayers
  if (layerName === 'amapLabel') {
    if (overlayLayers.amapLabel) {
      if (!overlayProviderAmapLabel) {
        overlayProviderAmapLabel = layers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://webst02.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
            minimumLevel: 3,
            maximumLevel: 18
          })
        )
      } else {
        overlayProviderAmapLabel.show = true
      }
    } else {
      if (overlayProviderAmapLabel) overlayProviderAmapLabel.show = false
    }
  } else if (layerName === 'tiandituLabel') {
    if (overlayLayers.tiandituLabel) {
      if (!overlayProviderLabel) {
        overlayProviderLabel = layers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://t{s}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=c5765199b4a3f6d8f1a7f8f7d0b9c3a2',
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            maximumLevel: 18
          })
        )
      } else {
        overlayProviderLabel.show = true
      }
    } else {
      if (overlayProviderLabel) overlayProviderLabel.show = false
    }
  } else if (layerName === 'tiandituRoad') {
    if (overlayLayers.tiandituRoad) {
      if (!overlayProviderRoad) {
        overlayProviderRoad = layers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c5765199b4a3f6d8f1a7f8f7d0b9c3a2',
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            maximumLevel: 18
          })
        )
      } else {
        overlayProviderRoad.show = true
      }
    } else {
      if (overlayProviderRoad) overlayProviderRoad.show = false
    }
  }
}

// ============ 相机控制 ============
const flyToChengdu = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(CHENGDU.lng, CHENGDU.lat, CHENGDU.height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 2
  })
  statusText.value = '飞行到成都'
}

const toggleRotate = () => {
  isRotating.value = !isRotating.value
  viewer.clock.onTick.removeEventListener(rotateCamera)
  if (isRotating.value) {
    viewer.clock.onTick.addEventListener(rotateCamera)
    statusText.value = '开启旋转'
  } else {
    statusText.value = '停止旋转'
  }
}

const rotateCamera = () => {
  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(0.3))
}

const resetView = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(CHENGDU.lng, CHENGDU.lat, CHENGDU.height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 1
  })
  statusText.value = '视角已复位'
}

// 书签
const saveBookmark = () => {
  const camera = viewer.camera
  const bm: Bookmark = {
    name: `书签 ${bookmarks.value.length + 1}`,
    destination: camera.positionWC.clone(),
    orientation: {
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll
    }
  }
  bookmarks.value.push(bm)
  ElMessage.success(`已保存: ${bm.name}`)
  openSections.bookmark = true
}

const flyToBookmark = (bm: Bookmark) => {
  viewer.camera.flyTo({
    destination: bm.destination,
    orientation: bm.orientation,
    duration: 1.5
  })
}

const removeBookmark = (idx: number) => {
  bookmarks.value.splice(idx, 1)
}

// ============ POI 标注 ============
const addDemoPOIs = () => {
  const pois = [
    { name: '天府广场', lng: 104.0657, lat: 30.6598, desc: '成都市中心地标', type: '地标' },
    { name: '春熙路', lng: 104.0806, lat: 30.6577, desc: '成都最繁华商业街', type: '商业' },
    { name: '武侯祠', lng: 104.0471, lat: 30.6439, desc: '三国文化圣地', type: '历史' },
    { name: '杜甫草堂', lng: 104.0344, lat: 30.6592, desc: '唐代诗人杜甫故居', type: '文化' },
    { name: '锦里古街', lng: 104.0483, lat: 30.6432, desc: '成都历史文化街区', type: '旅游' },
    { name: '宽窄巷子', lng: 104.0554, lat: 30.6696, desc: '成都特色步行街', type: '旅游' },
    { name: '成都大熊猫基地', lng: 104.1459, lat: 30.7328, desc: '大熊猫保护研究中心', type: '景点' },
    { name: '环球中心', lng: 104.0706, lat: 30.5753, desc: '亚洲最大单体建筑', type: '商业' },
    { name: '望江楼', lng: 104.0875, lat: 30.6425, desc: '纪念薛涛的古建筑', type: '历史' },
    { name: '四川大学', lng: 104.0889, lat: 30.6304, desc: '百年名校', type: '教育' }
  ]

  pois.forEach((poi) => {
    viewer.entities.add({
      name: poi.name,
      position: Cesium.Cartesian3.fromDegrees(poi.lng, poi.lat, 100),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#6C5CE7'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: poi.name,
        font: '13px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      properties: {
        desc: new Cesium.ConstantProperty(poi.desc),
        type: new Cesium.ConstantProperty(poi.type),
        lng: new Cesium.ConstantProperty(poi.lng.toFixed(6)),
        lat: new Cesium.ConstantProperty(poi.lat.toFixed(6))
      } as any
    })
  })

  ElMessage.success('已添加 10 个成都 POI')
}

// ============ 弹窗 Popup ============
const showEntityPopup = (entity: Cesium.Entity, windowPosition: any) => {
  const props: Record<string, string> = {}
  if (entity.properties) {
    const propertyNames = entity.propertyNames
    propertyNames.forEach((name: string) => {
      const val = entity.properties!.getByName(name)
      if (val && val.getValue) {
        props[name] = String(val.getValue(Cesium.JulianDate.now()))
      } else if (val !== undefined) {
        props[name] = String(val)
      }
    })
  }

  popup.visible = true
  popup.title = entity.name || '未命名'
  popup.properties = props

  // 使用屏幕坐标定位弹窗
  const pos = windowPosition
  if (typeof pos === 'object' && 'x' in pos) {
    popup.x = Math.min(pos.x + 15, window.innerWidth - 260)
    popup.y = Math.min(pos.y - 10, window.innerHeight - 200)
  }
}

const closePopup = () => {
  popup.visible = false
  popup.properties = {}
}

// ============ 绘制功能 ============
const startDraw = (type: string) => {
  if (drawMode.value === type) {
    cancelDraw()
    return
  }
  cancelDraw()

  drawMode.value = type
  drawModeLabel.value = type === 'point' ? '画点' : type === 'polyline' ? '画线' : '画面'
  drawingPositions = []

  // 改变鼠标样式
  viewer.canvas.style.cursor = 'crosshair'

  drawHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  // 单击添加点
  drawHandler.setInputAction((click: any) => {
    const cartesian = getDrawPosition(click.position)
    if (!cartesian) return

    if (type === 'point') {
      addDrawPoint(cartesian)
      cancelDraw()
      return
    }

    drawingPositions.push(cartesian)
    updateTempDrawEntity(type)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  if (type !== 'point') {
    // 双击结束绘制
    drawHandler.setInputAction((_click: any) => {
      finishDraw(type)
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    // 右键也结束绘制
    drawHandler.setInputAction((_click: any) => {
      finishDraw(type)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    // 鼠标移动更新预览
    drawHandler.setInputAction((movement: any) => {
      if (drawingPositions.length === 0) return
      const cartesian = getDrawPosition(movement.endPosition)
      if (cartesian) {
        updateTempMovePosition(cartesian, type)
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  statusText.value = `绘制模式: ${drawModeLabel.value}`
}

const getDrawPosition = (windowPosition: any): Cesium.Cartesian3 | null => {
  const ray = viewer.camera.getPickRay(windowPosition)
  if (!ray) return null
  if (showTerrain.value) {
    return viewer.scene.globe.pick(ray, viewer.scene) ?? null
  }
  return viewer.scene.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid) ?? null
}

const addDrawPoint = (cartesian: Cesium.Cartesian3) => {
  const carto = Cesium.Cartographic.fromCartesian(cartesian)
  const entity = viewer.entities.add({
    name: `画点-${drawEntities.length + 1}`,
    position: cartesian,
    point: {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString('#00CEC9'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    label: {
      text: `点${drawEntities.length + 1}`,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    properties: {
      type: new Cesium.ConstantProperty('draw-point'),
      lng: new Cesium.ConstantProperty(Cesium.Math.toDegrees(carto.longitude).toFixed(6)),
      lat: new Cesium.ConstantProperty(Cesium.Math.toDegrees(carto.latitude).toFixed(6))
    } as any
  })
  drawEntities.push(entity)
  statusText.value = `已添加点 ${drawEntities.length}`
}

const updateTempDrawEntity = (type: string) => {
  if (tempEntity) {
    viewer.entities.remove(tempEntity)
  }

  if (type === 'polyline' && drawingPositions.length >= 2) {
    tempEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return drawingPositions
        }, false),
        width: 3,
        material: Cesium.Color.fromCssColorString('#00CEC9'),
        clampToGround: true
      }
    })
  } else if (type === 'polygon' && drawingPositions.length >= 3) {
    tempEntity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(drawingPositions)
        }, false),
        material: Cesium.Color.fromCssColorString('#6C5CE7').withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#6C5CE7'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  }

  // 节点标记
  drawingPositions.forEach((pos, _i) => {
    viewer.entities.add({
      position: pos,
      point: {
        pixelSize: 6,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#6C5CE7'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  })
}

let _movePosition: Cesium.Cartesian3 | null = null

const updateTempMovePosition = (cartesian: Cesium.Cartesian3, type: string) => {
  _movePosition = cartesian
  if (tempEntity) {
    viewer.entities.remove(tempEntity)
  }

  const allPos = [...drawingPositions, cartesian]

  if (type === 'polyline' && allPos.length >= 2) {
    tempEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => allPos, false),
        width: 3,
        material: Cesium.Color.fromCssColorString('#00CEC9').withAlpha(0.7),
        clampToGround: true
      }
    })
  } else if (type === 'polygon' && allPos.length >= 3) {
    tempEntity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(allPos)
        }, false),
        material: Cesium.Color.fromCssColorString('#6C5CE7').withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#6C5CE7'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  }
}

const finishDraw = (type: string) => {
  if (drawingPositions.length < 2) {
    ElMessage.warning('至少需要2个节点')
    return
  }

  // 移除临时实体
  if (tempEntity) {
    viewer.entities.remove(tempEntity)
    tempEntity = null
  }

  // 移除节点标记 (白色小点)
  const toRemove: Cesium.Entity[] = []
  viewer.entities.values.forEach((e) => {
    if (!e.name && e.point && e.point.outlineColor) {
      try {
        const oc = e.point.outlineColor.getValue(Cesium.JulianDate.now())
        if (oc && Cesium.Color.equals(oc, Cesium.Color.fromCssColorString('#6C5CE7'))) {
          toRemove.push(e)
        }
      } catch {}
    }
  })
  toRemove.forEach((e) => viewer.entities.remove(e))

  if (type === 'polyline') {
    const entity = viewer.entities.add({
      name: `画线-${drawEntities.length + 1}`,
      polyline: {
        positions: drawingPositions,
        width: 3,
        material: Cesium.Color.fromCssColorString('#00CEC9'),
        clampToGround: true
      },
      properties: {
        type: new Cesium.ConstantProperty('draw-polyline')
      } as any
    })
    drawEntities.push(entity)
  } else if (type === 'polygon') {
    const entity = viewer.entities.add({
      name: `画面-${drawEntities.length + 1}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(drawingPositions),
        material: Cesium.Color.fromCssColorString('#6C5CE7').withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#6C5CE7'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      properties: {
        type: new Cesium.ConstantProperty('draw-polygon')
      } as any
    })
    drawEntities.push(entity)
  }

  drawingPositions = []
  _movePosition = null
  cancelDraw()
  statusText.value = `绘制完成, 共 ${drawEntities.length} 个图形`
}

const cancelDraw = () => {
  drawMode.value = null
  drawModeLabel.value = ''
  drawingPositions = []
  _movePosition = null

  if (drawHandler) {
    drawHandler.destroy()
    drawHandler = null
  }
  if (tempEntity) {
    viewer.entities.remove(tempEntity)
    tempEntity = null
  }

  viewer.canvas.style.cursor = 'default'
  statusText.value = '就绪'
}

const clearAllDrawings = () => {
  cancelDraw()

  const toRemove = viewer.entities.values.filter((e) => {
    if (e.properties && e.properties.type) {
      try {
        const t = e.properties.type.getValue(Cesium.JulianDate.now())
        return typeof t === 'string' && t.startsWith('draw-')
      } catch { return false }
    }
    return false
  })

  toRemove.forEach((e) => viewer.entities.remove(e))
  drawEntities.length = 0
  ElMessage.success('已清除所有绘制')
  statusText.value = '已清除'
}

// ============ 编辑模式 ============
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    cancelDraw()
    viewer.entities.values.forEach((entity) => {
      if (entity.position) {
        const origPos = entity.position
        entity.position = new Cesium.CallbackProperty(() => {
          return origPos.getValue(Cesium.JulianDate.now())
        }, false) as any
      }
    })
    statusText.value = '编辑模式 - 拖拽实体移动'
  } else {
    statusText.value = '就绪'
  }
}

// ============ ESC 取消绘制 ============
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && drawMode.value) {
    cancelDraw()
  }
}

// ============ 生命周期 ============
onMounted(() => {
  initCesium()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (drawHandler) drawHandler.destroy()
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy()
  }
})
</script>

<style scoped lang="scss">
$bg-dark: #0d1117;
$bg-card: #161b22;
$bg-hover: #1c2333;
$border-color: rgba(255, 255, 255, 0.06);
$text-primary: #e6edf3;
$text-secondary: #8b949e;
$text-muted: #484f58;
$accent: #6C5CE7;
$accent-light: #A29BFE;
$accent-bg: rgba(108, 92, 231, 0.15);
$green: #3fb950;
$radius: 8px;

.container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  .cesiumBox {
    width: 100%;
    height: 100%;

    :deep(.cesium-viewer-bottom) { display: none !important; }
    :deep(.cesium-widget-credits) { display: none !important; }
  }

  // ============ 顶部导航栏 ============
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background: rgba(13, 17, 23, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 20;

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-text {
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
        letter-spacing: 0.5px;
      }

      .el-divider { border-color: $text-muted; }

      .model-name {
        font-size: 12px;
        color: $text-secondary;
      }
    }

    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 6px;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $text-muted;
        transition: all 0.3s;

        &.active {
          background: $green;
          box-shadow: 0 0 6px rgba(63, 185, 80, 0.5);
        }
      }

      .status-label {
        font-size: 11px;
        color: $text-muted;
      }
    }
  }

  // ============ 左侧工具栏 ============
  .toolbar {
    position: absolute;
    top: 56px;
    left: 12px;
    background: rgba(22, 27, 34, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid $border-color;
    border-radius: 12px;
    padding: 6px;
    z-index: 15;
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .toolbar-group {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .toolbar-title {
        font-size: 9px;
        color: $text-muted;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 6px 8px 2px;
        user-select: none;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border-radius: $radius;
        cursor: pointer;
        transition: all 0.15s ease;
        color: $text-secondary;
        user-select: none;
        font-size: 12px;

        &:hover {
          background: $bg-hover;
          color: $text-primary;
        }

        &.active {
          background: $accent-bg;
          color: $accent-light;

          .el-icon { color: $accent-light; }
        }
      }
    }

    .toolbar-divider {
      height: 1px;
      background: $border-color;
      margin: 4px 6px;
    }
  }

  // ============ 右侧面板 ============
  .panel {
    position: absolute;
    top: 56px;
    right: 12px;
    bottom: 44px;
    width: 280px;
    background: rgba(22, 27, 34, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid $border-color;
    border-radius: 12px;
    z-index: 15;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;

    &.collapsed { width: 40px; }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid $border-color;
      flex-shrink: 0;

      span {
        font-size: 13px;
        font-weight: 600;
        color: $text-primary;
      }

      .panel-close {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        color: $text-secondary;
        transition: all 0.15s;
        flex-shrink: 0;

        &:hover { background: $bg-hover; color: $text-primary; }
      }
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    }

    .panel-section {
      border-bottom: 1px solid $border-color;
      &:last-child { border-bottom: none; }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s;
        &:hover { background: $bg-hover; }

        .section-icon { font-size: 12px; flex-shrink: 0; }
        .section-title { flex: 1; font-size: 12px; font-weight: 500; color: $text-primary; }

        .section-arrow {
          color: $text-muted;
          font-size: 12px;
          transition: transform 0.2s;
          &.rotated { transform: rotate(90deg); }
        }
      }

      .section-content { padding: 4px 12px 10px; }
    }
  }

  // ============ 控制项 ============
  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;

    .control-label {
      font-size: 11px;
      color: $text-secondary;
      white-space: nowrap;
    }
  }

  // ============ 图层卡片 ============
  .layer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    .layer-card {
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      background: $bg-card;

      &:hover {
        border-color: rgba(162, 155, 254, 0.3);
        transform: translateY(-1px);
      }

      &.active {
        border-color: $accent-light;
        box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
      }

      .layer-thumb {
        width: 100%;
        height: 48px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .layer-name {
        display: block;
        text-align: center;
        font-size: 10px;
        padding: 3px 0;
        color: $text-secondary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &.active .layer-name {
        color: $accent-light;
      }
    }
  }

  // ============ 书签列表 ============
  .bookmark-list {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .bookmark-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 8px;
      border-radius: 6px;

      .bookmark-name {
        font-size: 11px;
        color: $text-secondary;
        cursor: pointer;
        &:hover { color: $accent-light; }
      }

      .bookmark-del {
        font-size: 10px;
        color: $text-muted;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        &:hover { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }
      }
    }
  }

  // ============ 信息网格 ============
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;

    .info-cell {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 8px;
      text-align: center;

      &.single {
        grid-column: span 3;
        margin-top: 6px;
      }

      .info-value {
        font-size: 14px;
        font-weight: 700;
        color: $text-primary;
        font-variant-numeric: tabular-nums;
      }

      .info-key {
        font-size: 10px;
        color: $text-muted;
        margin-top: 2px;
      }
    }
  }

  // ============ 绘制提示 ============
  .draw-tip {
    position: absolute;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(22, 27, 34, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid $border-color;
    border-radius: 8px;
    padding: 6px 14px;
    color: $text-primary;
    font-size: 12px;
    z-index: 15;
    display: flex;
    align-items: center;
    gap: 12px;

    .mini-btn {
      padding: 3px 10px;
      border-radius: 4px;
      border: 1px solid $border-color;
      background: transparent;
      color: $text-secondary;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { background: $bg-hover; color: $text-primary; }
    }
  }

  .draw-hint {
    font-size: 11px;
    color: $text-secondary;
    line-height: 1.6;
  }

  .empty-hint {
    text-align: center;
    color: $text-muted;
    font-size: 11px;
    padding: 12px 0;
  }

  // ============ 弹窗 ============
  .popup-overlay {
    position: absolute;
    z-index: 25;

    .popup-card {
      background: rgba(22, 27, 34, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid $border-color;
      border-radius: 10px;
      min-width: 200px;
      max-width: 280px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

      .popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid $border-color;

        span:first-child {
          font-size: 13px;
          font-weight: 600;
          color: $accent-light;
        }

        .popup-close {
          font-size: 14px;
          color: $text-muted;
          cursor: pointer;
          padding: 0 4px;
          &:hover { color: #f56c6c; }
        }
      }

      .popup-body {
        padding: 8px 12px;

        .popup-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 11px;

          .popup-key { color: $text-muted; }
          .popup-val { color: $text-primary; }
        }
      }
    }
  }

  // ============ 底部状态栏 ============
  .bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 32px;
    background: rgba(13, 17, 23, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 20;

    .bottom-left, .bottom-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: $text-muted;
    }

    .coord-badge {
      background: rgba(63, 185, 80, 0.15);
      color: $green;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .bar-divider { color: $text-muted; opacity: 0.3; }

    .draw-badge {
      background: $accent-bg;
      color: $accent-light;
      padding: 1px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
  }

  // ============ Element Plus 深色覆盖 ============
  :deep(.el-switch__core) { background-color: $text-muted !important; }
  :deep(.el-switch.is-checked .el-switch__core) { background-color: $accent !important; }
  :deep(.el-divider--vertical) { border-color: $text-muted !important; }
}
</style>
