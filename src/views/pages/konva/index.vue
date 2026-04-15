<template>
  <div class="editor-root">
    <!-- 顶部工具栏 -->
    <div class="toolbar" v-show="!isPreview">
      <div class="toolbar-left">
        <div class="logo-wrap">
          <div class="logo-icon"></div>
          <span class="logo-title">页面搭建器</span>
        </div>
        <div class="toolbar-divider" />
        <el-button class="tb-btn" size="small" @click="store.undo()" :disabled="store.snapshotIndex <= 0">
          <el-icon><RefreshLeft /></el-icon>
          <span>撤销</span>
        </el-button>
        <el-button
          class="tb-btn"
          size="small"
          @click="store.redo()"
          :disabled="store.snapshotIndex >= snapshotsLength - 1"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>重做</span>
        </el-button>
        <div class="toolbar-divider" />
        <el-button class="tb-btn" size="small" @click="store.copySelected()" :disabled="!store.selectedId">
          <el-icon><CopyDocument /></el-icon>
          <span>复制</span>
        </el-button>
        <el-button class="tb-btn" size="small" @click="store.deleteSelected()" :disabled="!store.selectedId">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button class="tb-btn tb-btn-outline" size="small" @click="handleQuickImport">
          <el-icon><Upload /></el-icon>
          <span>导入</span>
        </el-button>
        <el-button class="tb-btn tb-btn-outline" size="small" @click="handleExportData">
          <el-icon><Download /></el-icon>
          <span>导出</span>
        </el-button>
        <div class="toolbar-divider" />
        <el-button class="tb-btn tb-btn-danger" size="small" @click="store.clearCanvas()">
          <el-icon><DeleteFilled /></el-icon>
          <span>清空</span>
        </el-button>
        <el-button class="tb-btn tb-btn-primary" size="small" @click="handlePublish">
          <el-icon><UploadFilled /></el-icon>
          <span>发布</span>
        </el-button>
        <el-button class="tb-btn tb-btn-success" size="small" @click="isPreview = true">
          <el-icon><View /></el-icon>
          <span>预览</span>
        </el-button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div class="editor-body" v-show="!isPreview">
      <!-- 左侧组件面板 -->
      <div class="left-panel">
        <div class="panel-title">组件库</div>
        <div class="component-list">
          <div
            v-for="item in componentList"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="(e: DragEvent) => onDragStart(e, item.type)"
          >
            <div class="component-icon" v-html="item.icon"></div>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-wrapper">
        <div class="canvas-scroll">
          <div
            ref="canvasRef"
            class="canvas"
            :style="canvasStyle"
            @dragover.prevent
            @drop="onDrop"
            @mousedown="onCanvasMouseDown"
          >
            <!-- 辅助线 -->
            <template v-for="(line, i) in guideLines" :key="i">
              <div
                v-if="line.type === 'v'"
                class="guide-line guide-v"
                :style="{ left: line.pos + 'px', top: 0, height: '100%' }"
              />
              <div
                v-else
                class="guide-line guide-h"
                :style="{ top: line.pos + 'px', left: 0, width: '100%' }"
              />
            </template>

            <!-- 组件 -->
            <div
              v-for="comp in store.components"
              :key="comp.id"
              class="shape"
              :class="{ selected: store.selectedId === comp.id, locked: comp.locked }"
              :style="shapeStyle(comp)"
              @mousedown.stop="onShapeMouseDown($event, comp)"
            >
              <!-- 标题栏 -->
              <div class="shape-label" v-show="store.selectedId === comp.id && !comp.locked">
                <span>{{ comp.label }}</span>
                <div class="shape-actions">
                  <el-icon title="锁定" @click.stop="store.toggleLock(comp.id)"
                    ><Lock v-if="!comp.locked" /><Unlock v-else
                  /></el-icon>
                  <el-icon title="上移" @click.stop="store.moveUp(comp.id)"><Top /></el-icon>
                  <el-icon title="下移" @click.stop="store.moveDown(comp.id)"><Bottom /></el-icon>
                </div>
              </div>

              <!-- 组件内容 -->
              <div class="shape-content">
                <DataVBorder :border-type="comp.borderType">
                  <div style="width: 100%; height: 100%; padding: 4px; box-sizing: border-box">
                    <TextBlock
                      v-if="comp.type === 'text'"
                      :prop-value="comp.propValue"
                      :editable="store.selectedId === comp.id"
                    />
                    <ImageBlock v-else-if="comp.type === 'image'" :prop-value="comp.propValue" />
                    <TableBlock v-else-if="comp.type === 'table'" :prop-value="comp.propValue" />
                    <BarChart v-else-if="comp.type === 'bar-chart'" :prop-value="comp.propValue" />
                    <ColumnChart
                      v-else-if="comp.type === 'column-chart'"
                      :prop-value="comp.propValue"
                    />
                    <PieChart v-else-if="comp.type === 'pie-chart'" :prop-value="comp.propValue" />
                    <LineChart
                      v-else-if="comp.type === 'line-chart'"
                      :prop-value="comp.propValue"
                    />
                  </div>
                </DataVBorder>
              </div>

              <!-- 缩放控制点 -->
              <template v-if="store.selectedId === comp.id && !comp.locked">
                <div
                  v-for="h in handles"
                  :key="h.pos"
                  class="handle"
                  :class="'handle-' + h.pos"
                  @mousedown.stop="onHandleMouseDown($event, comp, h)"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="right-panel" v-if="store.selectedComponent">
        <div class="panel-title">属性设置</div>
        <div class="prop-section">
          <div class="prop-row">
            <label>X</label>
            <el-input-number
              :model-value="store.selectedComponent.x"
              :min="0"
              size="small"
              controls-position="right"
              @change="(v: number) => updateProp('x', v)"
            />
          </div>
          <div class="prop-row">
            <label>Y</label>
            <el-input-number
              :model-value="store.selectedComponent.y"
              :min="0"
              size="small"
              controls-position="right"
              @change="(v: number) => updateProp('y', v)"
            />
          </div>
          <div class="prop-row">
            <label>宽</label>
            <el-input-number
              :model-value="store.selectedComponent.w"
              :min="100"
              size="small"
              controls-position="right"
              @change="(v: number) => updateProp('w', v)"
            />
          </div>
          <div class="prop-row">
            <label>高</label>
            <el-input-number
              :model-value="store.selectedComponent.h"
              :min="60"
              size="small"
              controls-position="right"
              @change="(v: number) => updateProp('h', v)"
            />
          </div>
        </div>

        <!-- 文字属性 -->
        <div class="prop-section" v-if="store.selectedComponent?.type === 'text'">
          <div class="prop-section-title">文字内容</div>
          <el-input
            :model-value="store.selectedComponent.propValue?.content"
            type="textarea"
            :rows="3"
            @update:model-value="
              (v: string) => {
                store.selectedComponent!.propValue.content = v
                recordAfterChange()
              }
            "
          />
          <div class="prop-row">
            <label>字号</label>
            <el-input-number
              :model-value="store.selectedComponent.propValue?.fontSize || 16"
              :min="12"
              :max="72"
              size="small"
              controls-position="right"
              @change="
                (v: number) => {
                  store.selectedComponent!.propValue.fontSize = v
                  recordAfterChange()
                }
              "
            />
          </div>
          <div class="prop-row">
            <label>颜色</label>
            <el-color-picker
              :model-value="store.selectedComponent.propValue?.color || '#e0e6ed'"
              size="small"
              @change="
                (v: string) => {
                  store.selectedComponent!.propValue.color = v
                  recordAfterChange()
                }
              "
            />
          </div>
          <div class="prop-row">
            <label>对齐</label>
            <el-radio-group
              :model-value="store.selectedComponent.propValue?.align || 'left'"
              size="small"
              @change="
                (v: string) => {
                  store.selectedComponent!.propValue.align = v
                  recordAfterChange()
                }
              "
            >
              <el-radio-button value="left">左</el-radio-button>
              <el-radio-button value="center">中</el-radio-button>
              <el-radio-button value="right">右</el-radio-button>
            </el-radio-group>
          </div>
          <div class="prop-row">
            <label>加粗</label>
            <el-switch
              :model-value="store.selectedComponent.propValue?.bold || false"
              @change="
                (v: boolean) => {
                  store.selectedComponent!.propValue.bold = v
                  recordAfterChange()
                }
              "
            />
          </div>
        </div>

        <!-- 边框选择 -->
        <div class="prop-section" v-if="store.selectedComponent?.type !== 'text'">
          <div class="prop-section-title">边框样式</div>
          <div class="border-picker">
            <div
              v-for="opt in borderOptions"
              :key="opt.value"
              class="border-option"
              :class="{ active: store.selectedComponent?.borderType === opt.value }"
              @click="updateProp('borderType', opt.value); recordAfterChange()"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>

        <!-- 图片属性 -->
        <div class="prop-section" v-if="store.selectedComponent?.type === 'image'">
          <div class="prop-section-title">图片地址</div>
          <el-input
            :model-value="store.selectedComponent.propValue?.url"
            @update:model-value="
              (v: string) => {
                store.selectedComponent!.propValue.url = v
                recordAfterChange()
              }
            "
          />
          <div class="prop-row">
            <label>适应</label>
            <el-select
              :model-value="store.selectedComponent.propValue?.fit || 'cover'"
              size="small"
              @change="
                (v: string) => {
                  store.selectedComponent!.propValue.fit = v
                  recordAfterChange()
                }
              "
            >
              <el-option label="填充" value="cover" />
              <el-option label="包含" value="contain" />
              <el-option label="拉伸" value="fill" />
            </el-select>
          </div>
        </div>

        <!-- 图表/表格数据 -->
        <div class="prop-section" v-if="isChartData">
          <div class="prop-section-title">数据</div>
          <el-button size="small" type="primary" plain @click="openDataDialog" style="width: 100%">
            <el-icon><EditPen /></el-icon> 编辑数据
          </el-button>
        </div>
      </div>

      <!-- 未选中提示 -->
      <div class="right-panel-empty" v-show="!store.selectedComponent">
        <el-icon :size="40" color="#3a4a5a"><Pointer /></el-icon>
        <p>点击组件编辑属性</p>
      </div>
    </div>

    <!-- 预览模式 -->
    <div class="preview-body" v-if="isPreview">
      <div class="preview-toolbar">
        <el-button class="tb-btn tb-btn-success" size="small" @click="isPreview = false">
          <el-icon><Back /></el-icon>
          <span>退出预览</span>
        </el-button>
      </div>
      <div class="preview-wrapper">
        <div class="preview-canvas" :style="canvasStyle">
          <div
            v-for="comp in store.components"
            :key="comp.id"
            :style="{
              position: 'absolute',
              left: comp.x + 'px',
              top: comp.y + 'px',
              width: comp.w + 'px',
              height: comp.h + 'px',
            }"
          >
            <!-- 预览模式 -->
            <DataVBorder :border-type="comp.borderType">
              <div style="width: 100%; height: 100%; padding: 4px; box-sizing: border-box">
                <TextBlock v-if="comp.type === 'text'" :prop-value="comp.propValue" />
                <ImageBlock v-else-if="comp.type === 'image'" :prop-value="comp.propValue" />
                <TableBlock v-else-if="comp.type === 'table'" :prop-value="comp.propValue" />
                <BarChart v-else-if="comp.type === 'bar-chart'" :prop-value="comp.propValue" />
                <ColumnChart
                  v-else-if="comp.type === 'column-chart'"
                  :prop-value="comp.propValue"
                />
                <PieChart v-else-if="comp.type === 'pie-chart'" :prop-value="comp.propValue" />
                <LineChart v-else-if="comp.type === 'line-chart'" :prop-value="comp.propValue" />
              </div>
            </DataVBorder>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据编辑弹窗 -->
    <DialogBox
      v-model="dataDialogVisible"
      title="数据编辑器"
      width="860px"
      @confirm="handleApplyData"
      @cancel="dataDialogVisible = false"
    >
      <BorderCard title="JSON 数据" :hoverable="false" style="height: 100%">
        <div style="display: flex; flex-direction: column; gap: 12px; height: 100%">
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <el-button class="tb-btn tb-btn-outline" size="small" @click="handleExportData">
              <el-icon><Download /></el-icon> 导出文件
            </el-button>
            <el-button class="tb-btn tb-btn-outline" size="small" @click="handleCopyData">
              <el-icon><DocumentCopy /></el-icon> 复制
            </el-button>
          </div>
          <el-input
            v-model="dataDialogJson"
            type="textarea"
            :autosize="{ minRows: 16, maxRows: 28 }"
            spellcheck="false"
            class="data-textarea"
          />
          <div v-if="dataDialogError" style="color: #ff4d4f; font-size: 12px">
            {{ dataDialogError }}
          </div>
        </div>
      </BorderCard>
    </DialogBox>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  RefreshLeft,
  RefreshRight,
  CopyDocument,
  Delete,
  DeleteFilled,
  UploadFilled,
  View,
  Pointer,
  Back,
  Lock,
  Unlock,
  Top,
  Bottom,
  EditPen,
  Download,
  Upload,
  DocumentCopy,
  Check,
} from '@element-plus/icons-vue'
import {
  useEditorStore,
  type ComponentType,
  type IComponent,
  type BorderType,
} from '@/stores/editor'
import TextBlock from './components/TextBlock.vue'
import ImageBlock from './components/ImageBlock.vue'
import TableBlock from './components/TableBlock.vue'
import BarChart from './components/BarChart.vue'
import ColumnChart from './components/ColumnChart.vue'
import PieChart from './components/PieChart.vue'
import LineChart from './components/LineChart.vue'
import BorderCard from '@/components/BorderCard.vue'
import DialogBox from '@/components/DialogBox.vue'
import DataVBorder from './components/DataVBorder.vue'

