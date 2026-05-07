<template>
  <div class="container">
    <!-- 全局模式切换悬浮按钮 -->
    <div class="global-mode-switch" :class="mode">
      <div class="switch-slider"></div>
      <button class="mode-btn" :class="{ active: mode === 'viewer' }" @click="switchMode('viewer')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>模型查看器</span>
      </button>
      <button class="mode-btn" :class="{ active: mode === 'building' }" @click="switchMode('building')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6v4H9z"/></svg>
        <span>智慧楼宇</span>
      </button>
    </div>

    <!-- 智慧楼宇模式 - v-if 可销毁重建 -->
    <SmartBuilding v-if="mode === 'building'" key="building" />

    <!-- 3D 查看器模式 - v-show 保持 DOM 不销毁，避免 Three.js canvas 丢失 -->
    <div v-show="mode === 'viewer'" class="viewer-mode">
      <!-- 3D 渲染区域 -->
      <div class="threejsBox" ref="threejsBox"></div>

    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#6C5CE7" />
            <path d="M2 17L12 22L22 17" stroke="#A29BFE" stroke-width="2" stroke-linecap="round" />
            <path d="M2 12L12 17L22 12" stroke="#A29BFE" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="logo-text">3D Viewer</span>
        </div>
        <el-divider direction="vertical" />
        <span class="model-name">{{ currentModelName || '未加载模型' }}</span>
      </div>
      <div class="top-bar-right">
        <span class="status-dot" :class="{ active: !!currentModel }"></span>
        <span class="status-label">{{ currentModel ? '已就绪' : '等待加载' }}</span>
      </div>
    </div>

    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <div class="toolbar-title">文件</div>
        <div class="toolbar-btn" @click="triggerUpload" title="上传模型">
          <el-icon :size="18"><Upload /></el-icon>
          <span>上传</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">视图</div>
        <div
          class="toolbar-btn"
          :class="{ active: wireframeMode }"
          @click="toggleWireframe"
          title="线框模式"
        >
          <el-icon :size="18"><Grid /></el-icon>
          <span>线框</span>
        </div>
        <div class="toolbar-btn" :class="{ active: showAxes }" @click="toggleAxes" title="坐标轴">
          <el-icon :size="18"><Aim /></el-icon>
          <span>坐标轴</span>
        </div>
        <div class="toolbar-btn" :class="{ active: showGrid }" @click="toggleGrid" title="网格">
          <el-icon :size="18"><Operation /></el-icon>
          <span>网格</span>
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <div class="toolbar-title">工具</div>
        <div class="toolbar-btn" @click="resetCamera" title="重置视角">
          <el-icon :size="18"><RefreshRight /></el-icon>
          <span>复位</span>
        </div>
        <div class="toolbar-btn" @click="takeScreenshot" title="截图保存">
          <el-icon :size="18"><Camera /></el-icon>
          <span>截图</span>
        </div>
        <div class="toolbar-btn" @click="toggleFullscreen" title="全屏">
          <el-icon :size="18"><FullScreen /></el-icon>
          <span>全屏</span>
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
        <!-- 动画控制 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('animation')">
            <span class="section-icon">🎬</span>
            <span class="section-title">动画控制</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.animation }"
              ><ArrowRight
            /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.animation">
            <div v-if="animationNames.length > 0">
              <div class="control-item">
                <span class="control-label">播放状态</span>
                <el-switch v-model="animationPlaying" @change="toggleAnimation" size="small" />
              </div>
              <div class="control-item">
                <span class="control-label">动画速度</span>
                <div class="control-slider">
                  <el-slider
                    v-model="animationSpeed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    size="small"
                    @change="updateAnimationSpeed"
                  />
                  <span class="slider-value">{{ animationSpeed.toFixed(1) }}x</span>
                </div>
              </div>
              <div class="anim-list">
                <div
                  class="anim-item"
                  v-for="name in animationNames"
                  :key="name"
                  :class="{ active: activeAnimations.includes(name) }"
                  @click="toggleSingleAnimation(name, !activeAnimations.includes(name))"
                >
                  <span class="anim-dot"></span>
                  <span>{{ name }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-hint">当前模型无动画</div>
          </div>
        </div>

        <!-- 模型拆解 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('explode')">
            <span class="section-icon"></span>
            <span class="section-title">模型拆解</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.explode }"
              ><ArrowRight
            /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.explode">
            <div class="control-item">
              <span class="control-label">拆解程度</span>
              <div class="control-slider">
                <el-slider
                  v-model="explodeDistance"
                  :min="0"
                  :max="20"
                  :step="0.1"
                  size="small"
                  @input="updateExplode"
                />
                <span class="slider-value">{{ explodeDistance.toFixed(1) }}</span>
              </div>
            </div>
            <div class="btn-group">
              <button class="mini-btn" @click="resetExplode">复位</button>
              <button class="mini-btn primary" @click="doExplode">拆解</button>
            </div>
          </div>
        </div>

        <!-- 场景设置 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('scene')">
            <span class="section-icon"></span>
            <span class="section-title">场景设置</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.scene }"
              ><ArrowRight
            /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.scene">
            <div class="control-item">
              <span class="control-label">背景颜色</span>
              <el-color-picker v-model="bgColor" size="small" @change="updateBgColor" />
            </div>
            <div class="control-item">
              <span class="control-label">环境光</span>
              <div class="control-slider">
                <el-slider
                  v-model="ambientIntensity"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  size="small"
                  @change="updateAmbientLight"
                />
                <span class="slider-value">{{ ambientIntensity.toFixed(1) }}</span>
              </div>
            </div>
            <div class="control-item">
              <span class="control-label">自动旋转</span>
              <el-switch v-model="autoRotate" size="small" @change="toggleAutoRotate" />
            </div>
            <div class="control-item">
              <span class="control-label">旋转速度</span>
              <div class="control-slider">
                <el-slider
                  v-model="autoRotateSpeed"
                  :min="0.5"
                  :max="10"
                  :step="0.5"
                  size="small"
                  @change="updateAutoRotateSpeed"
                />
                <span class="slider-value">{{ autoRotateSpeed.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 模型信息 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('info')">
            <span class="section-icon"></span>
            <span class="section-title">模型信息</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.info }"
              ><ArrowRight
            /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.info">
            <div v-if="modelInfo.name" class="info-grid">
              <div class="info-cell">
                <div class="info-value">{{ modelInfo.meshCount }}</div>
                <div class="info-key">节点数</div>
              </div>
              <div class="info-cell">
                <div class="info-value">{{ formatNumber(modelInfo.triangleCount) }}</div>
                <div class="info-key">三角面</div>
              </div>
              <div class="info-cell">
                <div class="info-value">{{ modelInfo.animationCount }}</div>
                <div class="info-key">动画数</div>
              </div>
            </div>
            <div v-else class="empty-hint">未加载模型</div>
          </div>
        </div>

        <!-- 节点树 -->
        <div class="panel-section">
          <div class="section-header" @click="toggleSection('tree')">
            <span class="section-icon">🌲</span>
            <span class="section-title">节点树</span>
            <el-icon class="section-arrow" :class="{ rotated: openSections.tree }"
              ><ArrowRight
            /></el-icon>
          </div>
          <div class="section-content" v-show="openSections.tree">
            <div v-if="modelNodeTree.length > 0" class="node-tree">
              <el-tree
                :data="modelNodeTree"
                :props="{ label: 'name', children: 'children' }"
                default-expand-all
                @node-click="onTreeNodeClick"
                highlight-current
              />
            </div>
            <div v-else class="empty-hint">未加载模型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="bottom-bar">
      <div class="bottom-left">
        <span class="fps-badge">{{ fps }} FPS</span>
        <span class="bar-divider">|</span>
        <span>{{ statusText }}</span>
      </div>
      <div class="bottom-right">
        <span v-if="selectedNodeName" class="selected-tag">
          <span class="tag-dot"></span>
          {{ selectedNodeName }}
        </span>
      </div>
    </div>

    <!-- 隐藏文件上传 -->
    <input
      ref="fileInput"
      type="file"
      accept=".glb,.gltf"
      style="display: none"
      @change="handleFileUpload"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { ElMessage } from 'element-plus'
import {
  Upload,
  RefreshRight,
  Grid,
  Aim,
  Operation,
  Camera,
  FullScreen,
  ArrowLeft,
  ArrowRight,
} from '@element-plus/icons-vue'
import SmartBuilding from './SmartBuilding.vue'

// ============ 模式切换 ============
const mode = ref<'viewer' | 'building'>('viewer')
const switchMode = (newMode: 'viewer' | 'building') => {
  mode.value = newMode
  if (newMode === 'viewer') {
    nextTick(() => onResize())
  }
}

// ============ DOM 引用 ============
const threejsBox = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// ============ Three.js 核心对象 ============
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let rendererInstance: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number | null = null
let currentModel: THREE.Group | null = null
let mixer: THREE.AnimationMixer | null = null
const clock = new THREE.Clock(true)

// ============ 辅助对象 ============
let axesHelper: THREE.AxesHelper
let gridHelper: THREE.GridHelper
let ambientLight: THREE.AmbientLight
let directionalLight: THREE.DirectionalLight

// ============ Raycaster 用于鼠标拾取 ============
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// ============ 状态变量 ============
const wireframeMode = ref(false)
const showAxes = ref(true)
const showGrid = ref(true)
const panelCollapsed = ref(false)
const statusText = ref('点击左侧「上传」按钮加载 GLB/GLTF 模型')
const selectedNodeName = ref('')
const currentModelName = ref('')
const fps = ref(0)

// 面板折叠
const openSections = reactive({
  animation: true,
  explode: true,
  scene: false,
  info: true,
  tree: false,
})
const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

// 动画
const animationPlaying = ref(false)
const animationSpeed = ref(1)
const animationNames = ref<string[]>([])
const activeAnimations = ref<string[]>([])
const animationActions = ref<Map<string, THREE.AnimationAction>>(new Map())

// 拆解
const explodeDistance = ref(0)
const originalPositions = new Map<THREE.Object3D, THREE.Vector3>()
const explodeDirections = new Map<THREE.Object3D, THREE.Vector3>()
let modelCenter = new THREE.Vector3()

// 场景
const bgColor = ref('#0d1117')
const ambientIntensity = ref(0.6)
const autoRotate = ref(false)
const autoRotateSpeed = ref(2)

// 模型信息
const modelInfo = reactive({
  name: '',
  meshCount: 0,
  triangleCount: 0,
  animationCount: 0,
})
const modelNodeTree = ref<{ name: string; children: any[] }[]>([])

// 高亮相关
let highlightedObject: THREE.Mesh | null = null
let originalMaterial: THREE.Material | THREE.Material[] | null = null

// FPS 计算
let frameCount = 0
let lastFpsTime = performance.now()

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// ============ 初始化场景 ============
const init = () => {
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0d1117, 30, 80)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.set(6, 4, 6)
  camera.lookAt(0, 1, 0)

  rendererInstance = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  rendererInstance.setSize(window.innerWidth, window.innerHeight)
  rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  rendererInstance.setClearColor(new THREE.Color(bgColor.value), 1)
  rendererInstance.shadowMap.enabled = true
  rendererInstance.shadowMap.type = THREE.PCFSoftShadowMap
  rendererInstance.toneMapping = THREE.ACESFilmicToneMapping
  rendererInstance.toneMappingExposure = 1.2
  rendererInstance.outputColorSpace = THREE.SRGBColorSpace

  // 灯光
  ambientLight = new THREE.AmbientLight(0xb0c4de, ambientIntensity.value)
  scene.add(ambientLight)

  directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(8, 15, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  directionalLight.shadow.camera.left = -10
  directionalLight.shadow.camera.right = 10
  directionalLight.shadow.camera.top = 10
  directionalLight.shadow.camera.bottom = -10
  directionalLight.shadow.bias = -0.001
  scene.add(directionalLight)

  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362d1f, 0.4)
  scene.add(hemisphereLight)

  // 地面
  const groundGeo = new THREE.PlaneGeometry(100, 100)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1f2e,
    roughness: 0.9,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.01
  ground.receiveShadow = true
  ground.name = '__ground__'
  scene.add(ground)

  // 辅助工具
  axesHelper = new THREE.AxesHelper(100)
  scene.add(axesHelper)

  gridHelper = new THREE.GridHelper(50, 50, 0x2a3040, 0x1e2530)
  gridHelper.position.y = 0
  scene.add(gridHelper)

  // 轨道控制器
  controls = new OrbitControls(camera, rendererInstance.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.screenSpacePanning = true
  controls.minDistance = 0.5
  controls.maxDistance = 100
  controls.maxPolarAngle = Math.PI / 2 + 0.1
  controls.target.set(0, 1.5, 0)
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = autoRotateSpeed.value

  // 添加默认演示模型
  addDemoModel()

  // 挂载渲染器
  if (threejsBox.value) {
    threejsBox.value.appendChild(rendererInstance.domElement)
  }

  // 事件
  rendererInstance.domElement.addEventListener('click', onCanvasClick)
  window.addEventListener('resize', onResize)

  // 动画循环
  animate()
}

// ============ 默认演示模型 ============
const addDemoModel = () => {
  const group = new THREE.Group()
  group.name = '演示模型'

  // 底座
  const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.2, 64)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x6c5ce7,
    metalness: 0.4,
    roughness: 0.3,
  })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.y = 0.1
  base.castShadow = true
  base.receiveShadow = true
  base.name = '底座'
  group.add(base)

  // 底座装饰环
  const ringGeo = new THREE.TorusGeometry(1.55, 0.04, 16, 64)
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xa29bfe,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x3d3d7a,
    emissiveIntensity: 0.3,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.2
  ring.name = '装饰环'
  group.add(ring)

  // 中间柱
  const pillarGeo = new THREE.CylinderGeometry(0.25, 0.3, 2, 32)
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x00cec9,
    metalness: 0.5,
    roughness: 0.3,
  })
  const pillar = new THREE.Mesh(pillarGeo, pillarMat)
  pillar.position.y = 1.2
  pillar.castShadow = true
  pillar.name = '立柱'
  group.add(pillar)

  // 顶部球
  const sphereGeo = new THREE.SphereGeometry(0.5, 64, 64)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xfd79a8,
    metalness: 0.6,
    roughness: 0.15,
  })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.y = 2.4
  sphere.castShadow = true
  sphere.name = '顶部球体'
  group.add(sphere)

  // 四个装饰立方体
  const cubeColors = [0xe17055, 0xfdcb6e, 0x74b9ff, 0x55efc4]
  const cubeNames = ['装饰A', '装饰B', '装饰C', '装饰D']
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4
    const cubeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
    const cubeMat = new THREE.MeshStandardMaterial({
      color: cubeColors[i],
      metalness: 0.4,
      roughness: 0.3,
    })
    const cube = new THREE.Mesh(cubeGeo, cubeMat)
    cube.position.set(Math.cos(angle) * 0.9, 0.55 + i * 0.35, Math.sin(angle) * 0.9)
    cube.castShadow = true
    cube.name = cubeNames[i] ?? `装饰${i}`
    group.add(cube)
  }

  scene.add(group)
  currentModel = group
  currentModelName.value = group.name
  updateModelInfo(group)
  buildNodeTree(group)
  saveOriginalPositions(group)
}

