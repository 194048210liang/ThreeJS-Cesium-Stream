import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type ComponentType = 'text' | 'image' | 'table' | 'bar-chart' | 'column-chart' | 'pie-chart' | 'line-chart'

export type BorderType = '' | 'border1' | 'border2' | 'border3' | 'border4' | 'border5' | 'border6' | 'border7' | 'border8' | 'border9' | 'border10' | 'border11' | 'border12' | 'border13'

export interface IComponent {
  id: string
  type: ComponentType
  label: string
  x: number
  y: number
  w: number
  h: number
  propValue: any
  locked: boolean
  borderType: BorderType
}

export interface ICanvasStyle {
  width: number
  height: number
  bg: string
}

const STORAGE_KEY = 'editor-page-data'
const MAX_SNAPSHOT = 50

let _id = 0
function genId() {
  return 'c_' + Date.now() + '_' + (++_id)
}

// 组件默认尺寸（统一宽度 400，文字高度自适应不限制）
const defaultSize: Record<ComponentType, { w: number; h: number }> = {
  text: { w: 400, h: 40 },
  image: { w: 400, h: 240 },
  table: { w: 400, h: 250 },
  'bar-chart': { w: 400, h: 300 },
  'column-chart': { w: 400, h: 300 },
  'pie-chart': { w: 400, h: 300 },
  'line-chart': { w: 400, h: 300 },
}

// 组件默认边框
const defaultBorder: Record<ComponentType, BorderType> = {
  text: '',
  image: 'border1',
  table: 'border3',
  'bar-chart': 'border1',
  'column-chart': 'border4',
  'pie-chart': 'border8',
  'line-chart': 'border5',
}
const defaultProps: Record<ComponentType, any> = {
  text: { content: '双击编辑文字内容', fontSize: 16, color: '#e0e6ed', align: 'left', bold: false },
  image: { url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg', fit: 'cover' },
  table: {
    headers: ['姓名', '年龄', '城市'],
    rows: [
      ['张三', '25', '北京'],
      ['李四', '30', '上海'],
      ['王五', '28', '广州'],
    ],
  },
  'bar-chart': [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 },
    { name: '产品C', value: 180 },
    { name: '产品D', value: 290 },
  ],
  'column-chart': [
    { name: '1月', value: 150 },
    { name: '2月', value: 230 },
    { name: '3月', value: 180 },
    { name: '4月', value: 310 },
    { name: '5月', value: 270 },
  ],
  'pie-chart': [
    { name: '直接访问', value: 335 },
    { name: '邮件营销', value: 310 },
    { name: '联盟广告', value: 234 },
    { name: '视频广告', value: 135 },
  ],
  'line-chart': [
    { name: '周一', value: 820 },
    { name: '周二', value: 932 },
    { name: '周三', value: 901 },
    { name: '周四', value: 1290 },
    { name: '周五', value: 1330 },
    { name: '周六', value: 1520 },
  ],
}

const defaultLabel: Record<ComponentType, string> = {
  text: '文字',
  image: '图片',
  table: '表格',
  'bar-chart': '条形图',
  'column-chart': '柱状图',
  'pie-chart': '饼图',
  'line-chart': '折线图',
}