const borderOptions: { label: string; value: BorderType }[] = [
  { label: '无边框', value: '' },
  { label: '边框1', value: 'border1' },
  { label: '边框2', value: 'border2' },
  { label: '边框3', value: 'border3' },
  { label: '边框4', value: 'border4' },
  { label: '边框5', value: 'border5' },
  { label: '边框6', value: 'border6' },
  { label: '边框7', value: 'border7' },
  { label: '边框8', value: 'border8' },
  { label: '边框9', value: 'border9' },
  { label: '边框10', value: 'border10' },
  { label: '边框11', value: 'border11' },
  { label: '边框12', value: 'border12' },
  { label: '边框13', value: 'border13' },
]

const store = useEditorStore()
const isPreview = ref(false)
const canvasRef = ref<HTMLElement>()

// 左侧组件列表
const componentList: { type: ComponentType; label: string; icon: string }[] = [
  {
    type: 'text',
    label: '文字',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',
  },
  {
    type: 'image',
    label: '图片',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  },
  {
    type: 'table',
    label: '表格',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  },
  {
    type: 'bar-chart',
    label: '条形图',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>',
  },
  {
    type: 'column-chart',
    label: '柱状图',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="4" height="18"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="11" width="4" height="10"/></svg>',
  },
  {
    type: 'pie-chart',
    label: '饼图',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/><path d="M12 3v9h8.5"/></svg>',
  },
  {
    type: 'line-chart',
    label: '折线图',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 7"/></svg>',
  },
]

