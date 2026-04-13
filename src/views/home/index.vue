<template>
    <div class="container">
        <div class="background-glow"></div>
        <div class="content">
            <h1 class="title">可视化开发平台</h1>
            <div class="grid">
                <div class="card" v-for="item in iconList" :key="item.path" @click="router.push(item.path)">
                    <div class="card-icon">{{ item.icon }}</div>
                    <div class="card-title">{{ item.title }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';    //     import { useRoute } from 'vue-router';

const router = useRouter()
const iconList = ref([
    {
        icon: '🌍',
        title: 'Cesium专区',
        path: '/cesium'
    },
    {
        icon: '🎮',
        title: 'Threejs专区',
        path: '/threejs'
    },
    {
        icon: '🧩',
        title: '组件专区',
        path: '/components'
    },
    {
        icon: '📡',
        title: '通信专业',
        path: '/communication'
    },
    {
        icon: '🔌',
        title: 'WebSocket专区',
        path: '/websocket'
    },
    {
        icon: '🎨',
        title: 'Konva专区',
        path: '/konva'
    },
    // 其他图标
])

</script>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d142d 100%);
    position: relative;
}

.background-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(0, 112, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0, 200, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 20%, rgba(0, 150, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
}

.content {
    position: relative;
    z-index: 1;
    text-align: center;
}

.title {
    font-size: 48px;
    font-weight: 700;
    background: linear-gradient(90deg, #00d4ff, #0099ff, #0066ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 60px;
    text-shadow: 0 0 30px rgba(0, 150, 255, 0.5);
    letter-spacing: 4px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    max-width: 900px;
}

.card {
    width: 240px;
    height: 200px;
    border-radius: 8px;
    background: linear-gradient(145deg, rgba(20, 30, 60, 0.8), rgba(10, 15, 35, 0.9));
    border: 1px solid rgba(0, 150, 255, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 150, 255, 0.1), transparent);
        transition: left 0.5s;
    }

    &:hover {
        transform: translateY(-10px) scale(1.05);
        border-color: rgba(0, 200, 255, 0.8);
        box-shadow: 0 20px 40px rgba(0, 100, 255, 0.3),
            0 0 30px rgba(0, 150, 255, 0.2),
            inset 0 0 30px rgba(0, 100, 255, 0.1);

        &::before {
            left: 100%;
        }
    }
}

.card-icon {
    font-size: 48px;
    margin-bottom: 15px;
    filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.5));
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #00d4ff;
    text-shadow: 0 0 10px rgba(0, 150, 255, 0.5);
    letter-spacing: 1px;
}
</style>