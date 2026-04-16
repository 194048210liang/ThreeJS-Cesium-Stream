# Cesium | Three.js | ECharts 演示

[![在线演示](https://img.shields.io/badge/演示-在线预览-blue?style=for-the-badge&logo=cloudflare)](https://threejs-cesium-stream.pages.dev)
[![English](https://img.shields.io/badge/文档-English-blue)](README.en.md)

基于 **Vue 3 + TypeScript + Vite** 构建的前端可视化学习项目，集成了多种主流可视化技术栈，涵盖 3D 地球、3D 场景、数据图表、实时通信、低代码编辑器等方向。

## 技术栈

- **框架**：Vue 3 + TypeScript + Pinia + Vue Router
- **构建**：Vite + SCSS
- **可视化**：Cesium（3D 地球）、Three.js（3D 场景）、ECharts（数据图表）
- **UI**：Element Plus
- **通信**：WebSocket / SSE 实时数据推送

## 页面预览

### 主页

![主页](src/assets/home.png)

### Cesium — 3D 地球可视化

![Cesium 1](src/assets/cesium.png)
![Cesium 2](src/assets/cesium2.png)
![Cesium 3](src/assets/cesium3.png)

### Three.js — 3D 场景渲染

![Three.js](src/assets/threejs.png)

### ECharts — 数据图表面板

![ECharts](src/assets/dp.png)

### WebSocket — 实时数据大屏

基于 WebSocket/SSE 实时数据推送的航空态势监控大屏，包含航班统计环形图、航线柱状图、城市排名、实时动态列表等模块。

### 低代码编辑器

支持拖拽的可视化编辑器，内置 ECharts 图表、数据表格、文本块、图片组件。支持组件层级管理、画布缩放、撤销重做、发布预览。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

> 需要 Node.js >= 20.19.0