// 画布样式
const canvasStyle = computed(() => ({
  width: store.canvasStyle.width + 'px',
  height: store.canvasStyle.height + 'px',
  backgroundColor: store.canvasStyle.bg,
}))

// 8 个缩放控制点
const handles = [
  { pos: 'tl' as const },
  { pos: 'tm' as const },
  { pos: 'tr' as const },
  { pos: 'ml' as const },
  { pos: 'mr' as const },
  { pos: 'bl' as const },
  { pos: 'bm' as const },
  { pos: 'br' as const },
]

// 辅助线
interface GuideLine {
  type: 'v' | 'h'
  pos: number
}
const guideLines = ref<GuideLine[]>([])
const SNAP_THRESHOLD = 5

const snapshotsLength = computed(() => store.snapshotIndex + 1)

// 拖入
function onDragStart(e: DragEvent, type: ComponentType) {
  e.dataTransfer?.setData('component-type', type)
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('component-type') as ComponentType
  if (!type) return
  const rect = canvasRef.value!.getBoundingClientRect()
  store.addComponent(type, e.clientX - rect.left, e.clientY - rect.top)
}

// 取消选中
function onCanvasMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('canvas')) {
    store.selectedId = null
  }
}

// 样式
function shapeStyle(comp: IComponent) {
  return {
    left: comp.x + 'px',
    top: comp.y + 'px',
    width: comp.w + 'px',
    height: comp.h + 'px',
    zIndex: store.components.indexOf(comp) + 1,
  }
}

