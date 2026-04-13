<template>
    <div class="container">
        <div class="cesiumBox" ref="cesiumBox"></div>
        <!-- 经纬度面板信息 -->
        <div class="info-panel" v-if="clickPosition">
            <h3>点击位置信息</h3>
            <div>经度: {{ clickPosition.lng.toFixed(4) }}</div>
            <div>纬度: {{ clickPosition.lat.toFixed(4) }}</div>
            <div>高度: {{ clickPosition.height.toFixed(1) }} 米</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// 从环境变量获取Token
const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN;//从环境变量获取Cesium Token
const cesiumBox = ref<HTMLDivElement | null>(null);//Cesium容器元素
const viewer = ref<Cesium.Viewer | null>(null);//Cesium viewer 实例  初始化时为null

// 点击位置信息
const clickPosition = ref<{
    lng: number;
    lat: number;
    height: number;
} | null>(null);

// 鼠标当前位置
const mousePosition = reactive({
    lng: 0,
    lat: 0
});

// Cesium地图初始化
const initCesium = () => {
    if (!cesiumBox.value) {
        console.error('Cesium container not found');
        return;
    }

    // 1. 设置Token（如果存在）
    if (cesiumToken) {
        Cesium.Ion.defaultAccessToken = cesiumToken;
        console.log('Cesium Token 已设置');
    } else {
        console.warn('Cesium Token 未找到，将使用受限访问');
    }

    viewer.value = new Cesium.Viewer(cesiumBox.value, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: true,  // 开启全屏
        geocoder: false,
        timeline: false,
        sceneModePicker: true,   // 开启2D/3D切 换
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: true, // 开启选择指示器
        shouldAnimate: true
    });

    // 5. 设置初始视角
    viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 2000)
    });
};

// 加载点位信息
const loadCDBuilding = () => {
    if (!viewer.value) {
        console.error('Cesium viewer 未初始化');
        return;
    }

    // 添加点实体
    const entity = viewer.value.entities.add({
        name: '成都',
        position: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 0),
        point: {
            pixelSize: 20,  // 增大点的大小
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
        },
        // 添加标签
        label: {
            text: '成都',
            font: '16px sans-serif',
            pixelOffset: new Cesium.Cartesian2(0, -30)
        }
    });

    console.log('成都点位已添加:', entity);
};

onMounted(() => {
    initCesium();
    loadCDBuilding();
});

onUnmounted(() => {
    // 组件卸载时销毁Cesium viewer
    console.log('Cesium viewer 已销毁');
    if (viewer.value) {
        viewer.value.destroy();
        viewer.value = null;
    }
});
</script>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;

    .cesiumBox {
        width: 100%;
        height: 100%;
    }
}
</style>