// ============ 动画循环 ============
const animate = () => {
  animationId = requestAnimationFrame(animate)
  const delta = clock.getDelta()

  // FPS 计算
  frameCount++
  const now = performance.now()
  if (now - lastFpsTime >= 1000) {
    fps.value = frameCount
    frameCount = 0
    lastFpsTime = now
  }

  if (controls) controls.update()
  if (mixer && animationPlaying.value) mixer.update(delta)

  rendererInstance.render(scene, camera)
}

// ============ 模型上传 ============
const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const isGLB = file.name.endsWith('.glb')
  const isGLTF = file.name.endsWith('.gltf')
  if (!isGLB && !isGLTF) {
    ElMessage.error('请上传 .glb 或 .gltf 格式的模型文件')
    return
  }

  statusText.value = `正在加载: ${file.name}...`

  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
  loader.setDRACOLoader(dracoLoader)

  const url = URL.createObjectURL(file)

  loader.load(
    url,
    (gltf) => {
      // 移除旧模型
      if (currentModel) {
        scene.remove(currentModel)
        disposeObject(currentModel)
      }

      const model = gltf.scene
      model.name = file.name

      // 自动缩放 + 底部对齐到地面
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = maxDim > 0 ? 5 / maxDim : 1
      model.scale.setScalar(scale)

      // 缩放后重新计算包围盒
      model.updateMatrixWorld(true)
      const scaledBox = new THREE.Box3().setFromObject(model)
      const scaledMin = scaledBox.min
      const scaledCenter = new THREE.Vector3()
      scaledBox.getCenter(scaledCenter)

      // 模型底部贴地: y方向移动，使底部在 y=0，同时水平居中
      model.position.x += -scaledCenter.x
      model.position.y += -scaledMin.y
      model.position.z += -scaledCenter.z

      scene.add(model)
      currentModel = model
      currentModelName.value = file.name

      // 处理动画
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model)
        animationNames.value = gltf.animations.map((a) => a.name)
        animationActions.value = new Map()
        activeAnimations.value = []

        gltf.animations.forEach((clip) => {
          const action = mixer!.clipAction(clip)
          animationActions.value.set(clip.name, action)
        })

        if (gltf.animations.length > 0) {
          const firstName = gltf.animations[0]!.name
          activeAnimations.value.push(firstName)
          const firstAction = animationActions.value.get(firstName)
          if (firstAction) {
            firstAction.play()
            animationPlaying.value = true
          }
        }
      } else {
        mixer = null
        animationNames.value = []
        activeAnimations.value = []
        animationActions.value = new Map()
      }

      updateModelInfo(model)
      buildNodeTree(model)
      saveOriginalPositions(model)
      resetCamera()

      statusText.value = `已加载: ${file.name}`
      ElMessage.success(`模型 ${file.name} 加载成功`)
      URL.revokeObjectURL(url)
    },
    (progress) => {
      if (progress.total > 0) {
        const pct = Math.round((progress.loaded / progress.total) * 100)
        statusText.value = `加载中: ${pct}%`
      }
    },
    (error) => {
      console.error('模型加载失败:', error)
      ElMessage.error('模型加载失败，请检查文件格式')
      statusText.value = '加载失败'
      URL.revokeObjectURL(url)
    },
  )

  input.value = ''
}