// ========== 拖拽移动 ==========
let isDragging = false
let dragStartX = 0,
  dragStartY = 0,
  compStartX = 0,
  compStartY = 0

function onShapeMouseDown(e: MouseEvent, comp: IComponent) {
  if (comp.locked) return
  store.selectedId = comp.id
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  compStartX = comp.x
  compStartY = comp.y
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !store.selectedComponent) return
  let nx = compStartX + (e.clientX - dragStartX)
  let ny = compStartY + (e.clientY - dragStartY)
  const sc = store.selectedComponent

  guideLines.value = calcGuideLines(sc, nx, ny)

  // 吸附
  guideLines.value.forEach((line) => {
    if (line.type === 'v') {
      const points = [nx, nx + sc.w / 2, nx + sc.w]
      for (const p of points) {
        if (Math.abs(p - line.pos) < SNAP_THRESHOLD) {
          nx += line.pos - p
          break
        }
      }
    } else {
      const points = [ny, ny + sc.h / 2, ny + sc.h]
      for (const p of points) {
        if (Math.abs(p - line.pos) < SNAP_THRESHOLD) {
          ny += line.pos - p
          break
        }
      }
    }
  })

  sc.x = Math.max(0, Math.min(Math.round(nx), store.canvasStyle.width - sc.w))
  sc.y = Math.max(0, Math.min(Math.round(ny), store.canvasStyle.height - sc.h))
}