export const useEditorStore = defineStore('editor', () => {
  // 画布样式
  const canvasStyle = ref<ICanvasStyle>({
    width: 1920,
    height: 1080,
    bg: '#0a1628',
  })

  // 组件列表
  const components = ref<IComponent[]>([])

  // 当前选中组件ID
  const selectedId = ref<string | null>(null)

  // 当前选中组件
  const selectedComponent = computed(() =>
    components.value.find((c) => c.id === selectedId.value) || null,
  )

  // 撤销/重做快照栈
  const snapshots = ref<string[]>([])
  const snapshotIndex = ref(-1)

  // 记录快照
  function recordSnapshot() {
    const data = JSON.stringify(components.value)
    // 截断当前位置之后的快照
    snapshots.value = snapshots.value.slice(0, snapshotIndex.value + 1)
    snapshots.value.push(data)
    if (snapshots.value.length > MAX_SNAPSHOT) {
      snapshots.value.shift()
    }
    snapshotIndex.value = snapshots.value.length - 1
  }

  // 撤销
  function undo() {
    if (snapshotIndex.value <= 0) return
    snapshotIndex.value--
    components.value = JSON.parse(snapshots.value[snapshotIndex.value]!)
  }

  // 重做
  function redo() {
    if (snapshotIndex.value >= snapshots.value.length - 1) return
    snapshotIndex.value++
    components.value = JSON.parse(snapshots.value[snapshotIndex.value]!)
  }

  // 添加组件
  function addComponent(type: ComponentType, x = 100, y = 100) {
    const size = defaultSize[type]
    const comp: IComponent = {
      id: genId(),
      type,
      label: defaultLabel[type],
      x,
      y,
      w: size.w,
      h: size.h,
      propValue: JSON.parse(JSON.stringify(defaultProps[type])),
      locked: false,
      borderType: defaultBorder[type],
    }
    components.value.push(comp)
    selectedId.value = comp.id
    recordSnapshot()
    return comp
  }

  // 删除选中组件
  function deleteSelected() {
    if (!selectedId.value) return
    const idx = components.value.findIndex((c) => c.id === selectedId.value)
    if (idx === -1) return
    components.value.splice(idx, 1)
    selectedId.value = null
    recordSnapshot()
  }

  // 更新组件
  function updateComponent(id: string, updates: Partial<IComponent>) {
    const comp = components.value.find((c) => c.id === id)
    if (!comp) return
    Object.assign(comp, updates)
  }

  // 上移层级
  function moveUp(id: string) {
    const idx = components.value.findIndex((c) => c.id === id)
    if (idx < 0 || idx >= components.value.length - 1) return
    ;[components.value[idx]!, components.value[idx + 1]!] = [components.value[idx + 1]!, components.value[idx]!]
  }

  // 下移层级
  function moveDown(id: string) {
    const idx = components.value.findIndex((c) => c.id === id)
    if (idx <= 0) return
    ;[components.value[idx]!, components.value[idx - 1]!] = [components.value[idx - 1]!, components.value[idx]!]
  }

  // 复制组件
  function copySelected() {
    if (!selectedComponent.value) return
    const src = selectedComponent.value
    const comp: IComponent = {
      ...JSON.parse(JSON.stringify(src)),
      id: genId(),
      x: src.x + 20,
      y: src.y + 20,
    }
    components.value.push(comp)
    selectedId.value = comp.id
    recordSnapshot()
  }

  // 锁定/解锁
  function toggleLock(id: string) {
    const comp = components.value.find((c) => c.id === id)
    if (comp) comp.locked = !comp.locked
  }

  // 发布到 localStorage
  function publish() {
    const data = {
      canvasStyle: canvasStyle.value,
      components: components.value,
      publishTime: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // 加载已发布数据
  function loadPublished(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    try {
      const data = JSON.parse(raw)
      canvasStyle.value = data.canvasStyle || canvasStyle.value
      // 兼容旧数据：text 类型的 propValue 如果是字符串，转为对象
      const comps: IComponent[] = data.components || []
      for (const c of comps) {
        if (c.type === 'text' && typeof c.propValue === 'string') {
          c.propValue = { content: c.propValue, fontSize: 16, color: '#e0e6ed', align: 'left', bold: false }
        }
        if (c.type === 'image' && typeof c.propValue === 'string') {
          c.propValue = { url: c.propValue, fit: 'cover' }
        }
        // 兼容旧数据：无 borderType 字段
        if (!c.borderType) c.borderType = defaultBorder[c.type] || ''
      }
      components.value = comps
      selectedId.value = null
      recordSnapshot()
      return true
    } catch {
      return false
    }
  }

  // 清空画布
  function clearCanvas() {
    components.value = []
    selectedId.value = null
    recordSnapshot()
  }

  return {
    canvasStyle,
    components,
    selectedId,
    selectedComponent,
    recordSnapshot,
    undo,
    redo,
    addComponent,
    deleteSelected,
    updateComponent,
    moveUp,
    moveDown,
    copySelected,
    toggleLock,
    publish,
    loadPublished,
    clearCanvas,
  }
})
