<template>
  <div class="not-found">
    <!-- 网格背景 -->
    <div class="grid-bg"></div>
    <!-- 光晕 -->
    <div class="glow"></div>

    <div class="content">
      <!-- 故障风 404 -->
      <div class="code-wrap">
        <span class="code">404</span>
        <span class="code code-ghost" aria-hidden="true">404</span>
        <span class="code code-scan"></span>
      </div>

      <p class="title">PAGE NOT FOUND</p>
      <p class="desc">您访问的页面不存在或已被移除</p>

      <div class="actions">
        <button class="btn primary" @click="router.push('/')">返回首页</button>
        <button class="btn" @click="router.back()">返回上一页</button>
      </div>

      <!-- 错误编码 -->
      <div class="error-meta">
        <span class="meta-label">ERROR CODE</span>
        <span class="meta-value">{{ errorHash }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 生成伪错误码，增加科技感
const errorHash = ref('')
onMounted(() => {
  const chars = 'ABCDEF0123456789'
  errorHash.value = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
})
</script>

<style scoped lang="scss">
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #040818;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

// 网格
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 100, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 100, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 100%);
}

// 光晕
.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0, 60, 180, 0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
}

// ====== 404 数字 ======
.code-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.code {
  font-size: 140px;
  font-weight: 900;
  letter-spacing: 16px;
  background: linear-gradient(180deg, #ffffff 10%, #0099ff 60%, #004488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
  user-select: none;
  line-height: 1;
}

// 故障影
.code-ghost {
  position: absolute;
  top: 0;
  left: 3px;
  z-index: 0;
  background: linear-gradient(180deg, rgba(0, 255, 136, 0.6) 20%, transparent 80%);
  -webkit-background-clip: text;
  background-clip: text;
  animation: glitch1 3s infinite;
}

.code-scan {
  position: absolute;
  top: 0;
  left: -3px;
  z-index: 0;
  background: linear-gradient(180deg, rgba(255, 60, 60, 0.5) 30%, transparent 80%);
  -webkit-background-clip: text;
  background-clip: text;
  animation: glitch2 3s infinite;
}

@keyframes glitch1 {
  0%, 92%, 100% { opacity: 0; transform: translate(0); }
  93% { opacity: 0.7; transform: translate(-4px, 2px); }
  95% { opacity: 0; }
  96% { opacity: 0.5; transform: translate(3px, -1px); }
  98% { opacity: 0; }
}

@keyframes glitch2 {
  0%, 90%, 100% { opacity: 0; transform: translate(0); }
  91% { opacity: 0.5; transform: translate(4px, -2px); }
  93% { opacity: 0; }
  94% { opacity: 0.6; transform: translate(-3px, 1px); }
  96% { opacity: 0; }
}

// ====== 文字 ======
.title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 8px;
  color: rgba(180, 210, 255, 0.6);
  margin: 0 0 10px;
}

.desc {
  font-size: 13px;
  color: rgba(100, 160, 255, 0.35);
  letter-spacing: 1px;
  margin: 0 0 40px;
}

// ====== 按钮 ======
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 60px;
}

.btn {
  padding: 10px 32px;
  border: 1px solid rgba(0, 140, 255, 0.25);
  border-radius: 4px;
  background: rgba(0, 80, 200, 0.08);
  color: rgba(160, 200, 255, 0.8);
  font-size: 13px;
  font-family: inherit;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;

  &.primary {
    background: linear-gradient(135deg, rgba(0, 120, 255, 0.2), rgba(0, 60, 180, 0.3));
    border-color: rgba(0, 160, 255, 0.4);
    color: #b8dcff;
    box-shadow: 0 0 20px rgba(0, 100, 255, 0.1);
  }

  &:hover {
    border-color: rgba(0, 180, 255, 0.5);
    background: rgba(0, 120, 255, 0.15);
    color: #d0e8ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0, 100, 255, 0.15);
  }
}

// ====== 底部元信息 ======
.error-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.meta-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(80, 140, 220, 0.25);
}

.meta-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(0, 160, 255, 0.35);
}

// ====== 响应式 ======
@media (max-width: 600px) {
  .code {
    font-size: 80px;
    letter-spacing: 8px;
  }
  .title {
    font-size: 14px;
    letter-spacing: 5px;
  }
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