function onMouseUp() {
  if (isDragging) {
    isDragging = false
    guideLines.value = []
    store.recordSnapshot()
  }
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

function calcGuideLines(comp: IComponent, nx: number, ny: number): GuideLine[] {
  const lines: GuideLine[] = []
  const others = store.components.filter((c) => c.id !== comp.id)
  const cx = [nx, nx + comp.w / 2, nx + comp.w]
  const cy = [ny, ny + comp.h / 2, ny + comp.h]
  for (const o of others) {
    const ox = [o.x, o.x + o.w / 2, o.x + o.w]
    const oy = [o.y, o.y + o.h / 2, o.y + o.h]
    for (const x of cx)
      for (const xo of ox) if (Math.abs(x - xo) < SNAP_THRESHOLD) lines.push({ type: 'v', pos: xo })
    for (const y of cy)
      for (const yo of oy) if (Math.abs(y - yo) < SNAP_THRESHOLD) lines.push({ type: 'h', pos: yo })
  }
  return lines.filter(
    (l, i, arr) => arr.findIndex((t) => t.type === l.type && t.pos === l.pos) === i,
  )
}

// ========== 缩放 ==========
let isResizing = false
let resizeHandle: string | null = null
let resizeStartX = 0,
  resizeStartY = 0
let resizeStartComp: { x: number; y: number; w: number; h: number } | null = null

function onHandleMouseDown(e: MouseEvent, comp: IComponent, handle: { pos: string }) {
  if (comp.locked) return
  isResizing = true
  resizeHandle = handle.pos
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartComp = { x: comp.x, y: comp.y, w: comp.w, h: comp.h }
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeUp)
}