// ============ 节点点击变色 ============
const onCanvasClick = (event: MouseEvent) => {
  const rect = rendererInstance.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children, true)
  const firstHit = intersects.find(
    (i) => i.object instanceof THREE.Mesh && i.object.name && !i.object.name.startsWith('__'),
  )

  restoreHighlight()

  if (firstHit) {
    const obj = firstHit.object as THREE.Mesh
    highlightedObject = obj
    originalMaterial = obj.material
    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
      wireframe: wireframeMode.value,
    })
    obj.material = highlightMat
    selectedNodeName.value = obj.name || obj.uuid
    statusText.value = `选中: ${obj.name || obj.uuid}`
  } else {
    selectedNodeName.value = ''
    statusText.value = currentModel ? `已加载: ${currentModel.name}` : '就绪'
  }
}

const restoreHighlight = () => {
  if (highlightedObject && originalMaterial) {
    highlightedObject.material = originalMaterial
    highlightedObject = null
    originalMaterial = null
  }
}

// ============ 节点树点击 ============
const onTreeNodeClick = (data: { name: string; uuid?: string }) => {
  if (!currentModel) return
  const target = currentModel.getObjectByName(data.name)
  if (target && target instanceof THREE.Mesh) {
    restoreHighlight()
    highlightedObject = target
    originalMaterial = target.material
    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
      wireframe: wireframeMode.value,
    })
    target.material = highlightMat
    selectedNodeName.value = target.name
    statusText.value = `选中: ${target.name}`
  }
}

