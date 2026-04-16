# Cesium | Three.js | ECharts Demo

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-blue?style=for-the-badge&logo=cloudflare)](https://threejs-cesium-stream.pages.dev)
[![中文文档](https://img.shields.io/badge/文档-中文-blue)](README.zh-CN.md)

A front-end visualization learning project built with **Vue 3 + TypeScript + Vite**, integrating multiple mainstream visualization tech stacks covering 3D globe, 3D scenes, data charts, real-time communication, and low-code editor.

## Tech Stack

- **Framework**: Vue 3 + TypeScript + Pinia + Vue Router
- **Build**: Vite + SCSS
- **Visualization**: Cesium (3D Globe), Three.js (3D Scenes), ECharts (Data Charts)
- **UI**: Element Plus
- **Communication**: WebSocket / SSE real-time data push

## Page Preview

### Home

![Home](src/assets/home.png)

### Cesium — 3D Globe Visualization

![Cesium 1](src/assets/cesium.png)
![Cesium 2](src/assets/cesium2.png)
![Cesium 3](src/assets/cesium3.png)

### Three.js — 3D Scene Rendering

![Three.js](src/assets/threejs.png)

### ECharts — Data Dashboard

![ECharts](src/assets/dp.png)

### WebSocket — Real-time Data Dashboard

Aviation situation awareness dashboard based on WebSocket/SSE real-time data push, featuring flight statistics donut charts, route bar charts, city rankings, and real-time dynamic lists.

### Low-Code Editor

A drag-and-drop visual editor supporting ECharts charts, data tables, text blocks, and image components. Features include component layering, canvas zoom, undo/redo, and publish/preview.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

> Requires Node.js >= 20.19.0