function onResizeMove(e: MouseEvent) {
  if (!isResizing || !resizeStartComp || !store.selectedComponent) return
  const dx = e.clientX - resizeStartX,
    dy = e.clientY - resizeStartY
  const s = resizeStartComp,
    c = store.selectedComponent
  const minW = 120,
    minH = 80
  let nx = s.x,
    ny = s.y,
    nw = s.w,
    nh = s.h

  switch (resizeHandle) {
    case 'tl':
      nx = s.x + dx
      ny = s.y + dy
      nw = s.w - dx
      nh = s.h - dy
      break
    case 'tm':
      ny = s.y + dy
      nh = s.h - dy
      break
    case 'tr':
      ny = s.y + dy
      nw = s.w + dx
      nh = s.h - dy
      break
    case 'ml':
      nx = s.x + dx
      nw = s.w - dx
      break
    case 'mr':
      nw = s.w + dx
      break
    case 'bl':
      nx = s.x + dx
      nw = s.w - dx
      nh = s.h + dy
      break
    case 'bm':
      nh = s.h + dy
      break
    case 'br':
      nw = s.w + dx
      nh = s.h + dy
      break
  }
  if (nw < minW) {
    if (resizeHandle?.startsWith('t') || resizeHandle === 'ml') nx = s.x + s.w - minW
    nw = minW
  }
  if (nh < minH) {
    if (resizeHandle?.startsWith('l') || resizeHandle === 'tm') ny = s.y + s.h - minH
    nh = minH
  }

  c.x = Math.round(nx)
  c.y = Math.round(ny)
  c.w = Math.round(nw)
  c.h = Math.round(nh)
}

function onResizeUp() {
  if (isResizing) {
    isResizing = false
    resizeHandle = null
    store.recordSnapshot()
  }
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeUp)
}

// ========== 属性面板 ==========
const isChartData = computed(() => {
  const t = store.selectedComponent?.type
  return (
    t === 'bar-chart' ||
    t === 'column-chart' ||
    t === 'pie-chart' ||
    t === 'line-chart' ||
    t === 'table'
  )
})

// ========== 数据弹窗 ==========
const dataDialogVisible = ref(false)
const dataDialogJson = ref('')
const dataDialogError = ref('')

function openDataDialog() {
  if (!store.selectedComponent) return
  dataDialogJson.value = JSON.stringify(store.selectedComponent.propValue, null, 2)
  dataDialogError.value = ''
  dataDialogVisible.value = true
}

function handleApplyData() {
  if (!store.selectedComponent) return
  try {
    const parsed = JSON.parse(dataDialogJson.value)
    store.selectedComponent.propValue = parsed
    store.recordSnapshot()
    dataDialogError.value = ''
    dataDialogVisible.value = false
    ElMessage.success('数据已应用')
  } catch (e: any) {
    dataDialogError.value = 'JSON 格式错误: ' + (e.message || '')
  }
}

function handleExportData() {
  if (!store.selectedComponent) return
  const json = JSON.stringify(store.selectedComponent.propValue, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (store.selectedComponent.label || 'data') + '.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出')
}

function handleCopyData() {
  navigator.clipboard
    .writeText(dataDialogJson.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.warning('复制失败')
    })
}

function handleImportData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      dataDialogJson.value = reader.result as string
      dataDialogError.value = ''
    }
    reader.readAsText(file)
  }
  input.click()
}

function handleQuickImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (store.selectedComponent) {
          store.selectedComponent.propValue = parsed
          store.recordSnapshot()
          ElMessage.success('数据已导入')
        }
      } catch {
        ElMessage.error('JSON 格式错误')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

function updateProp(key: string, val: any) {
  if (store.selectedComponent) {
    ;(store.selectedComponent as any)[key] = val
    recordAfterChange()
  }
}

function recordAfterChange() {
  nextTick(() => store.recordSnapshot())
}

// ========== 发布 ==========
function handlePublish() {
  store.publish()
  ElMessage.success('页面已发布到本地存储')
}

// ========== 快捷键 ==========
function onKeyDown(e: KeyboardEvent) {
  if (isPreview.value) return
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'Delete' || e.key === 'Backspace') store.deleteSelected()
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault()
    store.undo()
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
    e.preventDefault()
    store.redo()
  }
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    store.copySelected()
  }
}