// ============ 模型拆解 ============
const saveOriginalPositions = (object: THREE.Object3D) => {
  originalPositions.clear()
  explodeDirections.clear()

  // 计算模型包围盒中心（作为爆炸中心）
  const box = new THREE.Box3().setFromObject(object)
  modelCenter = box.getCenter(new THREE.Vector3())
  const meshList: THREE.Mesh[] = []

  // 收集所有 Mesh 并保存原始位置
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.set(child, child.position.clone())
      meshList.push(child)
    }
  })

  // 为每个 Mesh 预计算唯一方向（基于位置 + 随机扰动）
  const count = meshList.length
  if (count <= 1) return

  // 使用球面均匀分布 + 基于位置的偏移
  meshList.forEach((mesh, i) => {
    const origPos = originalPositions.get(mesh)!
    const localDir = origPos.clone().sub(modelCenter)

    if (localDir.lengthSq() < 0.001) {
      // 在原点附近的部件：使用黄金螺旋分布
      const phi = Math.acos(1 - 2 * (i + 0.5) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      localDir.set(
        Math.sin(phi) * Math.cos(theta),
        Math.abs(Math.sin(phi) * Math.sin(theta)) * 0.8 + 0.2, // 稍微向上偏
        Math.sin(phi) * Math.sin(theta),
      )
    }

    localDir.normalize()
    explodeDirections.set(mesh, localDir)
  })
}

