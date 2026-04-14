<template>
  <div class="header">
    <div class="header-bg"></div>
    <div class="header-inner">
      <div class="title-wrap" @click="goHome">
        <div class="wing wing-l">
          <svg viewBox="0 0 200 12" class="wing-svg">
            <defs>
              <linearGradient id="wgL" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="transparent" />
                <stop offset="50%" stop-color="#00d4ff" stop-opacity="0.7" />
                <stop offset="100%" stop-color="#00d4ff" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="6" x2="200" y2="6" stroke="url(#wgL)" stroke-width="1" />
          </svg>
        </div>
        <div class="title-block">
          <div class="title-bg"></div>
          <h1 class="title">
            <span class="char" v-for="(c, i) in (title || '可视化平台')" :key="i" :style="{ animationDelay: i * 0.06 + 's' }">{{ c }}</span>
          </h1>
          <div class="title-scan"></div>
        </div>
        <div class="wing wing-r">
          <svg viewBox="0 0 200 12" class="wing-svg">
            <defs>
              <linearGradient id="wgR" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00d4ff" stop-opacity="0" />
                <stop offset="50%" stop-color="#00d4ff" stop-opacity="0.7" />
                <stop offset="100%" stop-color="transparent" />
              </linearGradient>
            </defs>
            <line x1="0" y1="6" x2="200" y2="6" stroke="url(#wgR)" stroke-width="1" />
          </svg>
        </div>
      </div>
      <span class="clock">{{ time }}</span>
    </div>
    <div class="border-line">
      <div class="border-scan"></div>
    </div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
defineProps<{ title?: string; subtitle?: string }>()

const goHome = () => router.push('/')

const time = ref('')
let timer: ReturnType<typeof setInterval>
const tick = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  time.value = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<style lang="scss" scoped>
.header {
  height: 64px;
  background: #040818;
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  overflow: hidden;
}

// 背景微光
.header-bg {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(0, 100, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 0 40px;
}

// ====== 标题组合 ======
.title-wrap {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.wing {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &-svg {
    width: 120px;
    height: 12px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 0 4px rgba(0, 180, 255, 0.3));
  }
}

.title-wrap:hover .wing-svg {
  width: 180px;
}

.title-block {
  position: relative;
  padding: 4px 16px;
  overflow: hidden;
}

.title-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 80, 200, 0.08) 0%, transparent 100%);
  border-left: 1px solid rgba(0, 160, 255, 0.15);
  border-right: 1px solid rgba(0, 160, 255, 0.15);
}

.title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 10px;
  display: flex;
  position: relative;
  z-index: 1;

  .char {
    background: linear-gradient(180deg, #ffffff 5%, #a0d8ff 40%, #0088ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charGlow 3s ease-in-out infinite;
  }
}

@keyframes charGlow {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
  50% { filter: brightness(1.2) drop-shadow(0 0 8px rgba(0, 140, 255, 0.3)); }
}

// 扫光
.title-scan {
  position: absolute;
  top: 0;
  left: -40px;
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.4), transparent);
  z-index: 0;
  animation: scan 3.5s ease-in-out infinite;
}

@keyframes scan {
  0% { left: -40px; opacity: 0; }
  8% { opacity: 1; }
  92% { opacity: 0.4; }
  100% { left: calc(100% + 40px); opacity: 0; }
}

// ====== 时钟 ======
.clock {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'DIN', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 180, 255, 0.7);
  letter-spacing: 1.5px;
  text-shadow: 0 0 8px rgba(0, 160, 255, 0.3);
}

// ====== 底部光带 ======
.border-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 120, 255, 0.3) 20%,
    rgba(0, 180, 255, 0.6) 50%,
    rgba(0, 120, 255, 0.3) 80%,
    transparent 100%
  );
  overflow: hidden;
}

.border-scan {
  position: absolute;
  top: -1px;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  animation: borderScan 3s linear infinite;
}

@keyframes borderScan {
  0% { left: -60px; }
  100% { left: 100%; }
}

// ====== 四角装饰 ======
.corner {
  position: absolute;
  width: 10px;
  height: 10px;
  z-index: 3;

  &.tl { top: 4px; left: 4px; border-top: 1px solid rgba(0, 160, 255, 0.3); border-left: 1px solid rgba(0, 160, 255, 0.3); }
  &.tr { top: 4px; right: 4px; border-top: 1px solid rgba(0, 160, 255, 0.3); border-right: 1px solid rgba(0, 160, 255, 0.3); }
  &.bl { bottom: 4px; left: 4px; border-bottom: 1px solid rgba(0, 160, 255, 0.3); border-left: 1px solid rgba(0, 160, 255, 0.3); }
  &.br { bottom: 4px; right: 4px; border-bottom: 1px solid rgba(0, 160, 255, 0.3); border-right: 1px solid rgba(0, 160, 255, 0.3); }
}
</style>