onMounted(() => {
  store.loadPublished()
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.editor-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0e1a2b;
  color: #c0d0e0;
  overflow: hidden;
}
.toolbar {
  height: 52px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(14, 28, 48, 0.95), rgba(10, 20, 36, 0.98));
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 160, 255, 0.12);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(0, 160, 255, 0.06) inset;
  box-sizing: border-box;
  z-index: 100;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 6px;
}
.logo-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #00a0ff, #0066cc);
  box-shadow: 0 2px 8px rgba(0, 160, 255, 0.3);
}
.logo-title {
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(90deg, #00c6ff, #00a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}
.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 8px;
  background: linear-gradient(180deg, transparent, rgba(0, 160, 255, 0.25), transparent);
}

/* 统一工具栏按钮 */
.tb-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  background: rgba(0, 60, 120, 0.08);
  color: #8aacc8;
  transition: all 0.2s;
  box-shadow: none;
}
.tb-btn:hover:not(:disabled) {
  background: rgba(0, 100, 200, 0.18);
  color: #c0e0ff;
  border-color: rgba(0, 160, 255, 0.2);
}
.tb-btn:active:not(:disabled) {
  background: rgba(0, 100, 200, 0.28);
}
.tb-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.tb-btn-outline {
  border-color: rgba(0, 160, 255, 0.2);
  color: #6aadd8;
}
.tb-btn-outline:hover:not(:disabled) {
  border-color: rgba(0, 160, 255, 0.45);
  background: rgba(0, 100, 200, 0.15);
  color: #a0d4ff;
}
.tb-btn-primary {
  background: linear-gradient(135deg, rgba(0, 140, 255, 0.25), rgba(0, 100, 200, 0.2));
  border-color: rgba(0, 160, 255, 0.35);
  color: #80c8ff;
}
.tb-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 160, 255, 0.4), rgba(0, 120, 220, 0.3));
  border-color: rgba(0, 180, 255, 0.55);
  color: #b0e0ff;
  box-shadow: 0 0 12px rgba(0, 140, 255, 0.2);
}
.tb-btn-success {
  background: linear-gradient(135deg, rgba(0, 200, 120, 0.2), rgba(0, 160, 100, 0.15));
  border-color: rgba(0, 200, 120, 0.3);
  color: #6ad8a0;
}
.tb-btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 220, 140, 0.35), rgba(0, 180, 120, 0.25));
  border-color: rgba(0, 220, 140, 0.5);
  color: #a0f0c0;
  box-shadow: 0 0 12px rgba(0, 200, 120, 0.2);
}
.tb-btn-danger {
  color: #e07070;
}
.tb-btn-danger:hover:not(:disabled) {
  background: rgba(255, 60, 60, 0.12);
  border-color: rgba(255, 80, 80, 0.3);
  color: #ff9090;
}
.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.left-panel {
  width: 200px;
  min-width: 200px;
  background: #111d2e;
  border-right: 1px solid rgba(0, 160, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 14px 16px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #7a9ab8;
  border-bottom: 1px solid rgba(0, 160, 255, 0.08);
}
.component-list {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid rgba(0, 160, 255, 0.12);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 12px;
  color: #8a9ab0;
  background: rgba(0, 60, 120, 0.06);
}
.component-item:hover {
  border-color: rgba(0, 160, 255, 0.4);
  background: rgba(0, 60, 120, 0.15);
  color: #00a0ff;
}
.component-item:active {
  cursor: grabbing;
}
.component-icon {
  width: 28px;
  height: 28px;
}
.component-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
.canvas-wrapper {
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: radial-gradient(circle at 50% 0%, rgba(0, 100, 200, 0.06), transparent 60%), #0a1420;
}
.canvas-scroll {
  flex-shrink: 0;
  min-width: 100%;
  display: flex;
  justify-content: center;
}
.canvas {
  position: relative;
  border: 1px solid rgba(0, 160, 255, 0.2);
  box-shadow: 0 0 40px rgba(0, 80, 160, 0.12);
  background-image:
    linear-gradient(rgba(0, 160, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 160, 255, 0.04) 1px, transparent 1px);
  background-size: 20px 20px;
  min-width: fit-content;
}
.guide-line {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
}
.guide-v {
  width: 1px;
  background: #ff4d4f;
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.6);
}
.guide-h {
  height: 1px;
  background: #ff4d4f;
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.6);
}
.shape {
  position: absolute;
  border: 1px solid transparent;
  cursor: move;
  user-select: none;
  box-sizing: border-box;
}
.shape:hover {
  border-color: rgba(0, 160, 255, 0.25);
}
.shape.selected {
  border-color: #00a0ff;
  box-shadow: 0 0 0 1px rgba(0, 160, 255, 0.3);
}
.shape.locked {
  cursor: default;
  opacity: 0.75;
}
.shape-label {
  position: absolute;
  top: -26px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 120, 215, 0.9);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
  z-index: 10;
}
.shape-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  cursor: pointer;
}
.shape-actions .el-icon:hover {
  color: #ffd666;
}
.shape-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.shape-content :deep(.dv-border-box-content) {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
}
.handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1.5px solid #00a0ff;
  border-radius: 1px;
  z-index: 10;
}
.handle-tl {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.handle-tm {
  top: -4px;
  left: calc(50% - 4px);
  cursor: n-resize;
}
.handle-tr {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}
.handle-ml {
  top: calc(50% - 4px);
  left: -4px;
  cursor: w-resize;
}
.handle-mr {
  top: calc(50% - 4px);
  right: -4px;
  cursor: e-resize;
}
.handle-bl {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
.handle-bm {
  bottom: -4px;
  left: calc(50% - 4px);
  cursor: s-resize;
}
.handle-br {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}
.right-panel {
  width: 280px;
  min-width: 280px;
  background: #111d2e;
  border-left: 1px solid rgba(0, 160, 255, 0.1);
  overflow-y: auto;
  padding-bottom: 24px;
}
.border-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.border-option {
  padding: 6px 4px;
  text-align: center;
  font-size: 11px;
  color: #6a8aa0;
  background: rgba(0, 60, 120, 0.08);
  border: 1px solid rgba(0, 160, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.border-option:hover {
  border-color: rgba(0, 160, 255, 0.4);
  color: #00a0ff;
}
.border-option.active {
  border-color: #00a0ff;
  background: rgba(0, 100, 200, 0.2);
  color: #00a0ff;
  font-weight: 600;
}
.right-panel-empty {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #3a5a7a;
  font-size: 13px;
}
.prop-section {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 160, 255, 0.06);
}
.prop-section-title {
  font-size: 12px;
  color: #7a9ab8;
  margin-bottom: 10px;
  font-weight: 600;
}
.prop-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.prop-row:last-child {
  margin-bottom: 0;
}
.prop-row label {
  width: 42px;
  flex-shrink: 0;
  font-size: 12px;
  color: #6a8aa0;
}
.prop-row :deep(.el-input-number) {
  flex: 1;
}
.prop-row :deep(.el-select) {
  flex: 1;
}
.preview-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.preview-toolbar {
  height: 52px;
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(14, 28, 48, 0.95), rgba(10, 20, 36, 0.98));
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 160, 255, 0.12);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
}
.preview-wrapper {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #0a1420;
}
.preview-canvas {
  position: relative;
  flex-shrink: 0;
  border: 1px solid rgba(0, 160, 255, 0.15);
  box-shadow: 0 0 60px rgba(0, 80, 160, 0.15);
}
.data-dialog :deep(.el-dialog) {
  background: #0e1a2b;
  border: 1px solid rgba(0, 160, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 0 60px rgba(0, 60, 120, 0.4);
}
.data-dialog :deep(.el-dialog__header) {
  padding: 14px 20px 0;
  margin-right: 0;
}
.data-dialog :deep(.el-dialog__body) {
  padding: 16px 20px 20px;
}
.data-textarea :deep(.el-textarea__inner) {
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 160, 255, 0.15);
  color: #c0d0e0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 6px;
}
.data-textarea :deep(.el-textarea__inner:focus) {
  border-color: rgba(0, 160, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(0, 160, 255, 0.2);
}
</style>