const updateExplode = () => {
  if (!currentModel) return

  currentModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const orig = originalPositions.get(child)
      const dir = explodeDirections.get(child)
      if (orig && dir) {
        // 沿预计算方向偏移
        child.position.copy(orig).add(dir.clone().multiplyScalar(explodeDistance.value))
      }
    }
  })
}

const resetExplode = () => {
  explodeDistance.value = 0
  updateExplode()
}

const doExplode = () => {
  explodeDistance.value = 10
  updateExplode()
}

// ============ 动画控制 ============
const toggleAnimation = (play: boolean) => {
  if (!mixer) return
  if (play) {
    activeAnimations.value.forEach((name) => {
      const action = animationActions.value.get(name)
      if (action) {
        action.paused = false
        action.play()
      }
    })
    mixer.timeScale = animationSpeed.value
  } else {
    mixer.timeScale = 0
    activeAnimations.value.forEach((name) => {
      const action = animationActions.value.get(name)
      if (action) action.paused = true
    })
  }
}

const updateAnimationSpeed = (val: number) => {
  if (mixer) mixer.timeScale = val
}

const toggleSingleAnimation = (name: string, enabled: boolean) => {
  const action = animationActions.value.get(name)
  if (!action) return

  if (enabled) {
    action.reset().play()
    activeAnimations.value.push(name)
    animationPlaying.value = true
  } else {
    action.stop()
    activeAnimations.value = activeAnimations.value.filter((n) => n !== name)
    if (activeAnimations.value.length === 0) animationPlaying.value = false
  }
}

