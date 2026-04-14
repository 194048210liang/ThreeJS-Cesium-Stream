<template>
  <div class="zujian-page">
    <div class="page-grid">
      <!-- 左列 -->
      <div class="col col-left">
        <BorderCard title="数字滚动 CountUp">
          <div class="demo-count">
            <div class="count-item" v-for="item in countList" :key="item.label">
              <CountUp
                :value="item.value"
                :suffix="item.suffix"
                :decimals="item.decimals"
                :color="item.color"
                :fontSize="item.fontSize"
              />
              <span class="count-label">{{ item.label }}</span>
            </div>
          </div>
          <div class="demo-actions">
            <button class="sci-btn" @click="refreshCounts">刷新数据</button>
          </div>
        </BorderCard>

        <BorderCard title="搜索框 SearchBox">
          <div class="demo-search">
            <SearchBox v-model="searchVal" placeholder="搜索设备/节点..." @search="onSearch" />
            <p v-if="searchResult" class="search-result">搜索: {{ searchResult }}</p>
          </div>
        </BorderCard>

        <BorderCard title="弹窗 DialogBox">
          <div class="demo-btn-row">
            <button class="sci-btn primary" @click="dialogVisible = true">打开弹窗</button>
          </div>
        </BorderCard>
      </div>

      <!-- 中列 -->
      <div class="col col-center">
        <BorderCard title="进度条 ProgressBar">
          <div class="demo-progress">
            <ProgressBar label="CPU 使用率" :percent="progressData.cpu" color="#00d4ff" />
            <ProgressBar label="内存占用" :percent="progressData.mem" color="#00ff88" colorEnd="#006644" />
            <ProgressBar label="磁盘 IO" :percent="progressData.disk" color="#ffaa00" colorEnd="#884400" />
            <ProgressBar label="网络带宽" :percent="progressData.net" color="#6ab4ff" colorEnd="#2a4e88" />
          </div>
          <div class="demo-actions">
            <button class="sci-btn" @click="refreshProgress">模拟刷新</button>
          </div>
        </BorderCard>

        <BorderCard title="状态标签 StatusTag">
          <div class="demo-tags">
            <StatusTag text="运行中" type="success" />
            <StatusTag text="告警" type="warning" />
            <StatusTag text="故障" type="danger" />
            <StatusTag text="离线" type="info" />
            <StatusTag text="备用" type="primary" />
            <StatusTag text="无圆点" type="primary" :show-dot="false" />
          </div>
        </BorderCard>

        <BorderCard title="综合使用">
          <div class="demo-mix">
            <div class="mix-item" v-for="item in deviceList" :key="item.name">
              <div class="mix-header">
                <span class="mix-name">{{ item.name }}</span>
                <StatusTag :text="item.status" :type="item.type" />
              </div>
              <ProgressBar :label="'负载'" :percent="item.load" :color="item.barColor" />
              <CountUp :value="item.count" suffix=" req/s" :fontSize="'14px'" :color="item.barColor" />
            </div>
          </div>
        </BorderCard>
      </div>

      <!-- 右列 -->
      <div class="col col-right">
        <BorderCard title="计数器动画">
          <div class="demo-counter">
            <CountUp :value="counterVal" :fontSize="'48px'" color="#00f0ff" />
            <div class="counter-btns">
              <button class="sci-btn sm" @click="counterVal -= 5">-5</button>
              <button class="sci-btn sm" @click="counterVal = 0">归零</button>
              <button class="sci-btn sm primary" @click="counterVal += 5">+5</button>
            </div>
          </div>
        </BorderCard>

        <BorderCard title="标签组合">
          <div class="demo-tag-group">
            <div class="tag-row">
              <span class="row-label">服务器:</span>
              <StatusTag text="A-01 正常" type="success" />
              <StatusTag text="A-02 告警" type="warning" />
            </div>
            <div class="tag-row">
              <span class="row-label">网关:</span>
              <StatusTag text="GW-1 运行" type="primary" />
              <StatusTag text="GW-2 断连" type="danger" />
              <StatusTag text="GW-3 维护" type="info" />
            </div>
            <div class="tag-row">
              <span class="row-label">任务:</span>
              <StatusTag text="部署中" type="primary" :show-dot="false" />
              <StatusTag text="已完成" type="success" :show-dot="false" />
            </div>
          </div>
        </BorderCard>
      </div>
    </div>

    <!-- 弹窗 -->
    <DialogBox
      v-model="dialogVisible"
      title="系统提示"
      @confirm="dialogVisible = false"
      @cancel="dialogVisible = false"
      @handleClose="dialogVisible = false"
    >
      <p style="color: #b0d0ff; line-height: 1.8;">
        这是一个科技风格弹窗组件示例。<br>
        支持确认、取消、关闭三种操作方式。<br>
        适用于数据可视化大屏场景。
      </p>
    </DialogBox>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CountUp from '@/components/CountUp.vue'
