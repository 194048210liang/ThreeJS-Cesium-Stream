<template>
  <div class="home">
    <!-- 动态粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 顶部光晕 -->
    <div class="glow-top"></div>
    <div class="glow-bottom"></div>

    <!-- 网格线背景 -->
    <div class="grid-bg"></div>

    <!-- 内容 -->
    <div class="content">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <div class="hex-logo">
          <svg viewBox="0 0 100 100" width="56" height="56">
            <polygon
              points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
              fill="none"
              stroke="url(#logoGrad)"
              stroke-width="2"
            />
            <polygon
              points="50,18 78,33 78,67 50,82 22,67 22,33"
              fill="none"
              stroke="url(#logoGrad2)"
              stroke-width="1"
              opacity="0.5"
            />
            <circle cx="50" cy="50" r="8" fill="url(#logoCenter)" />
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00d4ff" />
                <stop offset="100%" stop-color="#0066ff" />
              </linearGradient>
              <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0088ff" />
                <stop offset="100%" stop-color="#0044cc" />
              </linearGradient>
              <radialGradient id="logoCenter">
                <stop offset="0%" stop-color="#00d4ff" />
                <stop offset="100%" stop-color="#0066ff" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        <h1 class="title">
          <span class="title-line">VISUAL</span>
          <span class="title-line accent">DEVELOPMENT</span>
          <span class="title-line">PLATFORM</span>
        </h1>
        <p class="subtitle">可视化开发平台 / GIS + 3D + Data Visualization</p>
      </div>

      <!-- 卡片导航 -->
      <div class="nav-grid">
        <div
          class="nav-card"
          v-for="(item, index) in navItems"
          :key="item.path"
          :style="{ '--delay': index * 0.08 + 's' }"
          @click="router.push(item.path)"
        >
          <div class="card-corner tl"></div>
          <div class="card-corner tr"></div>
          <div class="card-corner bl"></div>
          <div class="card-corner br"></div>
          <div class="card-glow"></div>
          <div class="card-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="item.svg"
            ></svg>
          </div>
          <div class="card-info">
            <span class="card-title">{{ item.title }}</span>
            <span class="card-desc">{{ item.desc }}</span>
          </div>
          <div class="card-arrow">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer-info">
        <span class="dot-pulse"></span>
        <span>System Online</span>
        <span class="divider">|</span>
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const particleCanvas = ref<HTMLCanvasElement | null>(null)
const currentTime = ref('')
let animFrame = 0
let timer = 0

const navItems = ref([
  {
    title: '三维地理信息',
    desc: 'Cesium 三维地球与空间分析',
    path: '/cesium',
    svg: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  },
  {
    title: '三维渲染引擎',
    desc: 'Three.js WebGL 模型渲染与交互',
    path: '/threejs',
    svg: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  },
  {
    title: '数据可视化组件',
    desc: '科技风通用组件库与图表',
    path: '/components',
    svg: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  },
  {
    title: '访客分析中心',
    desc: '站点流量统计与用户画像',
    path: '/communication',
    svg: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  },
  {
    title: '民航数据监控',
    desc: '航班态势感知与实时大屏',
    path: '/websocket',
    svg: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  },
  {
    title: '低代码编辑器',
    desc: '可视化拖拽式大屏搭建',
    path: '/konva',
    svg: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  },
])