// ============ 工具功能 ============
const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value
  if (!currentModel) return
  currentModel.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        if ('wireframe' in mat) mat.wireframe = wireframeMode.value
      })
    }
  })
}

const toggleAxes = () => {
  showAxes.value = !showAxes.value
  axesHelper.visible = showAxes.value
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
  gridHelper.visible = showGrid.value
}

const resetCamera = () => {
  camera.position.set(6, 4, 6)
  controls.target.set(0, 1.5, 0)
  controls.update()
}

const updateBgColor = (color: string) => {
  rendererInstance.setClearColor(new THREE.Color(color), 1)
  if (scene.fog) (scene.fog as THREE.Fog).color.set(new THREE.Color(color))
}

const updateAmbientLight = (val: number) => {
  ambientLight.intensity = val
}

const toggleAutoRotate = (val: boolean) => {
  controls.autoRotate = val
}

const updateAutoRotateSpeed = (val: number) => {
  controls.autoRotateSpeed = val
}

const takeScreenshot = () => {
  rendererInstance.render(scene, camera)
  const dataUrl = rendererInstance.domElement.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `threejs-screenshot-${Date.now()}.png`
  link.click()
  ElMessage.success('截图已保存')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// ============ 模型信息 ============
const updateModelInfo = (object: THREE.Object3D) => {
  let meshCount = 0
  let triangleCount = 0

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++
      const geo = child.geometry
      if (geo.index) {
        triangleCount += geo.index.count / 3
      } else if (geo.attributes.position) {
        triangleCount += geo.attributes.position.count / 3
      }
    }
  })

  modelInfo.name = object.name
  modelInfo.meshCount = meshCount
  modelInfo.triangleCount = Math.round(triangleCount)
  modelInfo.animationCount = animationNames.value.length
}

