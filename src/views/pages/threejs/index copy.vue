<template>
    <div class="container">
        <h1>Threejs专区</h1>
        <div class="threejsBox" ref="threejsBox"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * 渲染流程：
 * 1. 创建场景 scene
 * 2. 创建相机 camera
 * 3. 创建渲染器 renderer
 * 4. 渲染场景 scene camera renderer
 */
const threejsBox = ref<HTMLDivElement | null>(null);
// 渲染器实例
const renderer = ref<THREE.WebGLRenderer | null>(null);
// 轨道控制器实例
const controls = ref<OrbitControls | null>(null);
// 动画ID
let animationId: number | null = null;

const init = () => {
    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5); // 设置相机位置
    camera.lookAt(0, 0, 0); // 看向中心点

    // 创建渲染器
    renderer.value = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
    renderer.value.setSize(window.innerWidth, window.innerHeight);
    renderer.value.setClearColor(0x2c3e50, 1); // 深色背景

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial(); // 使用法向材质，可看到不同面
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 添加坐标轴辅助（方便观察）
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 添加网格辅助
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // 添加轨道控制器
    if (renderer.value) {
        controls.value = new OrbitControls(camera, renderer.value.domElement);
        controls.value.enableDamping = true; // 启用阻尼（惯性效果）
        controls.value.dampingFactor = 0.05; // 阻尼系数
        controls.value.screenSpacePanning = false; // 禁用屏幕空间平移
        controls.value.minDistance = 2; // 最小缩放距离
        controls.value.maxDistance = 20; // 最大缩放距离
        controls.value.maxPolarAngle = Math.PI; // 限制垂直旋转角度
    }

    // 将渲染器添加到容器
    if (threejsBox.value && renderer.value) {
        threejsBox.value.appendChild(renderer.value.domElement);
    }

    // 动画循环函数
    const animate = () => {
        animationId = requestAnimationFrame(animate);

        // 更新轨道控制器
        if (controls.value) {
            controls.value.update();
        }

        // 渲染场景
        if (renderer.value) {
            renderer.value.render(scene, camera);
        }
    };

    // 开始动画循环
    animate();

    // 窗口大小变化处理
    const handleResize = () => {
        if (renderer.value && camera) {
            // 更新相机宽高比
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            // 更新渲染器大小
            renderer.value.setSize(window.innerWidth, window.innerHeight);

            // 重新渲染
            renderer.value.render(scene, camera);
        }
    };

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 组件卸载时移除监听
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });
};

onMounted(() => {
    init();
});

onUnmounted(() => {
    // 组件卸载时清理资源
    console.log('Threejs 组件 已销毁');

    // 停止动画循环
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    // 销毁轨道控制器
    if (controls.value) {
        controls.value.dispose();
        controls.value = null;
    }

    // 销毁渲染器
    if (renderer.value) {
        renderer.value.dispose();
        renderer.value.forceContextLoss();
        renderer.value = null;
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
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    h1 {
        position: absolute;
        top: 20px;
        left: 20px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 24px;
        margin: 0;
        z-index: 10;
    }

    .threejsBox {
        width: 100%;
        height: 100%;

        canvas {
            display: block;
        }
    }
}
</style>