// 时钟
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// 粒子背景
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] =
    []
  const count = 80

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0, 160, 255, ${p.alpha})`
      ctx.fill()
    })

    // 连线（用距离平方避免 Math.sqrt）
    const maxDist = 120
    const maxDist2 = maxDist * maxDist
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist2 = dx * dx + dy * dy
        if (dist2 < maxDist2) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(0, 140, 255, ${0.15 * (1 - dist2 / maxDist2)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animFrame = requestAnimationFrame(animate)
  }

  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animFrame)
    window.removeEventListener('resize', resize)
  })
}

onMounted(() => {
  initParticles()
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #040818;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

// 粒子画布
.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

// 光晕
.glow-top {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 500px;
  background: radial-gradient(ellipse, rgba(0, 100, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.glow-bottom {
  position: absolute;
  bottom: -150px;
  left: 30%;
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0, 180, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

// 网格背景
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 100, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 100, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%);
}

// 内容
.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 20px;
}

// Logo 区域
.logo-area {
  margin-bottom: 56px;
}

.hex-logo {
  display: inline-flex;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(0, 120, 255, 0.4));
  animation: float 4s ease-in-out infinite;

  svg polygon {
    animation: hexSpin 20s linear infinite;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes hexSpin {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 600;
  }
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0;
  line-height: 1.1;
}

.title-line {
  font-size: 36px;
  font-weight: 200;
  letter-spacing: 12px;
  color: rgba(180, 210, 255, 0.6);
  text-transform: uppercase;

  &.accent {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: 16px;
    background: linear-gradient(135deg, #00d4ff 0%, #0088ff 50%, #0055cc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(0, 120, 255, 0.3));
  }
}

.subtitle {
  margin-top: 16px;
  font-size: 13px;
  letter-spacing: 3px;
  color: rgba(100, 160, 255, 0.45);
  font-weight: 300;
}

// 导航网格
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 780px;
  margin: 0 auto;
}

// 导航卡片
.nav-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(6, 14, 40, 0.85), rgba(4, 10, 30, 0.95));
  border: 1px solid rgba(0, 100, 255, 0.12);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  animation: cardIn 0.6s ease backwards;
  animation-delay: var(--delay);

  // 四角装饰
  .card-corner {
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: rgba(0, 160, 255, 0.3);
    border-style: solid;
    transition: border-color 0.3s;

    &.tl {
      top: 0;
      left: 0;
      border-width: 1px 0 0 1px;
    }
    &.tr {
      top: 0;
      right: 0;
      border-width: 1px 1px 0 0;
    }
    &.bl {
      bottom: 0;
      left: 0;
      border-width: 0 0 1px 1px;
    }
    &.br {
      bottom: 0;
      right: 0;
      border-width: 0 1px 1px 0;
    }
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 120, 255, 0.06), transparent);
    transition: left 0.5s;
  }

  .card-icon-wrap {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(0, 80, 200, 0.1);
    border: 1px solid rgba(0, 120, 255, 0.15);
    color: #0099ff;
    transition: all 0.3s;
  }

  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-align: left;
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #c8deff;
    letter-spacing: 1px;
    transition: color 0.3s;
  }

  .card-desc {
    font-size: 11px;
    color: rgba(100, 150, 220, 0.5);
    font-weight: 300;
  }

  .card-arrow {
    flex-shrink: 0;
    color: rgba(0, 120, 255, 0.3);
    transition: all 0.3s;
    transform: translateX(0);
  }

  &:hover {
    border-color: rgba(0, 160, 255, 0.4);
    background: linear-gradient(135deg, rgba(8, 20, 55, 0.9), rgba(4, 12, 38, 0.98));
    transform: translateY(-2px);
    box-shadow:
      0 8px 30px rgba(0, 80, 200, 0.15),
      inset 0 0 40px rgba(0, 60, 180, 0.05);

    .card-corner {
      border-color: rgba(0, 180, 255, 0.6);
    }

    .card-glow {
      left: 100%;
    }

    .card-icon-wrap {
      background: rgba(0, 100, 255, 0.2);
      border-color: rgba(0, 150, 255, 0.4);
      color: #00bbff;
      box-shadow: 0 0 15px rgba(0, 100, 255, 0.2);
    }

    .card-title {
      color: #00ccff;
    }

    .card-arrow {
      color: #0099ff;
      transform: translateX(4px);
    }
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 底部
.footer-info {
  margin-top: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(80, 140, 220, 0.4);
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;

  .divider {
    color: rgba(80, 140, 220, 0.2);
  }
}

.dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0099ff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
    box-shadow: 0 0 4px rgba(0, 150, 255, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.6);
  }
}

// 响应式
@media (max-width: 840px) {
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .title-line {
    font-size: 28px;
    letter-spacing: 8px;
  }
  .title-line.accent {
    font-size: 38px;
    letter-spacing: 10px;
  }
}

@media (max-width: 520px) {
  .nav-grid {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
  .title-line {
    font-size: 22px;
    letter-spacing: 6px;
  }
  .title-line.accent {
    font-size: 30px;
    letter-spacing: 8px;
  }
}
</style>