const buildNodeTree = (object: THREE.Object3D) => {
  const build = (obj: THREE.Object3D): any => {
    const children: any[] = []
    obj.children.forEach((child) => {
      if (child.name || child.children.length > 0) {
        children.push(build(child))
      }
    })
    return { name: obj.name || '未命名', children }
  }
  modelNodeTree.value = [build(object)]
}

// ============ 资源释放 ============
const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose())
      } else {
        child.material?.dispose()
      }
    }
  })
}

// ============ 窗口大小变化 ============
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  rendererInstance.setSize(window.innerWidth, window.innerHeight)
}

// ============ 生命周期 ============
onMounted(() => {
  init()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  rendererInstance.domElement.removeEventListener('click', onCanvasClick)

  if (mixer) mixer.stopAllAction()
  if (currentModel) disposeObject(currentModel)

  controls.dispose()
  rendererInstance.dispose()
  rendererInstance.forceContextLoss()
})
</script>

<style scoped lang="scss">
// ============ 变量 ============
$bg-dark: #0d1117;
$bg-card: #161b22;
$bg-hover: #1c2333;
$border-color: rgba(255, 255, 255, 0.06);
$text-primary: #e6edf3;
$text-secondary: #8b949e;
$text-muted: #484f58;
$accent: #6c5ce7;
$accent-light: #a29bfe;
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
  background: $bg-dark;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  .threejsBox {
    width: 100%;
    height: 100%;
    canvas {
      display: block;
    }
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

      .logo {
        display: flex;
        align-items: center;
        gap: 8px;

        .logo-text {
          font-size: 14px;
          font-weight: 600;
          color: $text-primary;
          letter-spacing: 0.5px;
        }
      }

      .el-divider {
        border-color: $text-muted;
      }

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

          .el-icon {
            color: $accent-light;
          }
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
    transition:
      width 0.3s ease,
      opacity 0.2s ease;
    overflow: hidden;

    &.collapsed {
      width: 40px;

      .panel-header span:first-child {
        opacity: 0;
      }
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid $border-color;
      flex-shrink: 0;

      span:first-child {
        font-size: 13px;
        font-weight: 600;
        color: $text-primary;
        transition: opacity 0.2s;
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

        &:hover {
          background: $bg-hover;
          color: $text-primary;
        }
      }
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
    }

    .panel-section {
      border-bottom: 1px solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s;

        &:hover {
          background: $bg-hover;
        }

        .section-icon {
          font-size: 13px;
          flex-shrink: 0;
        }

        .section-title {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          color: $text-primary;
        }

        .section-arrow {
          color: $text-muted;
          font-size: 12px;
          transition: transform 0.2s;

          &.rotated {
            transform: rotate(90deg);
          }
        }
      }

      .section-content {
        padding: 4px 12px 10px;
      }
    }
  }

  // ============ 控制项 ============
  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;

    .control-label {
      font-size: 11px;
      color: $text-secondary;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .control-slider {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;

      .el-slider {
        flex: 1;
      }

      .slider-value {
        font-size: 10px;
        color: $text-muted;
        min-width: 28px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  // ============ 动画列表 ============
  .anim-list {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .anim-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 11px;
      color: $text-secondary;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: $bg-hover;
      }

      .anim-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: $text-muted;
        transition: all 0.15s;
        flex-shrink: 0;
      }

      &.active {
        color: $accent-light;
        background: $accent-bg;

        .anim-dot {
          background: $accent-light;
          box-shadow: 0 0 4px rgba(162, 155, 254, 0.5);
        }
      }
    }
  }

  // ============ 按钮组 ============
  .btn-group {
    display: flex;
    gap: 6px;
    margin-top: 4px;

    .mini-btn {
      flex: 1;
      padding: 5px 0;
      border-radius: 6px;
      border: 1px solid $border-color;
      background: transparent;
      color: $text-secondary;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: $bg-hover;
        color: $text-primary;
      }

      &.primary {
        background: $accent-bg;
        border-color: rgba(108, 92, 231, 0.3);
        color: $accent-light;

        &:hover {
          background: rgba(108, 92, 231, 0.25);
        }
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

      .info-value {
        font-size: 16px;
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

  // ============ 空提示 ============
  .empty-hint {
    text-align: center;
    color: $text-muted;
    font-size: 11px;
    padding: 12px 0;
  }

  // ============ 节点树 ============
  .node-tree {
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    :deep(.el-tree) {
      background: transparent;
      color: $text-secondary;
      font-size: 11px;

      .el-tree-node__content {
        height: 26px;
        border-radius: 4px;
        margin: 1px 0;

        &:hover {
          background: $bg-hover;
        }
      }

      .el-tree-node.is-current > .el-tree-node__content {
        background: $accent-bg;
        color: $accent-light;
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

    .bottom-left,
    .bottom-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: $text-muted;
    }

    .fps-badge {
      background: rgba(63, 185, 80, 0.15);
      color: $green;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .bar-divider {
      color: $text-muted;
      opacity: 0.3;
    }

    .selected-tag {
      display: flex;
      align-items: center;
      gap: 5px;
      background: $accent-bg;
      color: $accent-light;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;

      .tag-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: $accent-light;
      }
    }
  }

  // ============ Element Plus 深色覆盖 ============
  :deep(.el-switch__core) {
    background-color: $text-muted !important;
  }
  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: $accent !important;
  }
  :deep(.el-slider__runway) {
    background-color: rgba(255, 255, 255, 0.08) !important;
  }
  :deep(.el-slider__bar) {
    background-color: $accent !important;
  }
  :deep(.el-slider__button) {
    border-color: $accent !important;
  }
  :deep(.el-color-picker__trigger) {
    border-color: $border-color !important;
  }
  :deep(.el-divider--vertical) {
    border-color: $text-muted !important;
  }

  // ============ 全局模式切换 Segmented Control ============
  .global-mode-switch {
    position: absolute;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    background: rgba(10, 14, 26, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108, 92, 231, 0.1);

    .switch-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: calc(50% - 4px);
      height: calc(100% - 6px);
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.85), rgba(162, 155, 254, 0.65));
      border-radius: 8px;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 12px rgba(108, 92, 231, 0.4), inset 0 1px 0 rgba(255,255,255,0.15);
      z-index: 0;
    }

    &.building .switch-slider {
      transform: translateX(calc(100% + 2px));
    }

    .mode-btn {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 18px;
      border: none;
      background: transparent;
      color: $text-secondary;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.25s ease;
      white-space: nowrap;
      min-width: 80px;

      &:hover { color: $text-primary; }

      &.active {
        color: #fff;
        text-shadow: 0 0 10px rgba(255,255,255,0.3);
      }
    }
  }

  // ============ 模式切换过渡动画 ============
  .mode-switch-enter-active,
  .mode-switch-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .mode-switch-enter-from {
    opacity: 0;
    transform: scale(0.97);
  }
  .mode-switch-leave-to {
    opacity: 0;
    transform: scale(1.02);
  }

  // ============ 查看器模式容器 ============
  .viewer-mode {
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>