import BorderCard from '@/components/BorderCard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import SearchBox from '@/components/SearchBox.vue'
import DialogBox from '@/components/DialogBox.vue'

// ===== CountUp =====
const countList = reactive([
  { label: '在线设备', value: 12863, suffix: ' 台', decimals: 0, color: '#00f0ff', fontSize: '28px' },
  { label: '今日请求', value: 894562, suffix: '', decimals: 0, color: '#00ff88', fontSize: '24px' },
  { label: '成功率', value: 99.87, suffix: '%', decimals: 2, color: '#6ab4ff', fontSize: '22px' },
  { label: '延迟', value: 23, suffix: ' ms', decimals: 0, color: '#ffaa00', fontSize: '22px' },
])

function refreshCounts() {
  countList[0].value = Math.floor(Math.random() * 5000) + 10000
  countList[1].value = Math.floor(Math.random() * 500000) + 600000
  countList[2].value = +(97 + Math.random() * 2.9).toFixed(2)
  countList[3].value = Math.floor(Math.random() * 80) + 10
}

// ===== SearchBox =====
const searchVal = ref('')
const searchResult = ref('')
function onSearch(val: string) {
  searchResult.value = val || '（空关键词）'
}

// ===== ProgressBar =====
const progressData = reactive({
  cpu: 67,
  mem: 82,
  disk: 45,
  net: 58,
})
function refreshProgress() {
  progressData.cpu = Math.floor(Math.random() * 60) + 30
  progressData.mem = Math.floor(Math.random() * 40) + 55
  progressData.disk = Math.floor(Math.random() * 50) + 20
  progressData.net = Math.floor(Math.random() * 70) + 20
}

// ===== Counter =====
const counterVal = ref(42)

// ===== Dialog =====
const dialogVisible = ref(false)

// ===== 综合示例 =====
const deviceList = reactive([
  { name: '主数据库', status: '正常', type: 'success' as const, load: 72, count: 3200, barColor: '#00ff88' },
  { name: '缓存服务', status: '告警', type: 'warning' as const, load: 89, count: 8900, barColor: '#ffaa00' },
  { name: '日志采集', status: '运行', type: 'primary' as const, load: 45, count: 1200, barColor: '#00d4ff' },
])
</script>

<style lang="scss" scoped>
.zujian-page {
  width: 100%;
  height: 100%;
  background: #040818;
  padding: 20px;
  overflow-y: auto;
  color: #b0d0ff;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ===== Demo 布局 =====
.demo-count {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.count-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.count-label {
  font-size: 11px;
  color: #5a8abf;
  letter-spacing: 0.5px;
}

.demo-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.demo-btn-row {
  display: flex;
  gap: 8px;
}

.demo-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result {
  font-size: 12px;
  color: #5a8abf;
  padding-left: 4px;
}

.demo-progress {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// ===== 科技按钮 =====
.sci-btn {
  padding: 7px 20px;
  background: rgba(0, 100, 200, 0.15);
  border: 1px solid rgba(0, 160, 255, 0.25);
  border-radius: 4px;
  color: #00d4ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;

  &:hover {
    background: rgba(0, 140, 255, 0.25);
    box-shadow: 0 0 10px rgba(0, 180, 255, 0.15);
  }

  &.primary {
    background: linear-gradient(135deg, rgba(0, 160, 255, 0.25), rgba(0, 80, 200, 0.35));
    border-color: rgba(0, 200, 255, 0.35);
  }

  &.sm {
    padding: 5px 14px;
    font-size: 12px;
  }
}

// ===== Counter =====
.demo-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.counter-btns {
  display: flex;
  gap: 8px;
}

// ===== Tag Group =====
.demo-tag-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.row-label {
  font-size: 12px;
  color: #5a8abf;
  min-width: 50px;
}

// ===== 综合示例 =====
.demo-mix {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mix-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 160, 255, 0.08);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.mix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mix-name {
  font-size: 13px;
  color: #a0c8f0;
  font-weight: 500;
}

// ===== 响应式 =====
@media (max-width: 1100px) {
  .page-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}
</style>
